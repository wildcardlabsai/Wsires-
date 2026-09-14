'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';

import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
}

const NAV: NavItem[] = [
  { label: 'Websites', href: '/websites' },
  {
    label: 'Industries',
    href: '/industries',
    children: [
      { label: 'All trades', href: '/industries/trades', description: 'Every trade, one approach' },
      { label: 'Plumbers', href: '/industries/plumbers', description: 'Emergency call-outs and boilers' },
      { label: 'Electricians', href: '/industries/electricians', description: 'Domestic and commercial' },
      { label: 'Builders', href: '/industries/builders', description: 'Extensions and renovations' },
      { label: 'Roofers', href: '/industries/roofers', description: 'Repairs and re-roofs' },
      { label: 'Landscapers', href: '/industries/landscapers', description: 'Design and maintenance' },
      { label: 'Automotive', href: '/industries/automotive', description: 'Garages and MOT centres' },
      { label: 'Hospitality', href: '/industries/hospitality', description: 'Cafés, pubs and B&Bs' },
      {
        label: 'Professional services',
        href: '/industries/professional-services',
        description: 'Accountants and solicitors',
      },
    ],
  },
  { label: 'Examples', href: '/examples' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'How it works', href: '/how-it-works' },
];

export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [industriesOpen, setIndustriesOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setMobileOpen(false);
    setIndustriesOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIndustriesOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setIndustriesOpen(false), 120);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only-focusable absolute left-4 top-3 z-50 rounded-md bg-charcoal-900 px-4 py-2 text-sm text-white"
      >
        Skip to content
      </a>

      <div className="site-container flex h-[70px] items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) =>
            item.children ? (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={openMenu}
                onMouseLeave={scheduleClose}
              >
                <button
                  type="button"
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'text-charcoal-900'
                      : 'text-charcoal-600 hover:text-charcoal-900',
                  )}
                  aria-expanded={industriesOpen}
                  aria-haspopup="true"
                  onClick={() => setIndustriesOpen((v) => !v)}
                >
                  {item.label}
                  <ChevronDown
                    className={cn('h-3.5 w-3.5 transition-transform', industriesOpen && 'rotate-180')}
                    aria-hidden
                  />
                </button>

                {industriesOpen && (
                  <div
                    className="absolute left-1/2 top-full z-50 w-[560px] -translate-x-1/2 pt-3"
                    onMouseEnter={openMenu}
                    onMouseLeave={scheduleClose}
                  >
                    <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-white p-2 shadow-lift animate-fade-in">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="rounded-lg px-3 py-2.5 transition-colors hover:bg-cream-200"
                        >
                          <span className="block text-sm font-medium text-charcoal-900">{child.label}</span>
                          {child.description && (
                            <span className="mt-0.5 block text-xs text-charcoal-500">{child.description}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.href) ? 'text-charcoal-900' : 'text-charcoal-600 hover:text-charcoal-900',
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {signedIn ? (
            <Button asChild size="sm" variant="secondary">
              <Link href="/dashboard">Your dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-charcoal-700 hover:bg-charcoal-100 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 bottom-0 top-[70px] z-40 overflow-y-auto border-t border-border bg-background lg:hidden"
        >
          <nav className="site-container flex flex-col py-6" aria-label="Mobile">
            {NAV.filter((i) => !i.children).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-border/70 py-4 text-lg font-medium text-charcoal-900"
              >
                {item.label}
              </Link>
            ))}

            <p className="pb-2 pt-6 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal-400">
              Industries
            </p>
            <div className="grid grid-cols-2 gap-x-4">
              {NAV.find((i) => i.children)?.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="border-b border-border/70 py-3 text-[0.9375rem] text-charcoal-700"
                >
                  {child.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3">
              {signedIn ? (
                <Button asChild size="lg">
                  <Link href="/dashboard">Your dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link href="/signup">Get your website started</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/login">Log in</Link>
                  </Button>
                </>
              )}
              <Button asChild size="lg" variant="ghost">
                <Link href="/contact">Talk to us</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
