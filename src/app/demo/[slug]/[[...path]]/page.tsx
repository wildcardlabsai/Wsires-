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
type SearchParams = { lang?: string };

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
  const { site, page } = await resolveSitePage(website, path, { locale: parseRequestedLocale(lang) });
  return buildSiteMetadata(site, page);
}

/**
 * Demonstration websites linked from /examples. These are ordinary
 * `websites` rows (is_demo = true, status = 'live') rendered by slug rather
 * than by domain — the same renderer a real customer's site uses.
 */
export default async function DemoSitePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug, path } = await params;
  const { lang } = await searchParams;
  const website = await getSiteBySlug(slug);
  const { site, page } = await resolveSitePage(website, path, { locale: parseRequestedLocale(lang) });
  const jsonLd = buildSiteJsonLd(site, page);

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      {!site.website.is_demo ? null : (
        <div className="bg-charcoal-950 py-2 text-center text-xs font-medium text-white/80">
          This is a demonstration website built on the CymruSites platform — not a real business.
        </div>
      )}
      <SiteRenderer
        site={site}
        page={page}
        linkSuffix={website?.language_mode === 'bilingual' ? `?lang=${site.locale}` : ''}
        switchLocaleQuery={
          website?.language_mode === 'bilingual' ? `?lang=${site.locale === 'cy' ? 'en' : 'cy'}` : undefined
        }
      />
    </>
  );
}
