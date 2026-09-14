import { NextResponse } from 'next/server';
import { z } from 'zod';

import { handleRoute, requireApiAdmin } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';

const schema = z.object({ languageMode: z.enum(['en', 'cy', 'bilingual']) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    await requireApiAdmin();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = schema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid language mode.' }, { status: 422 });

    const { error } = await supabase
      .from('websites')
      .update({ language_mode: parsed.data.languageMode })
      .eq('id', id);

    if (error) return NextResponse.json({ error: 'Could not update language.' }, { status: 500 });
    return NextResponse.json({ data: { ok: true } });
  });
}
