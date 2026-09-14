import { NextResponse } from 'next/server';
import { z } from 'zod';

import { handleRoute, requireApiUser } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';
import { passwordSchema } from '@/lib/validation/schemas';

const schema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: passwordSchema,
});

export async function POST(request: Request) {
  return handleRoute(async () => {
    const actor = await requireApiUser();
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid data.' }, { status: 422 });
    }

    /* Re-authenticate with the current password before allowing a change. */
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: actor.email,
      password: parsed.data.currentPassword,
    });
    if (verifyError) {
      return NextResponse.json({ error: 'Your current password is incorrect.' }, { status: 401 });
    }

    const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
    if (error) return NextResponse.json({ error: error.message || 'Could not update your password.' }, { status: 400 });

    return NextResponse.json({ data: { ok: true } });
  });
}
