import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { getSessionUser } from '@/lib/auth/session';
import { buildRenderableSite, findPage, type RenderableSite } from './render-data';
import { buildPageMetadata, faqJsonLd, localBusinessJsonLd, siteCanonicalUrl } from './seo';
import type { WebsiteRow } from '@/types/database';

/**
 * Shared path from "resolved website row" to "rendered page + metadata",
 * used by the subdomain, custom-domain, demo and preview routes alike so
 * they can never drift from one another.
 */
export async function resolveSitePage(
  website: WebsiteRow | null,
  pathSegments: string[] | undefined,
  opts: { requireLiveOrPreviewToken?: string; requireOwner?: boolean } = {},
): Promise<{ site: RenderableSite; page: NonNullable<ReturnType<typeof findPage>> }> {
  if (!website) notFound();

  if (website.status !== 'live') {
    if (opts.requireLiveOrPreviewToken) {
      const tokenMatches = opts.requireLiveOrPreviewToken === website.preview_token;
      if (!tokenMatches) {
        if (opts.requireOwner) {
          const user = await getSessionUser();
          const ownsIt = user?.id && (await ownsWebsite(website, user.id));
          if (!ownsIt) notFound();
        } else {
          notFound();
        }
      }
    } else if (opts.requireOwner) {
      const user = await getSessionUser();
      const ownsIt = user?.id && (await ownsWebsite(website, user.id));
      if (!ownsIt) notFound();
    } else {
      notFound();
    }
  }

  const site = await buildRenderableSite(website);
  const slug = (pathSegments ?? []).join('/');
  const page = findPage(site, slug);
  if (!page) notFound();

  return { site, page };
}

async function ownsWebsite(website: WebsiteRow, userId: string): Promise<boolean> {
  const { createServerSupabase } = await import('@/lib/supabase/server');
  const supabase = await createServerSupabase();
  if (!supabase) return false;
  const { data } = await supabase
    .from('customers')
    .select('id')
    .eq('id', website.customer_id)
    .eq('profile_id', userId)
    .maybeSingle();
  return Boolean(data);
}

export function buildSiteMetadata(site: RenderableSite, page: ReturnType<typeof findPage>): Metadata {
  return buildPageMetadata(site, page);
}

export function buildSiteJsonLd(site: RenderableSite, page: NonNullable<ReturnType<typeof findPage>>) {
  const url = siteCanonicalUrl(site.website, page.is_home ? '/' : `/${page.slug}`);
  const faqSection = page.sections.find((s) => s.section_type === 'faq');
  const faqs = (faqSection?.data.items as { question: string; answer: string }[] | undefined) ?? [];

  return [localBusinessJsonLd(site, url), faqJsonLd(faqs)].filter(Boolean);
}
