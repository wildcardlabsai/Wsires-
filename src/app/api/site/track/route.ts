import { NextResponse } from 'next/server';

import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { createAdminSupabase } from '@/lib/supabase/server';

/**
 * Cookie-free pageview beacon for customer websites. No tracking cookie is
 * set — a random per-load session id is generated client-side purely to
 * dedupe "sessions" from "pageviews" in the daily rollup, and is never
 * linked back to a person.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = checkRateLimit(`track:${ip}`, { limit: 120, windowMs: 60_000 });
  if (!limit.success) return NextResponse.json({ data: { ok: true } });

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload.websiteId !== 'string' || typeof payload.path !== 'string') {
    return NextResponse.json({ data: { ok: true } });
  }

  const admin = createAdminSupabase();
  if (!admin) return NextResponse.json({ data: { ok: true } });

  await admin.from('analytics_events').insert({
    website_id: payload.websiteId,
    event_type: 'pageview',
    path: String(payload.path).slice(0, 400),
    page_title: typeof payload.title === 'string' ? payload.title.slice(0, 200) : null,
    referrer: typeof payload.referrer === 'string' ? payload.referrer.slice(0, 400) : null,
    source: classifySource(payload.referrer),
    session_id: typeof payload.sessionId === 'string' ? payload.sessionId.slice(0, 64) : null,
    locale: payload.locale === 'cy' ? 'cy' : 'en',
  });

  return NextResponse.json({ data: { ok: true } });
}

function classifySource(referrer: unknown): string {
  if (typeof referrer !== 'string' || !referrer) return 'direct';
  try {
    const host = new URL(referrer).hostname;
    if (/google|bing|duckduckgo|yahoo/i.test(host)) return 'search';
    if (/facebook|instagram|twitter|x\.com|linkedin|tiktok/i.test(host)) return 'social';
    return 'referral';
  } catch {
    return 'direct';
  }
}
