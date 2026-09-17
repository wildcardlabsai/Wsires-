'use client';

import { Check } from 'lucide-react';

import { SitePreview } from '@/components/marketing/site-preview';
import { cn } from '@/lib/utils';
import type { WebsiteTemplateRow } from '@/types/database';
import type { StepProps } from '../wizard-context';

export function StepStyle({ draft, update, errors, templates }: StepProps & { templates: WebsiteTemplateRow[] }) {
  const noPreference = draft.templateSlug === '';

  return (
    <div className="space-y-4">
      <p className="text-sm text-charcoal-600">
        If one of these styles appeals, pick it as a starting point — entirely optional. We’ll design your
        actual website around your business either way, so don’t worry about getting this exactly right.
      </p>
      {errors.templateSlug && <p className="text-xs font-medium text-destructive">{errors.templateSlug}</p>}

      <button
        type="button"
        onClick={() => update({ templateSlug: '' })}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all',
          noPreference ? 'border-charcoal-900 bg-cream-100 shadow-subtle' : 'border-border bg-white hover:border-charcoal-300',
        )}
      >
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
            noPreference ? 'border-charcoal-900' : 'border-charcoal-300',
          )}
        >
          {noPreference && <Check className="h-3 w-3" strokeWidth={3} />}
        </span>
        <span>
          <span className="block text-sm font-semibold text-charcoal-900">No preference — you choose</span>
          <span className="block text-sm text-charcoal-500">
            We’ll pick the style that best fits your trade and content.
          </span>
        </span>
      </button>

      <div className="grid gap-5 sm:grid-cols-2">
        {templates.map((template) => {
          const active = draft.templateSlug === template.slug;
          const accent = (template.style_tokens as { accent?: string })?.accent ?? '#C8102E';
          return (
            <button
              key={template.slug}
              type="button"
              onClick={() => update({ templateSlug: template.slug })}
              className={cn(
                'rounded-xl border p-4 text-left transition-all',
                active ? 'border-charcoal-900 shadow-lift' : 'border-border hover:border-charcoal-300',
              )}
            >
              <SitePreview
                businessName={draft.businessName || 'Your Business'}
                location={draft.city || 'Wales'}
                accent={accent}
                template={template.slug}
                compact
              />
              <p className="mt-3 text-sm font-semibold text-charcoal-900">{template.name}</p>
              {template.best_for && <p className="mt-0.5 text-xs text-charcoal-500">{template.best_for}</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
