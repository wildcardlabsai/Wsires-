import { NextResponse } from 'next/server';

import { sendNewLeadEmail } from '@/lib/email/templates';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { createAdminSupabase } from '@/lib/supabase/server';
import { siteEnquirySchema } from '@/lib/validation/schemas';

/**
 * Contact form submission from a customer's public website (any tenant:
 * custom domain, subdomain, preview or demo). Always uses the service role,
 * since the visitor has no session and leads belong to the site's owner —
 * not to whoever happens to be filling in the form.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = checkRateLimit(`enquiry:${ip}`, { limit: 8, windowMs: 10 * 60_000 });
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many messages sent recently. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = siteEnquirySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the highlighted fields.' }, { status: 422 });
  }
  const data = parsed.data;

  /* Honeypot filled in — accept silently so bots learn nothing. */
  if (data.company_website) {
    return NextResponse.json({ data: { received: true } });
  }

  const admin = createAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: 'This site cannot receive messages right now.' }, { status: 503 });
  }

  const { data: website } = await admin
    .from('websites')
    .select('id, customer_id, name')
    .eq('id', data.websiteId)
    .maybeSingle();

  if (!website) {
    return NextResponse.json({ error: 'This website could not be found.' }, { status: 404 });
  }

  const { error } = await admin.from('leads').insert({
    customer_id: website.customer_id,
    website_id: website.id,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    message: data.message,
    service: data.service || null,
    source: 'website_contact_form',
    page_url: data.pageUrl || null,
  });

  if (error) {
    console.error('[site enquiry] failed to store lead', error);
    return NextResponse.json({ error: 'Could not send your message. Please try again.' }, { status: 500 });
  }

  await admin.from('analytics_events').insert({
    website_id: website.id,
    event_type: 'enquiry',
    path: data.pageUrl?.replace(/^https?:\/\/[^/]+/, '') || '/',
    source: 'direct',
  });

  const { data: customer } = await admin
    .from('customers')
    .select('email, contact_name')
    .eq('id', website.customer_id)
    .maybeSingle();

  if (customer) {
    void sendNewLeadEmail({
      to: customer.email,
      name: customer.contact_name,
      leadName: data.name,
      leadEmail: data.email,
      leadPhone: data.phone,
      message: data.message,
      websiteName: website.name,
    }).catch(() => {});
  }

  return NextResponse.json({ data: { received: true } });
}
