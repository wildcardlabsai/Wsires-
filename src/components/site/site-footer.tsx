import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

import { telHref } from '@/lib/utils';
import type { BusinessRow } from '@/types/database';
import type { NavItem } from './site-header';
import type { ResolvedTheme } from './theme';

export function SiteFooter({
  businessName,
  business,
  nav,
  theme,
  isDemo,
}: {
  businessName: string;
  business: BusinessRow | null;
  nav: NavItem[];
  theme: ResolvedTheme;
  isDemo?: boolean;
}) {
  const year = new Date().getFullYear();
  const social = business?.social_links ?? {};

  return (
    <footer className="border-t" style={{ backgroundColor: theme.ink, borderColor: `${theme.ink}` }}>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-white">{businessName}</p>
            {business?.tagline && <p className="mt-2 text-sm text-white/60">{business.tagline}</p>}
            {(social.facebook || social.instagram) && (
              <div className="mt-4 flex gap-3">
                {social.facebook && (
                  <a href={social.facebook} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white" aria-label="Facebook">
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {social.instagram && (
                  <a href={social.instagram} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white" aria-label="Instagram">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Navigate</p>
            <ul className="mt-3 space-y-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/70 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Contact</p>
            <ul className="mt-3 space-y-2.5 text-sm text-white/70">
              {business?.phone && (
                <li>
                  <a href={telHref(business.phone) ?? '#'} className="inline-flex items-center gap-2 hover:text-white">
                    <Phone className="h-3.5 w-3.5" /> {business.phone}
                  </a>
                </li>
              )}
              {business?.email && (
                <li>
                  <a href={`mailto:${business.email}`} className="inline-flex items-center gap-2 hover:text-white">
                    <Mail className="h-3.5 w-3.5" /> {business.email}
                  </a>
                </li>
              )}
              {(business?.city || business?.postcode) && (
                <li className="inline-flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" /> {[business?.city, business?.postcode].filter(Boolean).join(', ')}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/40">
          <p>
            © {year} {businessName}. Website by{' '}
            <a href="https://cymrusites.co.uk" className="underline hover:text-white/70">
              CymruSites
            </a>
            .
          </p>
          {isDemo && <p className="mt-1.5 font-medium text-white/50">This is a demonstration website — not a real business.</p>}
        </div>
      </div>
    </footer>
  );
}
