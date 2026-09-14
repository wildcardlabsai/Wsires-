import type { Metadata } from 'next';
import { BarChart3 } from 'lucide-react';

import { TrafficChart } from '@/components/dashboard/analytics-charts';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Card, CardContent } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatNumber } from '@/lib/utils';

export const metadata: Metadata = { title: 'Analytics', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const start = new Date();
  start.setDate(start.getDate() - 30);

  const { data: rows } = await supabase
    .from('analytics_daily')
    .select('date, pageviews, sessions, enquiries')
    .gte('date', start.toISOString().slice(0, 10))
    .order('date', { ascending: true });

  const byDate = new Map<string, { date: string; pageviews: number; sessions: number; enquiries: number }>();
  for (const row of rows ?? []) {
    const existing = byDate.get(row.date) ?? { date: row.date, pageviews: 0, sessions: 0, enquiries: 0 };
    existing.pageviews += row.pageviews;
    existing.sessions += row.sessions;
    existing.enquiries += row.enquiries;
    byDate.set(row.date, existing);
  }
  const chartData = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));

  const totals = chartData.reduce(
    (acc, r) => ({
      pageviews: acc.pageviews + r.pageviews,
      sessions: acc.sessions + r.sessions,
      enquiries: acc.enquiries + r.enquiries,
    }),
    { pageviews: 0, sessions: 0, enquiries: 0 },
  );

  const { count: liveSites } = await supabase.from('websites').select('id', { count: 'exact', head: true }).eq('status', 'live');

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Traffic across every live customer website — last 30 days." />

      {chartData.length === 0 ? (
        <EmptyState icon={BarChart3} title="No analytics yet" description="Data will appear here once customer websites are live and receiving traffic." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-charcoal-400">Live websites</p>
              <p className="mt-2 text-2xl font-semibold text-charcoal-900">{formatNumber(liveSites ?? 0)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-charcoal-400">Total page views</p>
              <p className="mt-2 text-2xl font-semibold text-charcoal-900">{formatNumber(totals.pageviews)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-charcoal-400">Total sessions</p>
              <p className="mt-2 text-2xl font-semibold text-charcoal-900">{formatNumber(totals.sessions)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-charcoal-400">Total enquiries</p>
              <p className="mt-2 text-2xl font-semibold text-charcoal-900">{formatNumber(totals.enquiries)}</p>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-charcoal-900">Traffic across the platform</h3>
              <div className="mt-4">
                <TrafficChart data={chartData} />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
