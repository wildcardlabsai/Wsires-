import { SiteRenderer } from '@/components/site/site-renderer';
import { getSiteBySubdomain } from '@/lib/websites/render-data';
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
  const website = await getSiteBySubdomain(slug);
  const { site, page } = await resolveSitePage(website, path, { locale: parseRequestedLocale(lang) });
  return buildSiteMetadata(site, page);
}

export default async function SubdomainSitePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug, path } = await params;
  const { lang } = await searchParams;
  const website = await getSiteBySubdomain(slug);
  const { site, page } = await resolveSitePage(website, path, { locale: parseRequestedLocale(lang) });
  const jsonLd = buildSiteJsonLd(site, page);

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
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
