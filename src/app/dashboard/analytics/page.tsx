import type { Metadata } from 'next';
import { BarChart3 } from 'lucide-react';

import { TrafficChart } from '@/components/dashboard/analytics-charts';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Card, CardContent } from '@/components/ui/card';
import { requireCustomer } from '@/lib/auth/session';
import { getCustomerWebsite } from '@/lib/dashboard/data';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatNumber } from '@/lib/utils';

export const metadata: Metadata = { title: 'Analytics', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const { customer } = await requireCustomer();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const website = await getCustomerWebsite(supabase, customer.id);

  if (!website) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" />
        <EmptyState icon={BarChart3} title="No website yet" description="Analytics will appear once your website is live." />
      </div>
    );
  }

  const start = new Date();
  start.setDate(start.getDate() - 30);

  const { data: daily } = await supabase
    .from('analytics_daily')
    .select('date, pageviews, sessions, enquiries, top_pages, sources')
    .eq('website_id', website.id)
    .gte('date', start.toISOString().slice(0, 10))
    .order('date', { ascending: true });

  const rows = daily ?? [];
  const totals = rows.reduce(
    (acc, r) => ({
      pageviews: acc.pageviews + r.pageviews,
      sessions: acc.sessions + r.sessions,
      enquiries: acc.enquiries + r.enquiries,
    }),
    { pageviews: 0, sessions: 0, enquiries: 0 },
  );

  const topPagesMap = new Map<string, number>();
  const sourcesMap = new Map<string, number>();
  for (const row of rows) {
    for (const p of (row.top_pages ?? []) as { path: string; views: number }[]) {
      topPagesMap.set(p.path, (topPagesMap.get(p.path) ?? 0) + p.views);
    }
    for (const s of (row.sources ?? []) as { source: string; visits: number }[]) {
      sourcesMap.set(s.source, (sourcesMap.get(s.source) ?? 0) + s.visits);
    }
  }
  const topPages = [...topPagesMap.entries()].map(([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views).slice(0, 8);
  const sources = [...sourcesMap.entries()].map(([source, visits]) => ({ source, visits })).sort((a, b) => b.visits - a.visits).slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="How your website is performing — last 30 days." />

      {rows.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics yet"
          description="Once your website is live and receiving visitors, traffic and enquiry data will appear here."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-charcoal-400">Page views</p>
              <p className="mt-2 text-2xl font-semibold text-charcoal-900">{formatNumber(totals.pageviews)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-charcoal-400">Sessions</p>
              <p className="mt-2 text-2xl font-semibold text-charcoal-900">{formatNumber(totals.sessions)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-charcoal-400">Enquiries</p>
              <p className="mt-2 text-2xl font-semibold text-charcoal-900">{formatNumber(totals.enquiries)}</p>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-charcoal-900">Traffic over time</h3>
              <div className="mt-4">
                <TrafficChart data={rows} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-charcoal-900">Top pages</h3>
                <ul className="mt-4 space-y-2.5">
                  {topPages.map((page) => (
                    <li key={page.path} className="flex items-center justify-between text-sm">
                      <span className="truncate text-charcoal-700">{page.path || '/'}</span>
                      <span className="font-medium text-charcoal-900">{formatNumber(page.views)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-charcoal-900">Traffic sources</h3>
                <ul className="mt-4 space-y-2.5">
                  {sources.map((source) => (
                    <li key={source.source} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-charcoal-700">{source.source}</span>
                      <span className="font-medium text-charcoal-900">{formatNumber(source.visits)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
