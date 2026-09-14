import { NextResponse } from 'next/server';

import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { createServerSupabase } from '@/lib/supabase/server';
import { fieldErrors, signInSchema } from '@/lib/validation/schemas';

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = checkRateLimit(`login:${ip}`, { limit: 10, windowMs: 10 * 60_000 });
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

  const parsed = signInSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check your email and password.', fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Sign in is not available yet — Supabase is not configured on this deployment.' },
      { status: 503 },
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    const message =
      error.message === 'Email not confirmed'
        ? 'Please confirm your email address before logging in — check your inbox for the link we sent.'
        : 'That email and password combination doesn’t match our records.';
    return NextResponse.json({ error: message }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  return NextResponse.json({
    data: { redirectTo: profile?.role === 'admin' ? '/admin' : '/dashboard' },
  });
}
