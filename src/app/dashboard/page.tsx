import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CheckCircle2, Globe, Inbox, LifeBuoy, Users } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { requireCustomer } from '@/lib/auth/session';
import {
  getCustomerWebsite,
  getDashboardStats,
  getOpenTickets,
  getRecentLeads,
} from '@/lib/dashboard/data';
import { createServerSupabase } from '@/lib/supabase/server';
import { LEAD_STATUS, WEBSITE_PIPELINE, WEBSITE_STATUS } from '@/lib/status';
import { formatNumber, formatPrice, formatRelative, percentChange } from '@/lib/utils';
import { websiteUrl as buildWebsiteUrl } from '@/lib/tenant';

export const metadata: Metadata = { title: 'Overview', robots: { index: false } };
export const dynamic = 'force-dynamic';

function Trend({ current, previous }: { current: number; previous: number }) {
  const change = percentChange(current, previous);
  if (change === null || (current === 0 && previous === 0)) return null;
  const positive = change >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-moss-700' : 'text-red-600'}`}>
      <ArrowUpRight className={`h-3 w-3 ${positive ? '' : 'rotate-90'}`} aria-hidden />
      {positive ? '+' : ''}
      {change}%
    </span>
  );
}

export default async function DashboardOverviewPage() {
  const { user, customer } = await requireCustomer();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const website = await getCustomerWebsite(supabase, customer.id);
  const [stats, leads, tickets, subscription] = await Promise.all([
    website ? getDashboardStats(supabase, website.id) : null,
    getRecentLeads(supabase, customer.id, 5),
    getOpenTickets(supabase, customer.id),
    supabase
      .from('subscriptions')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then((r) => r.data),
  ]);

  const statusMeta = website ? WEBSITE_STATUS[website.status] : null;
  const pipelineIndex = website ? WEBSITE_PIPELINE.indexOf(website.status) : -1;
  const liveUrl =
    website &&
    buildWebsiteUrl({
      primaryDomain: website.primary_domain,
      subdomain: website.subdomain,
      slug: website.slug,
      isLive: website.status === 'live',
      previewToken: website.preview_token,
    });

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user.profile.full_name?.split(' ')[0] ?? 'there'}`}
        description="Here’s how your website is doing."
      />

      {!website ? (
        <EmptyState
          icon={Globe}
          title="Let’s get your website started"
          description="Complete the onboarding form and we’ll start building straight away."
          action={{ label: 'Start onboarding', href: '/onboarding' }}
        />
      ) : (
        <>
          {/* Website status card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-400">Your website</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${statusMeta?.dot}`} aria-hidden />
                    <h2 className="text-xl font-semibold text-charcoal-900">{website.name}</h2>
                    {statusMeta && <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>}
                  </div>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-charcoal-600">
                    {statusMeta?.customerMessage}
                  </p>
                  {liveUrl && (
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-cymru-700 hover:underline"
                    >
                      {liveUrl.replace(/^https?:\/\//, '')}
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  {website.plan_id && (
                    <span className="text-sm text-charcoal-500">
                      {subscription ? formatPrice(subscription.amount_pence) + '/month' : 'Plan selected'}
                    </span>
                  )}
                  <Button asChild size="sm">
                    <Link href="/dashboard/website">
                      View website
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </div>

              {pipelineIndex >= 0 && (
                <div className="border-t border-border bg-cream-100/60 px-6 py-4">
                  <div className="flex items-center gap-1">
                    {WEBSITE_PIPELINE.map((step, i) => (
                      <div key={step} className="flex flex-1 items-center gap-1 last:flex-none">
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-semibold ${
                            i <= pipelineIndex ? 'bg-charcoal-900 text-white' : 'bg-charcoal-200 text-charcoal-400'
                          }`}
                        >
                          {i < pipelineIndex ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                        </div>
                        {i < WEBSITE_PIPELINE.length - 1 && (
                          <div className={`h-px flex-1 ${i < pipelineIndex ? 'bg-charcoal-900' : 'bg-charcoal-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          {stats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-charcoal-400">Website visitors</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-2xl font-semibold text-charcoal-900">{formatNumber(stats.pageviews30d)}</p>
                  <Trend current={stats.pageviews30d} previous={stats.pageviews30dPrev} />
                </div>
                <p className="mt-1 text-xs text-charcoal-400">Last 30 days</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-charcoal-400">Sessions</p>
                <p className="mt-2 text-2xl font-semibold text-charcoal-900">{formatNumber(stats.sessions30d)}</p>
                <p className="mt-1 text-xs text-charcoal-400">Last 30 days</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-charcoal-400">Enquiries</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-2xl font-semibold text-charcoal-900">{formatNumber(stats.enquiries30d)}</p>
                  <Trend current={stats.enquiries30d} previous={stats.enquiries30dPrev} />
                </div>
                <p className="mt-1 text-xs text-charcoal-400">Last 30 days</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-charcoal-400">Open support</p>
                <p className="mt-2 text-2xl font-semibold text-charcoal-900">{tickets.length}</p>
                <p className="mt-1 text-xs text-charcoal-400">{tickets.length === 0 ? 'All clear' : 'Awaiting reply'}</p>
              </Card>
            </div>
          )}

          {/* Two-column: leads + tasks */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-charcoal-900">
                    <Inbox className="h-4 w-4 text-charcoal-400" aria-hidden />
                    Recent enquiries
                  </h3>
                  <Link href="/dashboard/leads" className="text-xs font-medium text-cymru-700 hover:underline">
                    View all
                  </Link>
                </div>
                {leads.length === 0 ? (
                  <p className="mt-6 text-sm text-charcoal-500">
                    No enquiries yet — they’ll appear here as soon as someone gets in touch through your website.
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-border">
                    {leads.map((lead) => (
                      <li key={lead.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-charcoal-900">{lead.name}</p>
                          <p className="truncate text-xs text-charcoal-500">{formatRelative(lead.created_at)}</p>
                        </div>
                        <Badge variant={LEAD_STATUS[lead.status].variant} size="sm">
                          {LEAD_STATUS[lead.status].label}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-charcoal-900">
                    <Users className="h-4 w-4 text-charcoal-400" aria-hidden />
                    Outstanding tasks
                  </h3>
                </div>
                <ul className="mt-4 space-y-3">
                  {website.status === 'awaiting_customer_approval' && (
                    <TaskItem
                      label="Review and approve your website preview"
                      href="/dashboard/website"
                    />
                  )}
                  {!website.primary_domain && website.status === 'domain_setup' && (
                    <TaskItem label="Confirm your domain details" href="/dashboard/domain" />
                  )}
                  {tickets.length > 0 && (
                    <TaskItem
                      label={`${tickets.length} support ${tickets.length === 1 ? 'ticket needs' : 'tickets need'} your reply`}
                      href="/dashboard/support"
                    />
                  )}
                  {website.status === 'live' && tickets.length === 0 && (
                    <li className="flex items-center gap-2.5 text-sm text-charcoal-500">
                      <CheckCircle2 className="h-4 w-4 text-moss-600" aria-hidden />
                      Nothing outstanding — you’re all caught up.
                    </li>
                  )}
                </ul>

                <div className="mt-6 border-t border-border pt-4">
                  <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                    <LifeBuoy className="h-3.5 w-3.5" aria-hidden />
                    Need something changed?
                  </h4>
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link href="/dashboard/support">Raise a request</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function TaskItem({ label, href }: { label: string; href: string }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center justify-between gap-3 rounded-lg border border-cymru-200 bg-cymru-50 px-4 py-3 text-sm font-medium text-cymru-900 transition-colors hover:bg-cymru-100"
      >
        {label}
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
      </Link>
    </li>
  );
}
