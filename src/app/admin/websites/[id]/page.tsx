import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';

import { WebsiteStatusControl } from '@/components/admin/website-status-control';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
import { websiteUrl } from '@/lib/tenant';
import { WEBSITE_STATUS } from '@/lib/status';
import { formatDateTime } from '@/lib/utils';
import type {
  BusinessRow,
  CustomerRow,
  WebsitePageRow,
  WebsiteRow,
  WebsiteStatusHistoryRow,
} from '@/types/database';

export const metadata: Metadata = { title: 'Website', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminWebsiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: website } = (await supabase.from('websites').select('*').eq('id', id).maybeSingle()) as {
    data: WebsiteRow | null;
  };
  if (!website) notFound();

  const [customerResult, businessResult, pagesResult, historyResult] = await Promise.all([
    supabase.from('customers').select('*').eq('id', website.customer_id).maybeSingle(),
    website.business_id
      ? supabase.from('businesses').select('*').eq('id', website.business_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('website_pages').select('*').eq('website_id', id).order('sort_order'),
    supabase.from('website_status_history').select('*').eq('website_id', id).order('created_at', { ascending: false }).limit(10),
  ]);

  const customer = customerResult.data as CustomerRow | null;
  const business = businessResult.data as BusinessRow | null;
  const pages = (pagesResult.data ?? []) as WebsitePageRow[];
  const history = (historyResult.data ?? []) as WebsiteStatusHistoryRow[];

  return (
    <div className="space-y-6">
      <PageHeader
        title={website.name}
        eyebrow={customer?.business_name}
        actions={
          <>
            <a
              href={websiteUrl({
                primaryDomain: website.primary_domain,
                subdomain: website.subdomain,
                slug: website.slug,
                isLive: website.status === 'live',
                previewToken: website.preview_token,
              })}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-cymru-700 hover:underline"
            >
              View site <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <WebsiteStatusControl websiteId={website.id} status={website.status} />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Slug" value={website.slug} />
            <Row label="Subdomain" value={website.subdomain ?? '—'} />
            <Row label="Custom domain" value={website.primary_domain ?? '—'} />
            <Row label="Language" value={website.language_mode} />
            <Row label="Industry" value={business?.industry?.replace(/_/g, ' ') ?? '—'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pages ({pages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pages.length === 0 ? (
              <p className="text-sm text-charcoal-500">No pages yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {pages.map((page) => (
                  <li key={page.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-charcoal-800">{page.title}</span>
                    <Badge variant={page.is_published ? 'success' : 'secondary'} size="sm">
                      {page.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status history</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-charcoal-500">No changes recorded yet.</p>
          ) : (
            <ol className="space-y-3">
              {history.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between text-sm">
                  <span className="text-charcoal-800">→ {WEBSITE_STATUS[entry.to_status].label}</span>
                  <span className="text-xs text-charcoal-400">{formatDateTime(entry.created_at)}</span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-charcoal-500">{label}</dt>
      <dd className="text-right font-medium capitalize text-charcoal-900">{value}</dd>
    </div>
  );
}
