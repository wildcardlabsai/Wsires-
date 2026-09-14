import 'server-only';

import { cache } from 'react';

import { createAdminSupabase, createServerSupabase } from '@/lib/supabase/server';
import type {
  BusinessRow,
  SiteLocale,
  WebsiteContentRow,
  WebsitePageRow,
  WebsiteRow,
  WebsiteTemplateRow,
} from '@/types/database';

export interface RenderablePage extends WebsitePageRow {
  sections: WebsiteContentRow[];
}

export interface RenderableSite {
  website: WebsiteRow;
  business: BusinessRow | null;
  template: WebsiteTemplateRow | null;
  pages: RenderablePage[];
  locale: SiteLocale;
}

/**
 * Resolves everything needed to render a customer website, by whichever key
 * identifies it: custom domain, CymruSites subdomain, internal slug (used by
 * demo/example sites) or preview token. Anonymous visitors only ever see
 * `status = 'live'` sites (enforced by RLS); everything else requires the
 * owner's session or a matching preview token, both handled by the caller.
 */
export const getSiteByDomain = cache(async (domain: string): Promise<WebsiteRow | null> => {
  const supabase = (await createServerSupabase()) ?? createAdminSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from('websites').select('*').eq('primary_domain', domain).maybeSingle();
  return data ?? null;
});

export const getSiteBySubdomain = cache(async (subdomain: string): Promise<WebsiteRow | null> => {
  const supabase = (await createServerSupabase()) ?? createAdminSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from('websites').select('*').eq('subdomain', subdomain).maybeSingle();
  return data ?? null;
});

export const getSiteBySlug = cache(async (slug: string): Promise<WebsiteRow | null> => {
  const supabase = (await createServerSupabase()) ?? createAdminSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from('websites').select('*').eq('slug', slug).maybeSingle();
  return data ?? null;
});

/** Loads business, template, pages and every section for a resolved website. */
export const buildRenderableSite = cache(async (website: WebsiteRow, locale?: SiteLocale): Promise<RenderableSite> => {
  const supabase = (await createServerSupabase()) ?? createAdminSupabase();
  const effectiveLocale: SiteLocale = locale ?? website.default_locale;

  if (!supabase) {
    return { website, business: null, template: null, pages: [], locale: effectiveLocale };
  }

  const [businessResult, templateResult, pagesResult, contentResult] = await Promise.all([
    website.business_id
      ? supabase.from('businesses').select('*').eq('id', website.business_id).maybeSingle()
      : Promise.resolve({ data: null }),
    website.template_id
      ? supabase.from('website_templates').select('*').eq('id', website.template_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('website_pages')
      .select('*')
      .eq('website_id', website.id)
      .eq('is_published', true)
      .order('sort_order'),
    supabase
      .from('website_content')
      .select('*')
      .eq('website_id', website.id)
      .eq('locale', effectiveLocale)
      .eq('is_visible', true)
      .order('sort_order'),
  ]);

  const business = businessResult.data as BusinessRow | null;
  const template = templateResult.data as WebsiteTemplateRow | null;
  const pageRows = (pagesResult.data ?? []) as WebsitePageRow[];
  const contentRows = (contentResult.data ?? []) as WebsiteContentRow[];

  const pages: RenderablePage[] = pageRows.map((page) => ({
    ...page,
    sections: contentRows.filter((section) => section.page_id === page.id),
  }));

  /* Sections with no page_id (legacy/global) attach to the home page. */
  const globalSections = contentRows.filter((s) => !s.page_id);
  const home = pages.find((p) => p.is_home);
  if (home && globalSections.length > 0) {
    home.sections = [...home.sections, ...globalSections].sort((a, b) => a.sort_order - b.sort_order);
  }

  return { website, business, template, pages, locale: effectiveLocale };
});

export function findPage(site: RenderableSite, slug: string): RenderablePage | undefined {
  const normalised = slug.replace(/^\/|\/$/g, '');
  if (normalised === '') return site.pages.find((p) => p.is_home);
  return site.pages.find((p) => p.slug === normalised);
}

export function getSection(page: RenderablePage, key: string): WebsiteContentRow | undefined {
  return page.sections.find((s) => s.section_key === key);
}
