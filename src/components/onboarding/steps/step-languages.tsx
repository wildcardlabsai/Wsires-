'use client';

import { cn } from '@/lib/utils';
import type { StepProps } from '../wizard-context';

const OPTIONS: { value: StepProps['draft']['languageMode']; label: string; description: string }[] = [
  { value: 'en', label: 'English', description: 'Your website is built in English only.' },
  { value: 'cy', label: 'Cymraeg (Welsh)', description: 'Your website is built in Welsh only.' },
  {
    value: 'bilingual',
    label: 'Bilingual (English & Welsh)',
    description: 'A language switch on every page, with separate content for each language.',
  },
];

export function StepLanguages({ draft, update }: StepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-charcoal-600">Which language should your website be built in?</p>
      {OPTIONS.map((option) => {
        const active = draft.languageMode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => update({ languageMode: option.value })}
            className={cn(
              'flex w-full items-start gap-4 rounded-xl border p-5 text-left transition-all',
              active ? 'border-charcoal-900 bg-cream-100 shadow-subtle' : 'border-border bg-white hover:border-charcoal-300',
            )}
          >
            <span
              className={cn(
                'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                active ? 'border-charcoal-900' : 'border-charcoal-300',
              )}
            >
              {active && <span className="h-2.5 w-2.5 rounded-full bg-charcoal-900" />}
            </span>
            <span>
              <span className="block text-sm font-semibold text-charcoal-900">{option.label}</span>
              <span className="mt-1 block text-sm text-charcoal-500">{option.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
