import {
  defaultIndustries,
  defaultPortfolio,
  defaultSiteContent,
} from './defaults';
import { plans } from './plans';
import type { IndustryContent, Plan, PortfolioExample, SiteContent } from './types';

/**
 * Content resolution.
 *
 * This is a static marketing site — there is no database or admin panel.
 * To change copy, pricing or industries, edit lib/content/defaults.ts and
 * lib/content/plans.ts directly.
 */

export async function getSiteContent(): Promise<SiteContent> {
  return defaultSiteContent;
}

export async function getIndustries(): Promise<IndustryContent[]> {
  return defaultIndustries;
}

export async function getIndustry(slug: string): Promise<IndustryContent | null> {
  const industries = await getIndustries();
  return industries.find((i) => i.slug === slug) ?? null;
}

export async function getPortfolio(): Promise<PortfolioExample[]> {
  return defaultPortfolio;
}

export async function getPlans(): Promise<Plan[]> {
  return plans;
}

export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  const all = await getPlans();
  return all.find((p) => p.slug === slug) ?? null;
}
