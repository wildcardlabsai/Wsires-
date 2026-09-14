'use client';

import { SitePreview } from '@/components/marketing/site-preview';
import { cn } from '@/lib/utils';
import type { WebsiteTemplateRow } from '@/types/database';
import type { StepProps } from '../wizard-context';

export function StepStyle({ draft, update, errors, templates }: StepProps & { templates: WebsiteTemplateRow[] }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-charcoal-600">
        Choose the layout that suits your business. We’ll shape it around your colours, logo and photos.
      </p>
      {errors.templateSlug && <p className="text-xs font-medium text-destructive">{errors.templateSlug}</p>}

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
