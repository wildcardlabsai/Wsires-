import 'server-only';

import { cache } from 'react';

import { createAdminSupabase, createServerSupabase } from '@/lib/supabase/server';
import type { PlanRow } from '@/types/database';
import { fallbackPlans } from './plan-fallback';
import {
  SETTINGS_KEYS,
  defaultIndustries,
  defaultPortfolio,
  defaultSiteContent,
} from './defaults';
import type { IndustryContent, PortfolioExample, SiteContent } from './types';

/**
 * Content resolution.
 *
 * The marketing site reads everything through here. Values come from the
 * `settings` table when an administrator has edited them, and from
 * lib/content/defaults.ts otherwise — so the site renders correctly on a
 * brand new installation and stays editable without code changes.
 */

type SettingsMap = Record<string, unknown>;

const loadSettings = cache(async (): Promise<SettingsMap> => {
  const supabase = (await createServerSupabase()) ?? createAdminSupabase();
  if (!supabase) return {};

  const { data, error } = await supabase.from('settings').select('key, value');
  if (error || !data) return {};

  const map: SettingsMap = {};
  for (const row of data) map[row.key] = row.value;
  return map;
});

function merge<T>(fallback: T, override: unknown): T {
  if (override === null || override === undefined) return fallback;
  if (Array.isArray(fallback)) {
    return (Array.isArray(override) && override.length > 0 ? override : fallback) as T;
  }
  if (typeof fallback === 'object' && typeof override === 'object') {
    return { ...(fallback as object), ...(override as object) } as T;
  }
  return (override as T) ?? fallback;
}

/** The full marketing content tree, with admin overrides applied. */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const settings = await loadSettings();
  const d = defaultSiteContent;

  return {
    brand: merge(d.brand, settings[SETTINGS_KEYS.brand]),
    hero: merge(d.hero, settings[SETTINGS_KEYS.hero]),
    trustStrip: merge(d.trustStrip, settings[SETTINGS_KEYS.trustStrip]),
    promise: merge(d.promise, settings[SETTINGS_KEYS.promise]),
    howItWorks: merge(d.howItWorks, settings[SETTINGS_KEYS.howItWorks]),
    whyUs: merge(d.whyUs, settings[SETTINGS_KEYS.whyUs]),
    included: merge(d.included, settings[SETTINGS_KEYS.included]),
    welsh: merge(d.welsh, settings[SETTINGS_KEYS.welsh]),
    localSeo: merge(d.localSeo, settings[SETTINGS_KEYS.localSeo]),
    testimonials: merge(d.testimonials, settings[SETTINGS_KEYS.testimonials]),
    faqs: merge(d.faqs, settings[SETTINGS_KEYS.faqs]),
    finalCta: merge(d.finalCta, settings[SETTINGS_KEYS.finalCta]),
    seo: merge(d.seo, settings[SETTINGS_KEYS.seo]),
  };
});

export const getIndustries = cache(async (): Promise<IndustryContent[]> => {
  const settings = await loadSettings();
  return merge(defaultIndustries, settings[SETTINGS_KEYS.industries]);
});

export async function getIndustry(slug: string): Promise<IndustryContent | null> {
  const industries = await getIndustries();
  return industries.find((i) => i.slug === slug) ?? null;
}

export const getPortfolio = cache(async (): Promise<PortfolioExample[]> => {
  const settings = await loadSettings();
  return merge(defaultPortfolio, settings[SETTINGS_KEYS.portfolio]);
});

export const getWebsiteTemplates = cache(async () => {
  const supabase = (await createServerSupabase()) ?? createAdminSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('website_templates')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return error || !data ? [] : data;
});

/** Live pricing. Plans are rows, so pricing is editable from the admin area. */
export const getPlans = cache(async (): Promise<PlanRow[]> => {
  const supabase = (await createServerSupabase()) ?? createAdminSupabase();
  if (!supabase) return fallbackPlans;

  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data || data.length === 0) return fallbackPlans;
  return data;
});

export async function getPlanBySlug(slug: string): Promise<PlanRow | null> {
  const plans = await getPlans();
  return plans.find((p) => p.slug === slug) ?? null;
}

/** Read a single setting with a typed fallback. */
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const settings = await loadSettings();
  const value = settings[key];
  return (value === undefined || value === null ? fallback : value) as T;
}
