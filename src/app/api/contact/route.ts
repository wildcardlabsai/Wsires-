import { NextResponse } from 'next/server';

import { sendAdminContactNotification } from '@/lib/email/templates';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { createAdminSupabase } from '@/lib/supabase/server';
import { contactSchema, fieldErrors } from '@/lib/validation/schemas';

/**
 * Public contact form.
 *
 * Writes to contact_submissions with the service role (the table is
 * admin-only under RLS, and an anonymous visitor has no session), then
 * notifies the CymruSites inbox.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = checkRateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60_000 });

  if (!limit.success) {
    return NextResponse.json(
      {
        error: `That’s a few messages in a short time. Please try again in ${Math.ceil(
          limit.retryAfterSeconds / 60,
        )} minutes, or email us directly.`,
      },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const data = parsed.data;

  /* Honeypot filled in — accept silently so bots learn nothing. */
  if (data.company_website) {
    return NextResponse.json({ data: { received: true } }, { status: 200 });
  }

  const supabase = createAdminSupabase();

  if (supabase) {
    const { error } = await supabase.from('contact_submissions').insert({
      name: data.name,
      business_name: data.businessName ?? null,
      email: data.email,
      phone: data.phone ?? null,
      business_type: data.businessType ?? null,
      current_website: data.currentWebsite ?? null,
      requirement: data.requirement ?? null,
      budget: data.budget ?? null,
      message: data.message,
      source: 'contact_page',
    });

    if (error) {
      console.error('[contact] failed to store submission', error);
      /* Still try to email — losing the enquiry entirely is the worse outcome. */
      const emailResult = await sendAdminContactNotification({
        name: data.name,
        email: data.email,
        businessName: data.businessName,
        phone: data.phone,
        businessType: data.businessType,
        budget: data.budget,
        message: data.message,
      });

      if (!emailResult.sent) {
        return NextResponse.json(
          {
            error:
              'We couldn’t save your message. Please email hello@cymrusites.co.uk directly and we’ll pick it up.',
          },
          { status: 500 },
        );
      }
      return NextResponse.json({ data: { received: true } });
    }
  } else {
    console.warn('[contact] SUPABASE_SERVICE_ROLE_KEY not configured — enquiry stored by email only');
  }

  await sendAdminContactNotification({
    name: data.name,
    email: data.email,
    businessName: data.businessName,
    phone: data.phone,
    businessType: data.businessType,
    budget: data.budget,
    message: data.message,
  });

  return NextResponse.json({ data: { received: true } });
}
