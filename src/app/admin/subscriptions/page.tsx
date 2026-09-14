import type { Metadata } from 'next';

import { CancelSubscriptionButton } from '@/components/admin/subscription-actions';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Repeat } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
import { SUBSCRIPTION_STATUS } from '@/lib/status';
import { formatDate, formatPrice } from '@/lib/utils';
import type { CustomerRow, SubscriptionRow } from '@/types/database';

export const metadata: Metadata = { title: 'Subscriptions', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminSubscriptionsPage() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: subscriptions } = (await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)) as { data: SubscriptionRow[] | null };
  const { data: customers } = (await supabase.from('customers').select('*')) as { data: CustomerRow[] | null };
  const customerMap = new Map((customers ?? []).map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description="Recurring monthly plans." />
      {!subscriptions || subscriptions.length === 0 ? (
        <EmptyState icon={Repeat} title="No subscriptions yet" description="Subscriptions begin once a customer's website goes live." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Renews</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium text-charcoal-900">
                    {customerMap.get(sub.customer_id)?.business_name ?? '—'}
                  </TableCell>
                  <TableCell>{formatPrice(sub.amount_pence)}/mo</TableCell>
                  <TableCell>
                    <Badge variant={SUBSCRIPTION_STATUS[sub.status].variant} size="sm">
                      {SUBSCRIPTION_STATUS[sub.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-charcoal-500">
                    {sub.current_period_end ? formatDate(sub.current_period_end) : '—'}
                  </TableCell>
                  <TableCell>{sub.status === 'active' && <CancelSubscriptionButton subscriptionId={sub.id} />}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
