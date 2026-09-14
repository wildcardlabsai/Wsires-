import { NextResponse } from 'next/server';

import { createServerSupabase } from '@/lib/supabase/server';
import { fieldErrors, resetPasswordSchema } from '@/lib/validation/schemas';

/** Called from /reset-password once the user has a recovery session (via /auth/callback). */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) },
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Your password reset link has expired. Please request a new one.' },
      { status: 401 },
    );
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return NextResponse.json({ error: error.message || 'We couldn’t update your password.' }, { status: 400 });
  }

  return NextResponse.json({ data: { ok: true } });
}
