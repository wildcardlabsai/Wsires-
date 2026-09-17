'use client';

import * as React from 'react';

import { DemoBadge } from '@/components/marketing/sections';
import { SitePreview } from '@/components/marketing/site-preview';
import { EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import type { PortfolioExample } from '@/lib/content/types';
import { cn } from '@/lib/utils';

export function ExamplesGrid({
  examples,
  categories,
}: {
  examples: PortfolioExample[];
  categories: readonly string[];
}) {
  const [active, setActive] = React.useState<string>('All');

  const available = React.useMemo(() => {
    const used = new Set(examples.map((e) => e.category));
    return ['All', ...categories.filter((c) => used.has(c))];
  }, [examples, categories]);

  const filtered = React.useMemo(
    () => (active === 'All' ? examples : examples.filter((e) => e.category === active)),
    [examples, active],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter examples by industry">
        {available.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={active === category}
            onClick={() => setActive(category)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              active === category
                ? 'border-charcoal-900 bg-charcoal-900 text-white'
                : 'border-border bg-white text-charcoal-600 hover:border-charcoal-300 hover:text-charcoal-900',
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-12"
          title="No examples in this category yet"
          description="We are adding demonstration sites as we build them. Try another category, or ask us what we would build for your business."
          action={{ label: 'Ask us', href: '/contact' }}
        />
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          {filtered.map((example) => (
            <article
              key={example.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-subtle transition-shadow hover:shadow-card"
            >
              <div className="bg-cream-200/70 p-6">
                <SitePreview
                  businessName={example.businessName}
                  location={example.location}
                  accent={example.accent}
                  template={example.templateSlug}
                />
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-charcoal-900">
                      {example.businessName}
                    </h2>
                    <p className="mt-0.5 text-sm text-charcoal-500">
                      {example.industry} · {example.location}
                    </p>
                  </div>
                  <DemoBadge className="shrink-0" />
                </div>

                <p className="mt-4 text-[0.9375rem] leading-relaxed text-charcoal-600">
                  {example.description}
                </p>

                <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
                  <div className="flex gap-3">
                    <dt className="w-20 shrink-0 text-charcoal-400">Pages</dt>
                    <dd className="text-charcoal-700">{example.pages.join(' · ')}</dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="w-20 shrink-0 text-charcoal-400">Features</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {example.features.map((feature) => (
                        <Badge key={feature} variant="secondary" size="sm">
                          {feature}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
