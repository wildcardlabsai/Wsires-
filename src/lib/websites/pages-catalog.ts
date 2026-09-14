/**
 * The pool of pages a customer can choose from during onboarding (step 7),
 * and what each becomes as a `website_pages` row. Kept in one place so the
 * wizard UI and the submit handler never drift apart.
 */
export interface PageCatalogItem {
  key: string;
  slug: string;
  title: string;
  navLabel: string;
  pageType: string;
  isHome?: boolean;
  description: string;
  /** Included automatically and cannot be unselected. */
  required?: boolean;
}

export const PAGE_CATALOG: PageCatalogItem[] = [
  {
    key: 'home',
    slug: '',
    title: 'Home',
    navLabel: 'Home',
    pageType: 'home',
    isHome: true,
    required: true,
    description: 'Who you are, what you do and how to reach you.',
  },
  {
    key: 'services',
    slug: 'services',
    title: 'Services',
    navLabel: 'Services',
    pageType: 'services',
    required: true,
    description: 'A page for everything you do.',
  },
  {
    key: 'contact',
    slug: 'contact',
    title: 'Contact',
    navLabel: 'Contact',
    pageType: 'contact',
    required: true,
    description: 'Form, phone, map and opening hours.',
  },
  {
    key: 'about',
    slug: 'about',
    title: 'About',
    navLabel: 'About',
    pageType: 'about',
    description: 'The people and story behind the business.',
  },
  {
    key: 'areas',
    slug: 'areas',
    title: 'Areas we cover',
    navLabel: 'Areas',
    pageType: 'areas',
    description: 'A page listing the towns and areas you serve.',
  },
  {
    key: 'gallery',
    slug: 'gallery',
    title: 'Gallery',
    navLabel: 'Gallery',
    pageType: 'gallery',
    description: 'Photos of your work.',
  },
  {
    key: 'reviews',
    slug: 'reviews',
    title: 'Reviews',
    navLabel: 'Reviews',
    pageType: 'reviews',
    description: 'Testimonials and your Google rating.',
  },
  {
    key: 'faq',
    slug: 'faq',
    title: 'FAQ',
    navLabel: 'FAQ',
    pageType: 'faq',
    description: 'The questions you get asked most.',
  },
  {
    key: 'blog',
    slug: 'news',
    title: 'News',
    navLabel: 'News',
    pageType: 'blog',
    description: 'Updates, offers and articles (Pro plan).',
  },
  {
    key: 'booking',
    slug: 'book',
    title: 'Book online',
    navLabel: 'Book online',
    pageType: 'booking',
    description: 'A booking enquiry page (Pro plan).',
  },
];

export const DEFAULT_PAGE_KEYS = ['home', 'services', 'about', 'areas', 'contact'];

export function pageCatalogItem(key: string): PageCatalogItem | undefined {
  return PAGE_CATALOG.find((p) => p.key === key);
}
