import type { Metadata } from 'next';

import { absoluteUrl } from '@/lib/env';
import type { RenderableSite } from './render-data';

/** Next.js `generateMetadata` output for a customer website page. */
export function buildPageMetadata(
  site: RenderableSite,
  page: { title: string; seo?: unknown; is_home?: boolean; slug?: string } | undefined,
): Metadata {
  const { website, business } = site;
  const pageSeo = (page?.seo ?? {}) as { title?: string; description?: string; noindex?: boolean };
  const siteSeo = website.seo as { title?: string; description?: string };

  const title = pageSeo.title || (page ? `${page.title} | ${website.name}` : website.name);
  const description =
    pageSeo.description ||
    siteSeo.description ||
    business?.description?.slice(0, 155) ||
    `${website.name} — professional services in ${business?.city ?? 'Wales'}.`;

  const noindex = pageSeo.noindex || website.status !== 'live';
  const canonicalPath = page?.is_home ? '/' : page?.slug ? `/${page.slug}` : '/';

  return {
    title,
    description,
    alternates: { canonical: siteCanonicalUrl(website, canonicalPath) },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: website.name,
      url: siteCanonicalUrl(website, canonicalPath),
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/** schema.org LocalBusiness — the foundation of local SEO for every site. */
export function localBusinessJsonLd(site: RenderableSite, url: string) {
  const { business, website } = site;
  if (!business) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description ?? undefined,
    url,
    telephone: business.phone ?? undefined,
    email: business.email ?? undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: [business.address_line1, business.address_line2].filter(Boolean).join(', ') || undefined,
      addressLocality: business.city ?? undefined,
      postalCode: business.postcode ?? undefined,
      addressCountry: 'GB',
    },
    areaServed: business.service_areas?.map((area) => ({ '@type': 'Place', name: area })),
    sameAs: Object.values(business.social_links ?? {}).filter(Boolean),
    image: business.logo_url ?? undefined,
    openingHoursSpecification: (business.opening_hours ?? [])
      .filter((h) => !h.closed && h.opens && h.closes)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.day,
        opens: h.opens,
        closes: h.closes,
      })),
    makesOffer: business.services?.map((service) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: service.title,
        description: service.description ?? undefined,
      },
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function siteCanonicalUrl(website: { primary_domain: string | null; subdomain: string | null; slug: string }, path = '/') {
  if (website.primary_domain) return `https://${website.primary_domain}${path}`;
  if (website.subdomain) {
    const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'cymrusites.co.uk';
    return `https://${website.subdomain}.${root}${path}`;
  }
  return absoluteUrl(`/demo/${website.slug}${path}`);
}
