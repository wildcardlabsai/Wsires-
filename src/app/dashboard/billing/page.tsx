import type { Metadata } from 'next';
import { CreditCard, Download } from 'lucide-react';

import { BillingActions } from '@/components/dashboard/billing-actions';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { requireCustomer } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
import { PAYMENT_STATUS, SUBSCRIPTION_STATUS } from '@/lib/status';
import { formatDate, formatPrice } from '@/lib/utils';
import type { PaymentRow, PlanRow, SubscriptionRow } from '@/types/database';

export const metadata: Metadata = { title: 'Billing', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const { customer } = await requireCustomer();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: subscription } = (await supabase
    .from('subscriptions')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: SubscriptionRow | null };

  const { data: payments } = (await supabase
    .from('payments')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .limit(20)) as { data: PaymentRow[] | null };

  const { data: plan } = customer.plan_id
    ? ((await supabase.from('plans').select('*').eq('id', customer.plan_id).maybeSingle()) as {
        data: PlanRow | null;
      })
    : { data: null };

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="Your plan, payment method and invoices." />

      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-400">Current plan</p>
            <div className="mt-2 flex items-center gap-3">
              <h2 className="text-lg font-semibold text-charcoal-900">{plan?.name ?? 'No plan selected'}</h2>
              {subscription && (
                <Badge variant={SUBSCRIPTION_STATUS[subscription.status].variant}>
                  {SUBSCRIPTION_STATUS[subscription.status].label}
                </Badge>
              )}
            </div>
            {plan && (
              <p className="mt-1 text-sm text-charcoal-500">{formatPrice(plan.monthly_price_pence)} / month</p>
            )}
            {subscription?.current_period_end && (
              <p className="mt-1 text-xs text-charcoal-400">
                {subscription.cancel_at_period_end ? 'Cancels' : 'Next billing date'}:{' '}
                {formatDate(subscription.current_period_end)}
              </p>
            )}
          </div>
          <BillingActions hasSubscription={Boolean(subscription)} />
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-charcoal-900">
          <CreditCard className="h-4 w-4 text-charcoal-400" aria-hidden />
          Payment history
        </h3>
        {!payments || payments.length === 0 ? (
          <EmptyState compact title="No payments yet" description="Your payment history will appear here once your first invoice is processed." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-white shadow-subtle">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.paid_at ?? payment.created_at)}</TableCell>
                    <TableCell>{payment.description ?? 'Payment'}</TableCell>
                    <TableCell className="font-medium text-charcoal-900">{formatPrice(payment.amount_pence)}</TableCell>
                    <TableCell>
                      <Badge variant={PAYMENT_STATUS[payment.status].variant} size="sm">
                        {PAYMENT_STATUS[payment.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.invoice_url && (
                        <a
                          href={payment.invoice_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-cymru-700 hover:underline"
                        >
                          <Download className="h-3 w-3" /> Invoice
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
