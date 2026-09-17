import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { sendAdminContactNotification } from '@/lib/email/templates';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { contactSchema, fieldErrors } from '@/lib/validation/schemas';

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(`contact:${clientIp(request)}`, { limit: 5, windowMs: 60_000 });
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many messages sent. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  let input;
  try {
    input = contactSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Please check the form and try again.', fields: fieldErrors(error) }, { status: 400 });
    }
    throw error;
  }

  /* Honeypot — a real visitor never fills this in. */
  if (input.company_website) {
    return NextResponse.json({ ok: true });
  }

  const result = await sendAdminContactNotification({
    name: input.name,
    email: input.email,
    businessName: input.businessName,
    phone: input.phone,
    businessType: input.businessType,
    budget: input.budget,
    message: input.message,
  });

  if (!result.sent && !result.skipped) {
    return NextResponse.json(
      { error: 'We could not send your message. Please email us directly instead.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
