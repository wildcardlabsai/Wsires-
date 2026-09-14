import { NextResponse } from 'next/server';

import { handleRoute, requireApiAdmin } from '@/lib/auth/api';
import { sendTicketReplyEmail } from '@/lib/email/templates';
import { createServerSupabase } from '@/lib/supabase/server';
import { ticketReplySchema } from '@/lib/validation/schemas';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    await requireApiAdmin();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const [{ data: ticket }, { data: messages }, { data: customer }] = await Promise.all([
      supabase.from('support_tickets').select('*').eq('id', id).maybeSingle(),
      supabase.from('support_messages').select('*').eq('ticket_id', id).order('created_at', { ascending: true }),
      supabase
        .from('support_tickets')
        .select('customer_id')
        .eq('id', id)
        .maybeSingle()
        .then(async (r) =>
          r.data
            ? supabase.from('customers').select('*').eq('id', r.data.customer_id).maybeSingle()
            : { data: null },
        ),
    ]);

    if (!ticket) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });

    return NextResponse.json({ data: { ticket, messages: messages ?? [], customer } });
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const actor = await requireApiAdmin();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = ticketReplySchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: 'Enter a message.' }, { status: 422 });

    const { data: ticket } = await supabase.from('support_tickets').select('*').eq('id', id).maybeSingle();
    if (!ticket) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });

    const { error } = await supabase.from('support_messages').insert({
      ticket_id: id,
      author_id: actor.userId,
      author_role: 'admin',
      author_name: actor.profile.full_name ?? 'CymruSites support',
      body: parsed.data.body,
      is_internal: parsed.data.isInternal,
      attachments: parsed.data.attachments,
    });

    if (error) return NextResponse.json({ error: 'Could not send reply.' }, { status: 500 });

    const nextStatus = parsed.data.status ?? (parsed.data.isInternal ? ticket.status : 'waiting_for_customer');
    await supabase
      .from('support_tickets')
      .update({ status: nextStatus, resolved_at: nextStatus === 'resolved' ? new Date().toISOString() : null })
      .eq('id', id);

    if (!parsed.data.isInternal) {
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', ticket.customer_id)
        .maybeSingle();
      if (customer) {
        void sendTicketReplyEmail({
          to: customer.email,
          name: customer.contact_name,
          reference: ticket.reference,
          subject: ticket.subject,
          preview: parsed.data.body,
          ticketId: ticket.id,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ data: { ok: true } });
  });
}
