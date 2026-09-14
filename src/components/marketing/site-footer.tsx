import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

import { Logo } from '@/components/shared/logo';
import type { BrandSettings } from '@/lib/content/types';

const FOOTER_SECTIONS = [
  {
    heading: 'Websites',
    links: [
      { label: 'What you get', href: '/websites' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Examples', href: '/examples' },
    ],
  },
  {
    heading: 'Industries',
    links: [
      { label: 'Plumbers', href: '/industries/plumbers' },
      { label: 'Electricians', href: '/industries/electricians' },
      { label: 'Builders', href: '/industries/builders' },
      { label: 'Roofers', href: '/industries/roofers' },
      { label: 'Landscapers', href: '/industries/landscapers' },
      { label: 'All industries', href: '/industries' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Log in', href: '/login' },
    ],
  },
];

export function SiteFooter({ brand }: { brand: BrandSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-charcoal-950 text-charcoal-300">
      <div className="site-container py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo href="/" invert />
            <p className="mt-4 text-sm leading-relaxed text-charcoal-400">{brand.tagline}</p>

            <div className="mt-6 space-y-2.5 text-sm">
              <a
                href={`mailto:${brand.email}`}
                className="inline-flex items-center gap-2.5 text-charcoal-300 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 text-charcoal-500" aria-hidden />
                {brand.email}
              </a>
              <br />
              <a
                href={`tel:${brand.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2.5 text-charcoal-300 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 text-charcoal-500" aria-hidden />
                {brand.phone}
              </a>
            </div>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-charcoal-500">
                {section.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-charcoal-300 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-charcoal-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-charcoal-500">
            © {year} {brand.name}. Websites built and hosted in Wales.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/terms" className="text-xs text-charcoal-400 transition-colors hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-charcoal-400 transition-colors hover:text-white">
              Privacy
            </Link>
            <span className="text-xs text-charcoal-600">Cymru · Wales</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
