import type { Metadata } from 'next';
import { ShoppingBag } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { requireAdmin } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
import { ORDER_STATUS } from '@/lib/status';
import { formatDate, formatPrice } from '@/lib/utils';
import type { CustomerRow, OrderRow } from '@/types/database';

export const metadata: Metadata = { title: 'Orders', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: orders } = (await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)) as { data: OrderRow[] | null };
  const { data: customers } = (await supabase.from('customers').select('*')) as { data: CustomerRow[] | null };
  const customerMap = new Map((customers ?? []).map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Setup fees and one-off payments." />
      {!orders || orders.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No orders yet" description="Orders appear here once a customer pays a setup fee." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-charcoal-900">{order.reference}</TableCell>
                  <TableCell className="text-charcoal-600">{customerMap.get(order.customer_id)?.business_name ?? '—'}</TableCell>
                  <TableCell className="capitalize text-charcoal-600">{order.kind}</TableCell>
                  <TableCell className="font-medium text-charcoal-900">{formatPrice(order.amount_pence)}</TableCell>
                  <TableCell>
                    <Badge variant={ORDER_STATUS[order.status].variant} size="sm">
                      {ORDER_STATUS[order.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-charcoal-500">{formatDate(order.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
