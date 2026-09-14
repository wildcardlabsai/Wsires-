import { NextResponse } from 'next/server';

import { handleRoute, requireApiCustomer } from '@/lib/auth/api';
import { sendAdminTicketNotification, sendTicketReceivedEmail } from '@/lib/email/templates';
import { createServerSupabase } from '@/lib/supabase/server';
import { fieldErrors, ticketCreateSchema } from '@/lib/validation/schemas';

export async function GET() {
  return handleRoute(async () => {
    const { customer } = await requireApiCustomer();
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('customer_id', customer.id)
      .order('last_message_at', { ascending: false });

    return NextResponse.json({ data: { tickets: data ?? [] } });
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const { actor, customer } = await requireApiCustomer();
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = ticketCreateSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }
    const data = parsed.data;

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        customer_id: customer.id,
        website_id: data.websiteId ?? null,
        subject: data.subject,
        category: data.category,
        created_by: actor.userId,
      })
      .select('*')
      .single();

    if (error || !ticket) {
      return NextResponse.json({ error: 'Could not create your support ticket.' }, { status: 500 });
    }

    const { error: messageError } = await supabase.from('support_messages').insert({
      ticket_id: ticket.id,
      author_id: actor.userId,
      author_role: 'customer',
      author_name: actor.profile.full_name ?? customer.contact_name,
      body: data.message,
      attachments: data.attachments,
    });

    if (messageError) {
      return NextResponse.json({ error: 'Could not save your message.' }, { status: 500 });
    }

    void sendTicketReceivedEmail({
      to: customer.email,
      name: customer.contact_name,
      reference: ticket.reference,
      subject: ticket.subject,
    }).catch(() => {});
    void sendAdminTicketNotification({
      businessName: customer.business_name,
      reference: ticket.reference,
      subject: ticket.subject,
      ticketId: ticket.id,
    }).catch(() => {});

    return NextResponse.json({ data: { ticket } }, { status: 201 });
  });
}
