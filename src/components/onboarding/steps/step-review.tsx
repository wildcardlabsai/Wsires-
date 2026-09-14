'use client';

import { industryLabel } from '@/lib/status';
import { PAGE_CATALOG } from '@/lib/websites/pages-catalog';
import type { WebsiteTemplateRow } from '@/types/database';
import type { OnboardingDraft } from '../wizard-context';

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-0 sm:flex-row sm:gap-8">
      <dt className="text-sm text-charcoal-500 sm:w-44 sm:shrink-0">{label}</dt>
      <dd className="text-sm font-medium text-charcoal-900">{value || <span className="text-charcoal-400">Not provided</span>}</dd>
    </div>
  );
}

export function StepReview({ draft, templates }: { draft: OnboardingDraft; templates: WebsiteTemplateRow[] }) {
  const template = templates.find((t) => t.slug === draft.templateSlug);
  const pageNames = draft.pages.map((key) => PAGE_CATALOG.find((p) => p.key === key)?.title ?? key);
  const languageLabel =
    draft.languageMode === 'bilingual' ? 'Bilingual (English & Welsh)' : draft.languageMode === 'cy' ? 'Welsh' : 'English';

  return (
    <div className="space-y-8">
      <p className="text-sm text-charcoal-600">
        Here’s everything you’ve told us. Have a check through, then submit — we’ll take it from here.
      </p>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-cymru-600">Business</h3>
        <dl className="mt-2">
          <ReviewRow label="Business name" value={draft.businessName} />
          <ReviewRow label="Contact" value={`${draft.contactName} · ${draft.email} · ${draft.phone}`} />
          <ReviewRow
            label="Address"
            value={[draft.addressLine1, draft.addressLine2, draft.city, draft.postcode].filter(Boolean).join(', ')}
          />
          <ReviewRow label="Industry" value={draft.industry === 'other' ? draft.industryOther : industryLabel(draft.industry)} />
        </dl>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-cymru-600">Services & areas</h3>
        <dl className="mt-2">
          <ReviewRow label="Services" value={draft.services.map((s) => s.title).filter(Boolean).join(', ')} />
          <ReviewRow label="Areas covered" value={draft.serviceAreas.join(', ')} />
        </dl>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-cymru-600">Design</h3>
        <dl className="mt-2">
          <ReviewRow label="Website style" value={template?.name} />
          <ReviewRow label="Colour scheme" value={draft.colourScheme} />
          <ReviewRow label="Logo" value={draft.logoUrl ? 'Uploaded' : undefined} />
          <ReviewRow label="Photos" value={draft.photoUrls.length > 0 ? `${draft.photoUrls.length} uploaded` : undefined} />
        </dl>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-cymru-600">Pages & language</h3>
        <dl className="mt-2">
          <ReviewRow label="Pages" value={pageNames.join(', ')} />
          <ReviewRow label="Language" value={languageLabel} />
        </dl>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-cymru-600">Content</h3>
        <dl className="mt-2">
          <ReviewRow label="About" value={draft.aboutText ? 'Provided' : undefined} />
          <ReviewRow label="Team members" value={draft.teamMembers.length > 0 ? String(draft.teamMembers.length) : undefined} />
          <ReviewRow label="Testimonials" value={draft.testimonials.length > 0 ? String(draft.testimonials.length) : undefined} />
          <ReviewRow label="FAQs" value={draft.faqs.length > 0 ? String(draft.faqs.length) : undefined} />
        </dl>
      </section>
    </div>
  );
}
