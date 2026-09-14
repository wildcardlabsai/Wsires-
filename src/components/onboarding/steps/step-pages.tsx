'use client';

import { Check } from 'lucide-react';

import { PAGE_CATALOG } from '@/lib/websites/pages-catalog';
import { cn } from '@/lib/utils';
import type { StepProps } from '../wizard-context';

export function StepPages({ draft, update, errors }: StepProps) {
  function toggle(key: string, required?: boolean) {
    if (required) return;
    const has = draft.pages.includes(key);
    update({ pages: has ? draft.pages.filter((p) => p !== key) : [...draft.pages, key] });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-charcoal-600">
        Choose the pages your website needs. Home, Services and Contact are included on every plan.
      </p>
      {errors.pages && <p className="text-xs font-medium text-destructive">{errors.pages}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {PAGE_CATALOG.map((page) => {
          const active = draft.pages.includes(page.key) || page.required;
          return (
            <button
              key={page.key}
              type="button"
              onClick={() => toggle(page.key, page.required)}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-4 text-left transition-all',
                active ? 'border-charcoal-900 bg-cream-100' : 'border-border bg-white hover:border-charcoal-300',
                page.required && 'cursor-default opacity-90',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                  active ? 'border-charcoal-900 bg-charcoal-900 text-white' : 'border-charcoal-300 bg-white',
                )}
              >
                {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
              <span>
                <span className="flex items-center gap-2 text-sm font-semibold text-charcoal-900">
                  {page.title}
                  {page.required && (
                    <span className="rounded-full bg-charcoal-100 px-1.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-wide text-charcoal-500">
                      Included
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-charcoal-500">{page.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
