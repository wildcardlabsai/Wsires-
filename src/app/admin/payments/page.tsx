import type { Metadata } from 'next';
import { CreditCard } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { requireAdmin } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
import { PAYMENT_STATUS } from '@/lib/status';
import { formatDate, formatPrice } from '@/lib/utils';
import type { CustomerRow, PaymentRow } from '@/types/database';

export const metadata: Metadata = { title: 'Payments', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: payments } = (await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)) as { data: PaymentRow[] | null };
  const { data: customers } = (await supabase.from('customers').select('*')) as { data: CustomerRow[] | null };
  const customerMap = new Map((customers ?? []).map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Every payment processed through Stripe." />
      {!payments || payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments yet" description="Payments will appear here once Stripe is connected and customers start paying." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium text-charcoal-900">
                    {customerMap.get(payment.customer_id)?.business_name ?? '—'}
                  </TableCell>
                  <TableCell className="text-charcoal-600">{payment.description ?? '—'}</TableCell>
                  <TableCell className="font-medium text-charcoal-900">{formatPrice(payment.amount_pence)}</TableCell>
                  <TableCell>
                    <Badge variant={PAYMENT_STATUS[payment.status].variant} size="sm">
                      {PAYMENT_STATUS[payment.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-charcoal-500">{formatDate(payment.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
