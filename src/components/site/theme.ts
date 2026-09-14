import type { TemplateStyleTokens } from '@/types/database';

/** Resolves the effective style tokens for a site: template defaults, then any per-website overrides. */
export function resolveTheme(
  templateTokens: TemplateStyleTokens | undefined,
  websiteTheme: { accent?: string; surface?: string; ink?: string; muted?: string } | undefined,
) {
  return {
    accent: websiteTheme?.accent || templateTokens?.accent || '#C8102E',
    surface: websiteTheme?.surface || templateTokens?.surface || '#FFFFFF',
    ink: websiteTheme?.ink || templateTokens?.ink || '#1C1B19',
    muted: websiteTheme?.muted || templateTokens?.muted || '#F4EFE6',
    headingFont: templateTokens?.headingFont ?? 'sans',
    layout: templateTokens?.layout ?? 'split',
    radius: templateTokens?.radius ?? 'md',
    heroStyle: templateTokens?.heroStyle ?? 'split',
    navStyle: templateTokens?.navStyle ?? 'solid',
  };
}

export type ResolvedTheme = ReturnType<typeof resolveTheme>;

export function radiusClass(radius: string): string {
  switch (radius) {
    case 'sm':
      return 'rounded-md';
    case 'lg':
      return 'rounded-xl';
    case 'xl':
      return 'rounded-2xl';
    default:
      return 'rounded-lg';
  }
}
