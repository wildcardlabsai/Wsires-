'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';

import { Logo } from '@/components/shared/logo';
import { FormError } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { fieldErrors } from '@/lib/validation/schemas';
import {
  onboardingStep1,
  onboardingStep2,
  onboardingStep3,
  onboardingStep4,
  onboardingStep5,
  onboardingStep6,
  onboardingStep7,
  onboardingStep8,
} from '@/lib/validation/schemas';
import { cn } from '@/lib/utils';
import type { WebsiteTemplateRow } from '@/types/database';

import { StepAreas } from './steps/step-areas';
import { StepBrand } from './steps/step-brand';
import { StepBusiness } from './steps/step-business';
import { StepContent } from './steps/step-content';
import { StepIndustry } from './steps/step-industry';
import { StepLanguages } from './steps/step-languages';
import { StepPages } from './steps/step-pages';
import { StepReview } from './steps/step-review';
import { StepServices } from './steps/step-services';
import { StepStyle } from './steps/step-style';
import { emptyDraft, type OnboardingDraft } from './wizard-context';

const STEPS = [
  { title: 'Business details', schema: onboardingStep1 },
  { title: 'Industry', schema: onboardingStep2 },
  { title: 'Services', schema: onboardingStep3 },
  { title: 'Service areas', schema: onboardingStep4 },
  { title: 'Brand', schema: onboardingStep5 },
  { title: 'Website style', schema: onboardingStep6 },
  { title: 'Pages', schema: onboardingStep7 },
  { title: 'Language', schema: onboardingStep8 },
  { title: 'Content', schema: null },
  { title: 'Review & submit', schema: null },
] as const;

function extractStepData(draft: OnboardingDraft, stepIndex: number): Record<string, unknown> {
  switch (stepIndex) {
    case 0:
      return {
        businessName: draft.businessName,
        contactName: draft.contactName,
        email: draft.email,
        phone: draft.phone,
        addressLine1: draft.addressLine1,
        addressLine2: draft.addressLine2,
        city: draft.city,
        postcode: draft.postcode,
        existingWebsite: draft.existingWebsite,
        description: draft.description,
      };
    case 1:
      return { industry: draft.industry, industryOther: draft.industryOther };
    case 2:
      return { services: draft.services };
    case 3:
      return { serviceAreas: draft.serviceAreas };
    case 4:
      return {
        logoUrl: draft.logoUrl,
        colourScheme: draft.colourScheme,
        primaryColour: draft.primaryColour,
        secondaryColour: draft.secondaryColour,
        photoUrls: draft.photoUrls,
      };
    case 5:
      return { templateSlug: draft.templateSlug };
    case 6:
      return { pages: draft.pages };
    case 7:
      return { languageMode: draft.languageMode };
    case 8:
      return {
        aboutText: draft.aboutText,
        teamMembers: draft.teamMembers,
        testimonials: draft.testimonials,
        faqs: draft.faqs,
        openingHours: draft.openingHours,
        socialLinks: draft.socialLinks,
        whatsappNumber: draft.whatsappNumber,
      };
    default:
      return {};
  }
}

export function OnboardingWizard({
  customerId,
  templates,
}: {
  customerId: string;
  templates: WebsiteTemplateRow[];
}) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [draft, setDraft] = React.useState<OnboardingDraft>(emptyDraft);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/onboarding');
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (cancelled) return;

        const saved = result.data.submission.data as Partial<OnboardingDraft>;
        setDraft({ ...emptyDraft, ...saved });
        setStep(Math.max(0, Math.min((result.data.submission.current_step ?? 1) - 1, STEPS.length - 1)));
      } catch {
        toast.error('Could not load your progress', 'Starting fresh instead.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function update(patch: Partial<OnboardingDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  async function persist(stepIndex: number, silent = false) {
    if (!silent) setSaving(true);
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepIndex + 1, data: extractStepData(draft, stepIndex) }),
      });
    } catch {
      /* Autosave failures are non-fatal — the next successful save catches up. */
    } finally {
      if (!silent) setSaving(false);
    }
  }

  async function goNext() {
    setErrors({});
    setFormError(null);

    const currentStep = STEPS[step]!;
    if (currentStep.schema) {
      const parsed = currentStep.schema.safeParse(extractStepData(draft, step));
      if (!parsed.success) {
        setErrors(fieldErrors(parsed.error));
        return;
      }
    }

    await persist(step);

    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function goBack() {
    setErrors({});
    setFormError(null);
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setFormError(null);
    await persist(step, true);

    try {
      const response = await fetch('/api/onboarding/submit', { method: 'POST' });
      const result = await response.json();

      if (!response.ok) {
        setFormError(result.error ?? 'We couldn’t submit your website request.');
        setSubmitting(false);
        return;
      }

      toast.success('Website request submitted', 'We’ll start building and be in touch soon.');
      router.push('/dashboard?onboarding=submitted');
      router.refresh();
    } catch {
      setFormError('We couldn’t reach the server. Check your connection and try again.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-charcoal-400" />
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;
  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-6 sm:py-12">
      <div className="flex items-center justify-between">
        <Logo />
        <span className="text-sm text-charcoal-500">
          Step {step + 1} of {STEPS.length}
        </span>
      </div>

      <Progress value={progress} className="mt-5" />

      <div className="mt-3 hidden gap-1 overflow-x-auto sm:flex">
        {STEPS.map((s, i) => (
          <span
            key={s.title}
            className={cn(
              'whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium',
              i === step
                ? 'bg-charcoal-900 text-white'
                : i < step
                  ? 'text-moss-700'
                  : 'text-charcoal-400',
            )}
          >
            {i < step && <Check className="mr-1 inline h-3 w-3" />}
            {s.title}
          </span>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-subtle sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight text-charcoal-900">{STEPS[step]!.title}</h1>

        <div className="mt-6">
          <FormError message={formError} />

          <div className={formError ? 'mt-5' : undefined}>
            {step === 0 && <StepBusiness draft={draft} update={update} errors={errors} />}
            {step === 1 && <StepIndustry draft={draft} update={update} errors={errors} />}
            {step === 2 && <StepServices draft={draft} update={update} errors={errors} />}
            {step === 3 && <StepAreas draft={draft} update={update} errors={errors} />}
            {step === 4 && <StepBrand draft={draft} update={update} errors={errors} />}
            {step === 5 && <StepStyle draft={draft} update={update} errors={errors} templates={templates} />}
            {step === 6 && <StepPages draft={draft} update={update} errors={errors} />}
            {step === 7 && <StepLanguages draft={draft} update={update} errors={errors} />}
            {step === 8 && <StepContent draft={draft} update={update} errors={errors} />}
            {step === 9 && <StepReview draft={draft} templates={templates} />}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <Button type="button" variant="ghost" onClick={goBack} disabled={step === 0 || submitting}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {saving && <span className="text-xs text-charcoal-400">Saving…</span>}
            {isLastStep ? (
              <Button type="button" onClick={handleSubmit} loading={submitting} loadingText="Submitting…">
                Submit website request
              </Button>
            ) : (
              <Button type="button" onClick={goNext}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-charcoal-400">Your progress is saved automatically as you go.</p>
    </div>
  );
}
