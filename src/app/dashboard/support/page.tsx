import type { Metadata } from 'next';
import Link from 'next/link';
import { LifeBuoy } from 'lucide-react';

import { NewTicketDialog } from '@/components/dashboard/new-ticket-dialog';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { requireCustomer } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
import { TICKET_CATEGORY_LABELS, TICKET_STATUS } from '@/lib/status';
import { formatRelative } from '@/lib/utils';
import type { SupportTicketRow } from '@/types/database';

export const metadata: Metadata = { title: 'Support', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function SupportPage() {
  const { customer } = await requireCustomer();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: tickets } = (await supabase
    .from('support_tickets')
    .select('*')
    .eq('customer_id', customer.id)
    .order('last_message_at', { ascending: false })) as { data: SupportTicketRow[] | null };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support"
        description="Need something changed or fixed? Raise a request and we’ll reply within one working day."
        actions={<NewTicketDialog />}
      />

      {!tickets || tickets.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No support tickets"
          description="When you need something changed or you run into a problem, raise a request here."
          action={{ label: 'New request', href: '#' }}
        />
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/dashboard/support/${ticket.id}`}>
              <Card className="transition-shadow hover:shadow-card">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-charcoal-900">{ticket.subject}</p>
                      <span className="shrink-0 text-xs text-charcoal-400">#{ticket.reference}</span>
                    </div>
                    <p className="mt-1 text-xs text-charcoal-500">
                      {TICKET_CATEGORY_LABELS[ticket.category]} · {formatRelative(ticket.last_message_at)}
                    </p>
                  </div>
                  <Badge variant={TICKET_STATUS[ticket.status].variant} className="shrink-0">
                    {TICKET_STATUS[ticket.status].label}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
