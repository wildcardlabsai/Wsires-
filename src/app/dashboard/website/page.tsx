import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, ExternalLink, History } from 'lucide-react';

import { ApproveButton, RequestChangesButton } from '@/components/dashboard/website-actions';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { requireCustomer } from '@/lib/auth/session';
import { getCustomerWebsite } from '@/lib/dashboard/data';
import { createServerSupabase } from '@/lib/supabase/server';
import { websiteUrl } from '@/lib/tenant';
import { WEBSITE_PIPELINE, WEBSITE_STATUS } from '@/lib/status';
import { formatDateTime } from '@/lib/utils';
import type { WebsiteStatusHistoryRow } from '@/types/database';

export const metadata: Metadata = { title: 'My Website', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function MyWebsitePage() {
  const { customer } = await requireCustomer();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const website = await getCustomerWebsite(supabase, customer.id);

  if (!website) {
    return (
      <div className="space-y-8">
        <PageHeader title="My Website" />
        <EmptyState
          title="No website yet"
          description="Complete onboarding and we’ll start building your website."
          action={{ label: 'Start onboarding', href: '/onboarding' }}
        />
      </div>
    );
  }

  const { data: history } = (await supabase
    .from('website_status_history')
    .select('*')
    .eq('website_id', website.id)
    .order('created_at', { ascending: false })
    .limit(8)) as { data: WebsiteStatusHistoryRow[] | null };

  const statusMeta = WEBSITE_STATUS[website.status];
  const previewUrl = websiteUrl({
    primaryDomain: website.primary_domain,
    subdomain: website.subdomain,
    slug: website.slug,
    isLive: false,
    previewToken: website.preview_token,
  });
  const liveUrl =
    website.status === 'live'
      ? websiteUrl({
          primaryDomain: website.primary_domain,
          subdomain: website.subdomain,
          slug: website.slug,
          isLive: true,
        })
      : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Website"
        description={website.name}
        actions={
          <>
            <Button asChild variant="outline">
              <a href={liveUrl ?? previewUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                {liveUrl ? 'View live site' : 'View preview'}
              </a>
            </Button>
            {website.status === 'awaiting_customer_approval' && <ApproveButton />}
          </>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full ${statusMeta.dot}`} aria-hidden />
            <h2 className="text-lg font-semibold text-charcoal-900">{statusMeta.label}</h2>
            <Badge variant={statusMeta.variant}>{website.status.replace(/_/g, ' ')}</Badge>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal-600">{statusMeta.customerMessage}</p>

          {WEBSITE_PIPELINE.includes(website.status) && (
            <ol className="mt-6 grid gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {WEBSITE_PIPELINE.map((step, i) => {
                const stepIndex = WEBSITE_PIPELINE.indexOf(website.status);
                const done = i < stepIndex;
                const current = i === stepIndex;
                return (
                  <li
                    key={step}
                    className={`rounded-lg border px-3 py-2.5 text-center text-xs font-medium ${
                      current
                        ? 'border-charcoal-900 bg-charcoal-900 text-white'
                        : done
                          ? 'border-moss-200 bg-moss-50 text-moss-700'
                          : 'border-border bg-cream-100 text-charcoal-400'
                    }`}
                  >
                    {WEBSITE_STATUS[step].label}
                  </li>
                );
              })}
            </ol>
          )}

          {(website.status === 'awaiting_customer_approval' ||
            website.status === 'live' ||
            website.status === 'approved') && (
            <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-6">
              {website.status === 'awaiting_customer_approval' && <ApproveButton />}
              <RequestChangesButton />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-charcoal-900">Details</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-charcoal-500">Website name</dt>
                <dd className="text-right font-medium text-charcoal-900">{website.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-charcoal-500">Template</dt>
                <dd className="text-right font-medium text-charcoal-900">{website.template?.name ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-charcoal-500">Language</dt>
                <dd className="text-right font-medium text-charcoal-900 capitalize">
                  {website.language_mode === 'cy' ? 'Welsh' : website.language_mode === 'bilingual' ? 'Bilingual' : 'English'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-charcoal-500">Address</dt>
                <dd className="text-right font-medium text-charcoal-900">
                  {liveUrl ? liveUrl.replace(/^https?:\/\//, '') : previewUrl.replace(/^https?:\/\//, '')}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex gap-2 border-t border-border pt-4">
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/content">Edit content</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/pages">Manage pages</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-charcoal-900">
              <History className="h-4 w-4 text-charcoal-400" aria-hidden />
              Recent updates
            </h3>
            {!history || history.length === 0 ? (
              <p className="mt-4 text-sm text-charcoal-500">No status changes recorded yet.</p>
            ) : (
              <ol className="mt-4 space-y-4">
                {history.map((entry) => (
                  <li key={entry.id} className="flex gap-3 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-charcoal-300" aria-hidden />
                    <div>
                      <p className="text-charcoal-800">
                        Moved to <span className="font-medium">{WEBSITE_STATUS[entry.to_status].label}</span>
                      </p>
                      <p className="text-xs text-charcoal-400">{formatDateTime(entry.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
