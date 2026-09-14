import { NextResponse } from 'next/server';

import { handleRoute, requireApiCustomer } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';
import { leadUpdateSchema } from '@/lib/validation/schemas';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const { customer } = await requireApiCustomer();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = leadUpdateSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request.' }, { status: 422 });

    const update: Record<string, unknown> = {};
    if (parsed.data.status) {
      update.status = parsed.data.status;
      if (parsed.data.status === 'contacted') update.contacted_at = new Date().toISOString();
    }
    if (parsed.data.notes !== undefined) update.notes = parsed.data.notes;

    const { data, error } = await supabase
      .from('leads')
      .update(update)
      .eq('id', id)
      .eq('customer_id', customer.id)
      .select('*')
      .maybeSingle();

    if (error || !data) return NextResponse.json({ error: 'Could not update that enquiry.' }, { status: 500 });
    return NextResponse.json({ data: { lead: data } });
  });
}
