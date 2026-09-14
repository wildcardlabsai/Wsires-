import { NextResponse } from 'next/server';

import { handleRoute, requireApiAdmin } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';
import { adminNoteSchema } from '@/lib/validation/schemas';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const actor = await requireApiAdmin();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = adminNoteSchema.safeParse({ ...payload, customerId: id });
    if (!parsed.success) return NextResponse.json({ error: 'Enter a note.' }, { status: 422 });

    const { data: note, error } = await supabase
      .from('admin_notes')
      .insert({
        customer_id: id,
        author_id: actor.userId,
        author_name: actor.profile.full_name ?? actor.email,
        body: parsed.data.body,
      })
      .select('*')
      .single();

    if (error || !note) return NextResponse.json({ error: 'Could not save your note.' }, { status: 500 });
    return NextResponse.json({ data: { note } }, { status: 201 });
  });
}
