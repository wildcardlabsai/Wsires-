/**
 * Environment access.
 *
 * Nothing here throws at module load: the app must still build and the
 * marketing site must still render before Supabase/Stripe/Resend keys are
 * added. Features that genuinely need a key check `isConfigured` first and
 * surface an honest message instead of pretending to work.
 */

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export const env = {
  /* Public */
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || undefined,
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    'http://localhost:3000',
  rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() || 'cymrusites.co.uk',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || undefined,

  /* Server only */
  get supabaseServiceRoleKey() {
    return read('SUPABASE_SERVICE_ROLE_KEY');
  },
  get stripeSecretKey() {
    return read('STRIPE_SECRET_KEY');
  },
  get stripeWebhookSecret() {
    return read('STRIPE_WEBHOOK_SECRET');
  },
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

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

export function isServiceRoleConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}

export function isStripeConfigured(): boolean {
  return Boolean(env.stripeSecretKey);
}

export function isResendConfigured(): boolean {
  return Boolean(env.resendApiKey);
}

/** Absolute URL helper — used by emails, OG tags, Stripe redirects. */
export function absoluteUrl(path = '/'): string {
  const base = env.siteUrl.replace(/\/$/, '');
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}

/** Which integrations are wired up — surfaced in the admin settings page. */
export function integrationStatus() {
  return {
    supabase: isSupabaseConfigured,
    supabaseAdmin: isServiceRoleConfigured(),
    stripe: isStripeConfigured(),
    stripeWebhook: Boolean(env.stripeWebhookSecret),
    resend: isResendConfigured(),
  };
}
