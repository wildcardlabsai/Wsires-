import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminTicketThread } from '@/components/admin/admin-ticket-thread';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
import { TICKET_CATEGORY_LABELS, TICKET_STATUS } from '@/lib/status';
import type { CustomerRow, SupportMessageRow, SupportTicketRow } from '@/types/database';

export const metadata: Metadata = { title: 'Support ticket', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: ticket } = (await supabase.from('support_tickets').select('*').eq('id', id).maybeSingle()) as {
    data: SupportTicketRow | null;
  };
  if (!ticket) notFound();

  const [messagesResult, customerResult] = await Promise.all([
    supabase.from('support_messages').select('*').eq('ticket_id', id).order('created_at', { ascending: true }),
    supabase.from('customers').select('*').eq('id', ticket.customer_id).maybeSingle(),
  ]);
  const messages = (messagesResult.data ?? []) as SupportMessageRow[];
  const customer = customerResult.data as CustomerRow | null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket.subject}
        eyebrow={`#${ticket.reference} · ${TICKET_CATEGORY_LABELS[ticket.category]}`}
        actions={<Badge variant={TICKET_STATUS[ticket.status].variant}>{TICKET_STATUS[ticket.status].label}</Badge>}
      />

      {customer && (
        <Link
          href={`/admin/customers/${customer.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-cymru-700 hover:underline"
        >
          {customer.business_name} →
        </Link>
      )}

      <Card>
        <CardContent className="p-6">
          <AdminTicketThread ticketId={ticket.id} messages={messages} status={ticket.status} />
        </CardContent>
      </Card>
    </div>
  );
}
