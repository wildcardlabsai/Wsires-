import { NextResponse } from 'next/server';
import { z } from 'zod';

import { handleRoute, requireApiUser } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';
import { optionalPhone } from '@/lib/validation/schemas';

const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your name').max(120),
  phone: optionalPhone,
});

export async function PATCH(request: Request) {
  return handleRoute(async () => {
    const actor = await requireApiUser();
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = profileSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid data.' }, { status: 422 });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: parsed.data.fullName, phone: parsed.data.phone ?? null })
      .eq('id', actor.userId);

    if (error) return NextResponse.json({ error: 'Could not save your profile.' }, { status: 500 });
    return NextResponse.json({ data: { ok: true } });
  });
}
