import { NextResponse } from 'next/server';

import { handleRoute, requireApiCustomer } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const { customer } = await requireApiCustomer();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { data: media } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .eq('customer_id', customer.id)
      .maybeSingle();

    if (!media) return NextResponse.json({ error: 'File not found.' }, { status: 404 });

    await supabase.storage.from(media.bucket).remove([media.storage_path]);
    const { error } = await supabase.from('media').delete().eq('id', id);

    if (error) return NextResponse.json({ error: 'Could not delete that file.' }, { status: 500 });
    return NextResponse.json({ data: { ok: true } });
  });
}
