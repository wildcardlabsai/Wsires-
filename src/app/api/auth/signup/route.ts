import { NextResponse } from 'next/server';

import { sendAdminOrderNotification, sendWelcomeEmail } from '@/lib/email/templates';
import { env } from '@/lib/env';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase/server';
import { fieldErrors, signUpSchema } from '@/lib/validation/schemas';

/**
 * Account creation.
 *
 * Creates the Supabase auth user (which triggers a `profiles` row via the
 * `handle_new_user` DB trigger), then creates the `customers` row using the
 * service role. We do that server-side rather than relying on the browser
 * session because Supabase may require email confirmation before a session
 * exists — the customer record must not depend on that.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = checkRateLimit(`signup:${ip}`, { limit: 8, windowMs: 15 * 60_000 });
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

  const parsed = signUpSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const data = parsed.data;

  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Sign up is not available yet — Supabase is not configured on this deployment.' },
      { status: 503 },
    );
  }

  const { data: signUpResult, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { full_name: data.fullName, phone: data.phone },
      emailRedirectTo: `${env.siteUrl}/auth/callback?next=${encodeURIComponent('/onboarding')}`,
    },
  });

  if (signUpError) {
    const message =
      signUpError.message?.includes('already registered') ||
      signUpError.code === 'user_already_exists'
        ? 'An account already exists with that email address. Try logging in instead.'
        : signUpError.message || 'We couldn’t create your account. Please try again.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const userId = signUpResult.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'We couldn’t create your account. Please try again.' }, { status: 500 });
  }

  const admin = createAdminSupabase();
  if (admin) {
    const { data: existingCustomer } = await admin
      .from('customers')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle();

    if (!existingCustomer) {
      let planId: string | null = null;
      if (data.planSlug) {
        const { data: plan } = await admin.from('plans').select('id').eq('slug', data.planSlug).maybeSingle();
        planId = plan?.id ?? null;
      }

      const { error: customerError } = await admin.from('customers').insert({
        profile_id: userId,
        business_name: data.businessName,
        contact_name: data.fullName,
        email: data.email,
        phone: data.phone ?? null,
        plan_id: planId,
      });

      if (customerError) {
        console.error('[signup] failed to create customer row', customerError);
      } else {
        void sendAdminOrderNotification({
          businessName: data.businessName,
          planName: data.planSlug ?? 'Not chosen yet',
          amountPence: 0,
          customerId: userId,
        }).catch(() => {});
      }
    }
  } else {
    console.warn('[signup] SUPABASE_SERVICE_ROLE_KEY not configured — customer row was not created');
  }

  void sendWelcomeEmail({ to: data.email, name: data.fullName, businessName: data.businessName }).catch(() => {});

  const needsEmailConfirmation = !signUpResult.session;
  const postAuthDestination = data.planSlug ? `/checkout?plan=${encodeURIComponent(data.planSlug)}` : '/onboarding';

  return NextResponse.json({
    data: {
      needsEmailConfirmation,
      redirectTo: needsEmailConfirmation ? '/signup/check-email' : postAuthDestination,
    },
  });
}
