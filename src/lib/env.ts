/**
 * Environment access.
 *
 * Nothing here throws at module load: the app must still build and the
 * marketing site must still render before a Resend key is added. Email
 * sending checks `isResendConfigured` first and logs instead of pretending
 * to send.
 */

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export const env = {
  /* Public */
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    'http://localhost:3000',
  rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() || 'cymrusites.co.uk',

  /* Server only */
  get resendApiKey() {
    return read('RESEND_API_KEY');
  },
  get emailFrom() {
    return read('EMAIL_FROM') ?? 'CymruSites <hello@cymrusites.co.uk>';
  },
  get adminEmail() {
    return read('ADMIN_NOTIFICATION_EMAIL') ?? read('EMAIL_FROM') ?? 'hello@cymrusites.co.uk';
  },
} as const;

export function isResendConfigured(): boolean {
  return Boolean(env.resendApiKey);
}

/** Absolute URL helper — used by emails and OG tags. */
export function absoluteUrl(path = '/'): string {
  const base = env.siteUrl.replace(/\/$/, '');
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}
