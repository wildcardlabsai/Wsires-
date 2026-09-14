import { NextResponse } from 'next/server';

import { handleRoute, requireApiAdmin } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    await requireApiAdmin();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { error } = await supabase.from('customers').update({ status: 'active' }).eq('id', id);
    if (error) return NextResponse.json({ error: 'Could not reactivate this account.' }, { status: 500 });

    await supabase.from('websites').update({ status: 'live' }).eq('customer_id', id).eq('status', 'suspended');

    return NextResponse.json({ data: { ok: true } });
  });
}
