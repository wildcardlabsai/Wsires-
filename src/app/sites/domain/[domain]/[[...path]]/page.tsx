import { SiteRenderer } from '@/components/site/site-renderer';
import { getSiteByDomain } from '@/lib/websites/render-data';
import { buildSiteJsonLd, buildSiteMetadata, resolveSitePage } from '@/lib/websites/resolve-render';

export const dynamic = 'force-dynamic';

interface Params {
  domain: string;
  path?: string[];
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { domain, path } = await params;
  const website = await getSiteByDomain(decodeURIComponent(domain));
  const { site, page } = await resolveSitePage(website, path);
  return buildSiteMetadata(site, page);
}

export default async function CustomDomainSitePage({ params }: { params: Promise<Params> }) {
  const { domain, path } = await params;
  const website = await getSiteByDomain(decodeURIComponent(domain));
  const { site, page } = await resolveSitePage(website, path);
  const jsonLd = buildSiteJsonLd(site, page);

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <SiteRenderer site={site} page={page} />
    </>
  );
}
