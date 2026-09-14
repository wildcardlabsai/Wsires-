import { NextResponse } from 'next/server';

import { env } from '@/lib/env';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { createServerSupabase } from '@/lib/supabase/server';
import { fieldErrors, resetRequestSchema } from '@/lib/validation/schemas';

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = checkRateLimit(`forgot:${ip}`, { limit: 5, windowMs: 15 * 60_000 });
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a few minutes and try again.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = resetRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Enter a valid email address.', fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: 'This is not available yet — Supabase is not configured on this deployment.' },
      { status: 503 },
    );
  }

  /* Always return success — never reveal whether an email address has an account. */
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${env.siteUrl}/auth/callback?next=${encodeURIComponent('/reset-password')}`,
  });

  return NextResponse.json({ data: { ok: true } });
}
