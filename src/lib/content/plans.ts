import type { Plan } from './types';

/**
 * Pricing plans shown on the marketing site.
 *
 * There is no admin panel or database — to change pricing, edit this file.
 */

function plan(p: Partial<Plan> & Pick<Plan, 'slug' | 'name'>): Plan {
  return {
    id: p.slug,
    tagline: null,
    description: null,
    setupPricePence: 0,
    monthlyPricePence: 0,
    currency: 'gbp',
    maxPages: 3,
    features: [],
    isFeatured: false,
    sortOrder: 0,
    ...p,
  } as Plan;
}

export const plans: Plan[] = [
  plan({
    slug: 'starter',
    name: 'Starter',
    tagline: 'Everything a local business needs to be found.',
    description:
      'A clean, fast three page website that makes you look established and gets the phone ringing.',
    setupPricePence: 29900,
    monthlyPricePence: 2900,
    maxPages: 3,
    sortOrder: 1,
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
    setupPricePence: 49900,
    monthlyPricePence: 3900,
    maxPages: 6,
    isFeatured: true,
    sortOrder: 2,
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
    setupPricePence: 79900,
    monthlyPricePence: 5900,
    maxPages: 10,
    sortOrder: 3,
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
