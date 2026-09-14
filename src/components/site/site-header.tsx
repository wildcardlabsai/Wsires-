'use client';

import Link from 'next/link';
import * as React from 'react';
import { Menu, Phone, X } from 'lucide-react';

import { telHref } from '@/lib/utils';
import type { ResolvedTheme } from './theme';

export interface NavItem {
  label: string;
  href: string;
}

export function SiteHeader({
  businessName,
  logoUrl,
  phone,
  nav,
  theme,
  currentPath,
}: {
  businessName: string;
  logoUrl?: string | null;
  phone?: string | null;
  nav: NavItem[];
  theme: ResolvedTheme;
  currentPath: string;
}) {
  const [open, setOpen] = React.useState(false);
  const transparent = theme.navStyle === 'transparent';

  return (
    <header
      className={transparent ? 'absolute inset-x-0 top-0 z-40' : 'sticky top-0 z-40 border-b'}
      style={transparent ? undefined : { backgroundColor: theme.surface, borderColor: `${theme.ink}14` }}
    >
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={businessName} className="h-9 w-auto object-contain" />
          ) : (
            <span
              className={transparent ? 'text-lg font-bold text-white' : 'text-lg font-bold'}
              style={transparent ? undefined : { color: theme.ink }}
            >
              {businessName}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                transparent
                  ? 'text-sm font-medium text-white/90 hover:text-white'
                  : 'text-sm font-medium hover:opacity-70'
              }
              style={transparent ? undefined : { color: theme.ink }}
              aria-current={currentPath === item.href ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {phone && (
            <a
              href={telHref(phone) ?? '#'}
              className="hidden items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white sm:inline-flex"
              style={{ backgroundColor: theme.accent }}
            >
              <Phone className="h-3.5 w-3.5" />
              {phone}
            </a>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden ${transparent ? 'text-white' : ''}`}
            style={transparent ? undefined : { color: theme.ink }}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t bg-white px-5 py-4 md:hidden" style={{ borderColor: `${theme.ink}14` }}>
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium"
                style={{ color: theme.ink }}
              >
                {item.label}
              </Link>
            ))}
            {phone && (
              <a
                href={telHref(phone) ?? '#'}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: theme.accent }}
              >
                <Phone className="h-3.5 w-3.5" /> {phone}
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
