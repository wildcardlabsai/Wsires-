import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { PlanRow } from '@/types/database';

interface PricingCardsProps {
  plans: PlanRow[];
  /** Where the CTA goes — signup carries the chosen plan through. */
  ctaHref?: (plan: PlanRow) => string;
  ctaLabel?: string;
  className?: string;
}

export function PricingCards({
  plans,
  ctaHref = (plan) => `/signup?plan=${plan.slug}`,
  ctaLabel = 'Choose',
  className,
}: PricingCardsProps) {
  return (
    <div className={cn('grid gap-6 lg:grid-cols-3', className)}>
      {plans.map((plan) => {
        const featured = plan.is_featured;
        return (
          <div
            key={plan.id}
            className={cn(
              'relative flex flex-col rounded-2xl border bg-white p-7 transition-shadow',
              featured
                ? 'border-charcoal-900 shadow-lift lg:-my-3 lg:py-10'
                : 'border-border shadow-subtle hover:shadow-card',
            )}
          >
            {featured && (
              <span className="absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-full bg-charcoal-900 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-white">
                <Sparkles className="h-3 w-3" aria-hidden />
                Most popular
              </span>
            )}

            <h3 className="text-xl font-semibold tracking-tight text-charcoal-900">{plan.name}</h3>
            {plan.tagline && <p className="mt-1.5 text-sm text-charcoal-500">{plan.tagline}</p>}

            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="text-[2.75rem] font-semibold leading-none tracking-tight text-charcoal-900">
                {formatPrice(plan.setup_price_pence)}
              </span>
              <span className="text-sm text-charcoal-500">setup</span>
            </div>
            <p className="mt-2 text-[0.9375rem] text-charcoal-600">
              then{' '}
              <span className="font-semibold text-charcoal-900">
                {formatPrice(plan.monthly_price_pence)}
              </span>{' '}
              a month
            </p>

            <Button
              asChild
              className="mt-6 w-full"
              size="lg"
              variant={featured ? 'default' : 'outline'}
            >
              <Link href={ctaHref(plan)}>
                {ctaLabel} {plan.name}
              </Link>
            </Button>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal-400">
              What’s included
            </p>
            <ul className="mt-4 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss-600" strokeWidth={2.5} aria-hidden />
                  <span className="text-sm leading-relaxed text-charcoal-700">{feature}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 border-t border-border pt-4 text-xs text-charcoal-500">
              Up to {plan.max_pages} pages · Cancel any time
            </p>
          </div>
        );
      })}
    </div>
  );
}
