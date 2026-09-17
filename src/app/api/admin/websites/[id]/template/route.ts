import { NextResponse } from 'next/server';
import { z } from 'zod';

import { handleRoute, requireApiAdmin } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';

const schema = z.object({ templateId: z.string().uuid().nullable() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    await requireApiAdmin();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = schema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid template.' }, { status: 422 });

    const { error } = await supabase
      .from('websites')
      .update({ template_id: parsed.data.templateId })
      .eq('id', id);

    if (error) return NextResponse.json({ error: 'Could not update template.' }, { status: 500 });
    return NextResponse.json({ data: { ok: true } });
  });
}
