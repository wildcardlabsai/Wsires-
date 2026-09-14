import type { Metadata } from 'next';
import Link from 'next/link';
import { Globe, LifeBuoy, TrendingUp, Users } from 'lucide-react';

import {
  CustomersChart,
  MrrChart,
  RevenueChart,
  WebsiteStatusChart,
} from '@/components/admin/admin-charts';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth/session';
import {
  getAdminOverview,
  getCustomerGrowth,
  getMrrHistory,
  getRevenueHistory,
  getWebsiteStatusBreakdown,
} from '@/lib/admin/data';
import { createServerSupabase } from '@/lib/supabase/server';
import { PAYMENT_STATUS } from '@/lib/status';
import { formatDate, formatNumber, formatPrice, percentChange } from '@/lib/utils';
import type { PaymentRow, ProfileRow } from '@/types/database';

export const metadata: Metadata = { title: 'Admin dashboard', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const [overview, customerGrowth, revenue, mrrHistory, statusBreakdown, recentPaymentsResult, recentSignupsResult] =
    await Promise.all([
      getAdminOverview(supabase),
      getCustomerGrowth(supabase),
      getRevenueHistory(supabase),
      getMrrHistory(supabase),
      getWebsiteStatusBreakdown(supabase),
      supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false })
        .limit(6),
    ]);

  const recentPayments = recentPaymentsResult.data as PaymentRow[] | null;
  const recentSignups = recentSignupsResult.data as ProfileRow[] | null;
  const customerTrend = percentChange(overview.newCustomersThisMonth, overview.newCustomersLastMonth);

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="How CymruSites is doing right now." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total customers" value={formatNumber(overview.totalCustomers)} />
        <StatCard icon={Globe} label="Active websites" value={formatNumber(overview.activeWebsites)} />
        <StatCard icon={TrendingUp} label="Monthly recurring revenue" value={formatPrice(overview.mrrPence)} />
        <StatCard icon={LifeBuoy} label="Outstanding support" value={formatNumber(overview.outstandingSupportTickets)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-charcoal-400">In production</p>
          <p className="mt-2 text-xl font-semibold text-charcoal-900">{formatNumber(overview.inProduction)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-charcoal-400">Awaiting customer info</p>
          <p className="mt-2 text-xl font-semibold text-charcoal-900">{formatNumber(overview.awaitingInformation)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-charcoal-400">New customers (30d)</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-xl font-semibold text-charcoal-900">{formatNumber(overview.newCustomersThisMonth)}</p>
            {customerTrend !== null && (
              <span className={`text-xs font-medium ${customerTrend >= 0 ? 'text-moss-700' : 'text-red-600'}`}>
                {customerTrend >= 0 ? '+' : ''}
                {customerTrend}%
              </span>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly recurring revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <MrrChart data={mrrHistory} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New customers</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomersChart data={customerGrowth} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenue} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Website status</CardTitle>
          </CardHeader>
          <CardContent>
            <WebsiteStatusChart data={statusBreakdown} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent payments</CardTitle>
            <Link href="/admin/payments" className="text-xs font-medium text-cymru-700 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {!recentPayments || recentPayments.length === 0 ? (
              <p className="text-sm text-charcoal-500">No payments yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentPayments.map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-charcoal-900">{formatPrice(payment.amount_pence)}</p>
                      <p className="text-xs text-charcoal-500">{payment.description ?? 'Payment'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={PAYMENT_STATUS[payment.status].variant} size="sm">
                        {PAYMENT_STATUS[payment.status].label}
                      </Badge>
                      <span className="text-xs text-charcoal-400">{formatDate(payment.created_at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent signups</CardTitle>
            <Link href="/admin/customers" className="text-xs font-medium text-cymru-700 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {!recentSignups || recentSignups.length === 0 ? (
              <p className="text-sm text-charcoal-500">No signups yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentSignups.map((profile) => (
                  <li key={profile.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-charcoal-900">{profile.full_name ?? profile.email}</p>
                      <p className="truncate text-xs text-charcoal-500">{profile.email}</p>
                    </div>
                    <span className="shrink-0 text-xs text-charcoal-400">{formatDate(profile.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-charcoal-400">{label}</p>
        <Icon className="h-4 w-4 text-charcoal-300" aria-hidden />
      </div>
      <p className="mt-2 text-2xl font-semibold text-charcoal-900">{value}</p>
    </Card>
  );
}
