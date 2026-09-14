import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { TicketThread } from '@/components/dashboard/ticket-thread';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { requireCustomer } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
import { TICKET_CATEGORY_LABELS, TICKET_STATUS } from '@/lib/status';
import type { SupportMessageRow, SupportTicketRow } from '@/types/database';

export const metadata: Metadata = { title: 'Support ticket', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { customer } = await requireCustomer();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: ticket } = (await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', id)
    .eq('customer_id', customer.id)
    .maybeSingle()) as { data: SupportTicketRow | null };

  if (!ticket) notFound();

  const { data: messages } = (await supabase
    .from('support_messages')
    .select('*')
    .eq('ticket_id', id)
    .eq('is_internal', false)
    .order('created_at', { ascending: true })) as { data: SupportMessageRow[] | null };

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket.subject}
        eyebrow={`#${ticket.reference} · ${TICKET_CATEGORY_LABELS[ticket.category]}`}
        actions={<Badge variant={TICKET_STATUS[ticket.status].variant}>{TICKET_STATUS[ticket.status].label}</Badge>}
      />

      <Card>
        <CardContent className="p-6">
          <TicketThread ticketId={ticket.id} messages={messages ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
