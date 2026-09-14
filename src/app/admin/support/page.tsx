import type { Metadata } from 'next';
import Link from 'next/link';
import { LifeBuoy } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
import { TICKET_CATEGORY_LABELS, TICKET_STATUS } from '@/lib/status';
import { formatRelative } from '@/lib/utils';
import type { CustomerRow, SupportTicketRow } from '@/types/database';

export const metadata: Metadata = { title: 'Support', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminSupportPage() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: tickets } = (await supabase
    .from('support_tickets')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(200)) as { data: SupportTicketRow[] | null };
  const { data: customers } = (await supabase.from('customers').select('*')) as { data: CustomerRow[] | null };
  const customerMap = new Map((customers ?? []).map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <PageHeader title="Support" description="Every support request across all customers." />
      {!tickets || tickets.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="No support tickets" description="Customer support requests will appear here." />
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/admin/support/${ticket.id}`}>
              <Card className="transition-shadow hover:shadow-card">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-charcoal-900">{ticket.subject}</p>
                      <span className="shrink-0 text-xs text-charcoal-400">#{ticket.reference}</span>
                    </div>
                    <p className="mt-1 text-xs text-charcoal-500">
                      {customerMap.get(ticket.customer_id)?.business_name ?? '—'} · {TICKET_CATEGORY_LABELS[ticket.category]} · {formatRelative(ticket.last_message_at)}
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
