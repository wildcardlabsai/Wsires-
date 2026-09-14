import type { BusinessRow, WebsiteRow } from '@/types/database';

/**
 * Replaces {{business_name}}-style tokens inside admin/customer-authored
 * text, so the same underlying copy can be reused across the template
 * system. Section data is usually already business-specific (written during
 * onboarding), but tokens let a template ship default copy that still reads
 * correctly before that content is customised.
 */
export function interpolate(
  text: string | null | undefined,
  business: BusinessRow | null,
  website: WebsiteRow,
): string {
  if (!text) return '';

  const location = [business?.city, business?.county].filter(Boolean).join(', ');
  const services = (business?.services ?? []).map((s) => s.title).join(', ');

  const tokens: Record<string, string> = {
    business_name: business?.name ?? website.name,
    phone: business?.phone ?? '',
    email: business?.email ?? '',
    services,
    location: location || 'Wales',
    about: business?.description ?? '',
    tagline: business?.tagline ?? '',
  };

  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => tokens[key] ?? match);
}
