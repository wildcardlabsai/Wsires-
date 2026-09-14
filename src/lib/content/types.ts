export interface BrandSettings {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  addressLines: string[];
  companyNumber?: string;
  vatNumber?: string;
  social: { facebook?: string; instagram?: string; linkedin?: string; x?: string };
}

export interface HeroSettings {
  eyebrow: string;
  heading: string;
  subheading: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  bullets: string[];
}

export interface HowItWorksStep {
  title: string;
  description: string;
  detail?: string;
}

export interface ValueProp {
  title: string;
  description: string;
  icon: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  location: string;
  rating?: number;
}

export interface Faq {
  question: string;
  answer: string;
  category?: string;
}

export interface IndustryContent {
  slug: string;
  name: string;
  navLabel: string;
  headline: string;
  subheading: string;
  intro: string;
  heroImage: string;
  painPoints: string[];
  features: string[];
  typicalPages: string[];
  exampleSlug?: string;
  faqs: Faq[];
  seoTitle: string;
  seoDescription: string;
}

export interface PortfolioExample {
  slug: string;
  businessName: string;
  industry: string;
  category: string;
  location: string;
  description: string;
  pages: string[];
  features: string[];
  templateSlug: string;
  accent: string;
  demoHref: string;
}

export interface SeoDefaults {
  title: string;
  description: string;
  ogImage?: string;
}

export interface SiteContent {
  brand: BrandSettings;
  hero: HeroSettings;
  trustStrip: { heading: string; items: string[]; stats: { value: string; label: string }[] };
  promise: { heading: string; body: string; points: string[] };
  howItWorks: { heading: string; subheading: string; steps: HowItWorksStep[] };
  whyUs: { heading: string; subheading: string; items: ValueProp[] };
  included: { heading: string; subheading: string; items: string[] };
  welsh: { heading: string; body: string; points: string[] };
  localSeo: { heading: string; body: string; points: string[] };
  testimonials: Testimonial[];
  faqs: Faq[];
  finalCta: { heading: string; body: string; primary: string; secondary: string };
  seo: SeoDefaults;
}
