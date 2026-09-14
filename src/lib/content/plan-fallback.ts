import type { PlanRow } from '@/types/database';

/**
 * Pricing shown when the database is unreachable or not yet connected.
 *
 * These mirror supabase/migrations/20250101000003_baseline_data.sql. Once
 * Supabase is configured the real `plans` rows are used instead, and prices
 * are edited from Admin → Settings rather than here.
 */
const now = new Date(0).toISOString();

function plan(p: Partial<PlanRow> & Pick<PlanRow, 'slug' | 'name'>): PlanRow {
  return {
    id: `fallback-${p.slug}`,
    tagline: null,
    description: null,
    setup_price_pence: 0,
    monthly_price_pence: 0,
    currency: 'gbp',
    max_pages: 3,
    features: [],
    stripe_setup_price_id: null,
    stripe_monthly_price_id: null,
    stripe_product_id: null,
    is_active: true,
    is_featured: false,
    sort_order: 0,
    created_at: now,
    updated_at: now,
    ...p,
  } as PlanRow;
}

export const fallbackPlans: PlanRow[] = [
  plan({
    slug: 'starter',
    name: 'Starter',
    tagline: 'Everything a local business needs to be found.',
    description:
      'A clean, fast three page website that makes you look established and gets the phone ringing.',
    setup_price_pence: 29900,
    monthly_price_pence: 2900,
    max_pages: 3,
    sort_order: 1,
    features: [
      'Up to 3 pages',
      'Mobile responsive website',
      'Contact form',
      'WhatsApp button',
      'Google Maps',
      'SSL certificate',
      'Hosting included',
      'Basic SEO',
      'Basic analytics',
      'Business email setup guidance',
      'Minor website updates',
    ],
  }),
  plan({
    slug: 'business',
    name: 'Business',
    tagline: 'For businesses that want to be found locally.',
    description:
      'More pages, local SEO and a bilingual option — built for tradespeople covering several towns.',
    setup_price_pence: 49900,
    monthly_price_pence: 3900,
    max_pages: 6,
    is_featured: true,
    sort_order: 2,
    features: [
      'Everything in Starter',
      'Up to 6 pages',
      'Local SEO setup',
      'Google Business Profile integration',
      'Reviews section',
      'Image gallery',
      'Multiple service areas',
      'Welsh / bilingual option',
      'Monthly content updates',
    ],
  }),
  plan({
    slug: 'pro',
    name: 'Pro',
    tagline: 'For established businesses that want to grow.',
    description:
      'Advanced local SEO, booking and lead capture with priority support and frequent updates.',
    setup_price_pence: 79900,
    monthly_price_pence: 5900,
    max_pages: 10,
    sort_order: 3,
    features: [
      'Everything in Business',
      'Up to 10 pages',
      'Advanced local SEO',
      'Blog / news section',
      'Booking functionality',
      'Advanced lead forms',
      'Analytics dashboard',
      'Priority support',
      'More frequent content updates',
    ],
  }),
];
