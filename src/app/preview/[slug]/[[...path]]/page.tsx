import { AlertTriangle } from 'lucide-react';

import { SiteRenderer } from '@/components/site/site-renderer';
import { getSiteBySlug } from '@/lib/websites/render-data';
import { buildSiteJsonLd, buildSiteMetadata, resolveSitePage } from '@/lib/websites/resolve-render';

export const dynamic = 'force-dynamic';

interface Params {
  slug: string;
  path?: string[];
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug, path } = await params;
  const website = await getSiteBySlug(slug);
  const { site, page } = await resolveSitePage(website, path, { requireOwner: true });
  return { ...buildSiteMetadata(site, page), robots: { index: false, follow: false } };
}

/**
 * Private preview link, shared with a customer before their site is live.
 * Accessible with the matching `?token=` query, or by the owning customer's
 * own session. Every internal link stays inside `/preview/<slug>/…` and
 * carries the token, so the customer can review the whole site — not just
 * the homepage — before approving it.
 */
export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug, path } = await params;
  const { token } = await searchParams;
  const website = await getSiteBySlug(slug);
  const { site, page } = await resolveSitePage(website, path, {
    requireLiveOrPreviewToken: token,
    requireOwner: true,
  });
  const jsonLd = buildSiteJsonLd(site, page);

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <div className="flex items-center justify-center gap-2 bg-amber-400 px-4 py-2.5 text-center text-xs font-semibold text-amber-950">
        <AlertTriangle className="h-3.5 w-3.5" />
        Private preview — not yet live and not indexed by search engines
      </div>
      <SiteRenderer
        site={site}
        page={page}
        basePath={`/preview/${slug}`}
        linkSuffix={token ? `?token=${encodeURIComponent(token)}` : ''}
      />
    </>
  );
}
