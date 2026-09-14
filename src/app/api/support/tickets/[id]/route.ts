import { NextResponse } from 'next/server';

import { handleRoute, requireApiCustomer } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';
import { ticketReplySchema } from '@/lib/validation/schemas';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const { customer } = await requireApiCustomer();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .eq('customer_id', customer.id)
      .maybeSingle();

    if (!ticket) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });

    const { data: messages } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', id)
      .eq('is_internal', false)
      .order('created_at', { ascending: true });

    return NextResponse.json({ data: { ticket, messages: messages ?? [] } });
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const { actor, customer } = await requireApiCustomer();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = ticketReplySchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: 'Enter a message.' }, { status: 422 });

    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .eq('customer_id', customer.id)
      .maybeSingle();

    if (!ticket) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });

    const { error } = await supabase.from('support_messages').insert({
      ticket_id: id,
      author_id: actor.userId,
      author_role: 'customer',
      author_name: actor.profile.full_name ?? customer.contact_name,
      body: parsed.data.body,
      attachments: parsed.data.attachments,
    });

    if (error) return NextResponse.json({ error: 'Could not send your reply.' }, { status: 500 });

    /* Replying to a resolved ticket reopens it. */
    if (ticket.status === 'resolved') {
      await supabase.from('support_tickets').update({ status: 'open' }).eq('id', id);
    }

    return NextResponse.json({ data: { ok: true } });
  });
}
