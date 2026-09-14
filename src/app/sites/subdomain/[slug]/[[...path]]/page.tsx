import { SiteRenderer } from '@/components/site/site-renderer';
import { getSiteBySubdomain } from '@/lib/websites/render-data';
import { buildSiteJsonLd, buildSiteMetadata, resolveSitePage } from '@/lib/websites/resolve-render';

export const dynamic = 'force-dynamic';

interface Params {
  slug: string;
  path?: string[];
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug, path } = await params;
  const website = await getSiteBySubdomain(slug);
  const { site, page } = await resolveSitePage(website, path);
  return buildSiteMetadata(site, page);
}

export default async function SubdomainSitePage({ params }: { params: Promise<Params> }) {
  const { slug, path } = await params;
  const website = await getSiteBySubdomain(slug);
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
