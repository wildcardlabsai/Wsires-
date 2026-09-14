import { NextResponse } from 'next/server';
import { z } from 'zod';

import { handleRoute, requireApiCustomer } from '@/lib/auth/api';
import { sendChangesRequestedEmail } from '@/lib/email/templates';
import { createServerSupabase } from '@/lib/supabase/server';

const schema = z.object({ summary: z.string().trim().min(10, 'Tell us a bit more about what you’d like changed.').max(4000) });

export async function POST(request: Request) {
  return handleRoute(async () => {
    const { actor, customer } = await requireApiCustomer();
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 422 });
    }

    const { data: website } = await supabase
      .from('websites')
      .select('id, status')
      .eq('customer_id', customer.id)
      .in('status', ['awaiting_customer_approval', 'live', 'approved'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!website) {
      return NextResponse.json({ error: 'No website found to request changes on.' }, { status: 404 });
    }

    const nextStatus = website.status === 'awaiting_customer_approval' ? 'changes_requested' : website.status;

    const [{ error: crError }, { error: statusError }] = await Promise.all([
      supabase.from('content_change_requests').insert({
        website_id: website.id,
        customer_id: customer.id,
        submitted_by: actor.userId,
        target_table: 'websites',
        summary: parsed.data.summary,
        changes: { note: parsed.data.summary },
      }),
      website.status === 'awaiting_customer_approval'
        ? supabase.from('websites').update({ status: nextStatus }).eq('id', website.id)
        : Promise.resolve({ error: null }),
    ]);

    if (crError || statusError) {
      return NextResponse.json({ error: 'Could not submit your request.' }, { status: 500 });
    }

    void sendChangesRequestedEmail({ to: customer.email, name: customer.contact_name, summary: parsed.data.summary }).catch(
      () => {},
    );

    return NextResponse.json({ data: { ok: true } });
  });
}
