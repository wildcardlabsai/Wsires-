import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* Shared building blocks for the marketing pages. */

export function Section({
  className,
  children,
  tone = 'default',
  id,
}: {
  className?: string;
  children: React.ReactNode;
  tone?: 'default' | 'cream' | 'charcoal' | 'white';
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        'py-16 sm:py-20 lg:py-24',
        tone === 'cream' && 'bg-cream-200/60',
        tone === 'white' && 'bg-white',
        tone === 'charcoal' && 'bg-charcoal-950 text-cream-100',
        className,
      )}
    >
      <div className="site-container">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  invert = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  invert?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            'mb-3 text-xs font-semibold uppercase tracking-[0.16em]',
            invert ? 'text-cymru-400' : 'text-cymru-600',
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'text-3xl font-semibold tracking-tight sm:text-4xl',
          invert ? 'text-white' : 'text-charcoal-900',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-4 text-[1.0625rem] leading-relaxed',
            invert ? 'text-charcoal-300' : 'text-charcoal-600',
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export function CheckList({
  items,
  className,
  invert = false,
  columns = 1,
}: {
  items: string[];
  className?: string;
  invert?: boolean;
  columns?: 1 | 2;
}) {
  return (
    <ul className={cn('space-y-3', columns === 2 && 'sm:grid sm:grid-cols-2 sm:gap-x-8 sm:space-y-0 sm:gap-y-3', className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span
            className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
              invert ? 'bg-cymru-500/20' : 'bg-moss-100',
            )}
          >
            <Check
              className={cn('h-3 w-3', invert ? 'text-cymru-400' : 'text-moss-700')}
              strokeWidth={3}
              aria-hidden
            />
          </span>
          <span className={cn('text-[0.9375rem] leading-relaxed', invert ? 'text-charcoal-300' : 'text-charcoal-700')}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function CtaBand({
  heading,
  body,
  primary,
  secondary,
}: {
  heading: string;
  body: string;
  primary: string;
  secondary: string;
}) {
  return (
    <section className="bg-charcoal-950">
      <div className="site-container py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{heading}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-charcoal-300">{body}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="xl">
              <Link href="/contact">
                {primary}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-charcoal-700 bg-transparent text-white hover:border-charcoal-600 hover:bg-charcoal-900 hover:text-white"
            >
              <Link href="/how-it-works">{secondary}</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-charcoal-500">
            No obligation · Cancel your plan any time · Built and supported in Wales
          </p>
        </div>
      </div>
    </section>
  );
}

/** Small label used everywhere a demonstration business appears. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-dashed border-charcoal-300 bg-white/90 px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-wide text-charcoal-500',
        className,
      )}
    >
      Example site
    </span>
  );
}
