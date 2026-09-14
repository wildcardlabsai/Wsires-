import { env } from '@/lib/env';

/**
 * Multi-tenant host resolution.
 *
 * A customer website can be reached three ways:
 *   1. their own domain          → cwmvalleyplumbing.co.uk
 *   2. a CymruSites subdomain    → cwm-valley-plumbing.cymrusites.co.uk
 *   3. a preview path            → /preview/<slug>?token=…
 *
 * The platform itself lives on the apex and on `app.` / `www.`.
 */

export type TenantResolution =
  | { kind: 'platform' }
  | { kind: 'subdomain'; slug: string }
  | { kind: 'custom-domain'; domain: string };

const PLATFORM_SUBDOMAINS = new Set(['www', 'app', 'admin', 'api', 'preview', 'demo']);

function normaliseHost(hostname: string): string {
  return hostname.toLowerCase().split(':')[0]!.replace(/\.$/, '');
}

export function resolveTenant(hostHeader: string | null | undefined): TenantResolution {
  if (!hostHeader) return { kind: 'platform' };

  const host = normaliseHost(hostHeader);
  const root = normaliseHost(env.rootDomain);

  /* Local development and preview deployments always serve the platform. */
  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.startsWith('127.') ||
    host === '0.0.0.0' ||
    host.endsWith('.vercel.app')
  ) {
    return { kind: 'platform' };
  }

  if (host === root || host === `www.${root}`) return { kind: 'platform' };

  if (host.endsWith(`.${root}`)) {
    const label = host.slice(0, -1 * (root.length + 1));
    if (!label || label.includes('.')) return { kind: 'platform' };
    if (PLATFORM_SUBDOMAINS.has(label)) return { kind: 'platform' };
    return { kind: 'subdomain', slug: label };
  }

  return { kind: 'custom-domain', domain: host };
}

/** The public address of a customer website, for links in the dashboard. */
export function websiteUrl(opts: {
  primaryDomain?: string | null;
  subdomain?: string | null;
  slug: string;
  isLive: boolean;
  previewToken?: string | null;
}): string {
  const { primaryDomain, subdomain, slug, isLive, previewToken } = opts;

  if (isLive && primaryDomain) return `https://${primaryDomain}`;
  if (isLive && subdomain) return `https://${subdomain}.${env.rootDomain}`;

  const base = env.siteUrl.replace(/\/$/, '');
  const token = previewToken ? `?token=${encodeURIComponent(previewToken)}` : '';
  return `${base}/preview/${slug}${token}`;
}

export function subdomainUrl(subdomain: string): string {
  return `https://${subdomain}.${env.rootDomain}`;
}
