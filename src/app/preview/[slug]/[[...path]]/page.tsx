import { AlertTriangle } from 'lucide-react';

import { SiteRenderer } from '@/components/site/site-renderer';
import { getSiteBySlug } from '@/lib/websites/render-data';
import {
  buildSiteJsonLd,
  buildSiteMetadata,
  parseRequestedLocale,
  resolveSitePage,
} from '@/lib/websites/resolve-render';

export const dynamic = 'force-dynamic';

interface Params {
  slug: string;
  path?: string[];
}
type SearchParams = { token?: string; lang?: string };

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug, path } = await params;
  const { lang } = await searchParams;
  const website = await getSiteBySlug(slug);
  const { site, page } = await resolveSitePage(website, path, {
    requireOwner: true,
    locale: parseRequestedLocale(lang),
  });
  return { ...buildSiteMetadata(site, page), robots: { index: false, follow: false } };
}

/**
 * Private preview link, shared with a customer before their site is live.
 * Accessible with the matching `?token=` query, or by the owning customer's
 * own session. Every internal link stays inside `/preview/<slug>/…` and
 * carries the token (and the selected language, on bilingual sites), so the
 * customer can review the whole site — not just the homepage — before
 * approving it.
 */
export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug, path } = await params;
  const { token, lang } = await searchParams;
  const website = await getSiteBySlug(slug);
  const { site, page } = await resolveSitePage(website, path, {
    requireLiveOrPreviewToken: token,
    requireOwner: true,
    locale: parseRequestedLocale(lang),
  });
  const jsonLd = buildSiteJsonLd(site, page);

  const query = new URLSearchParams();
  if (token) query.set('token', token);
  if (site.locale === 'cy') query.set('lang', 'cy');
  const linkSuffix = query.toString() ? `?${query.toString()}` : '';

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <div className="flex items-center justify-center gap-2 bg-amber-400 px-4 py-2.5 text-center text-xs font-semibold text-amber-950">
        <AlertTriangle className="h-3.5 w-3.5" />
        Private preview — not yet live and not indexed by search engines
      </div>
      <SiteRenderer site={site} page={page} basePath={`/preview/${slug}`} linkSuffix={linkSuffix} />
    </>
  );
}
