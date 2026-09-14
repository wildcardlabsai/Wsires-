import { NextResponse } from 'next/server';

import { handleRoute, requireApiAdmin } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';
import { settingUpdateSchema } from '@/lib/validation/schemas';

export async function POST(request: Request) {
  return handleRoute(async () => {
    const actor = await requireApiAdmin();
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = settingUpdateSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request.' }, { status: 422 });

    const { error } = await supabase.from('settings').upsert(
      {
        key: parsed.data.key,
        value: parsed.data.value as never,
        group_name: parsed.data.groupName ?? 'content',
        updated_by: actor.userId,
      },
      { onConflict: 'key' },
    );

    if (error) return NextResponse.json({ error: 'Could not save that setting.' }, { status: 500 });
    return NextResponse.json({ data: { ok: true } });
  });
}
