'use client';

import {
  Droplets,
  Hammer,
  Landmark,
  Leaf,
  MoreHorizontal,
  UtensilsCrossed,
  Wrench,
  Zap,
} from 'lucide-react';

import { Field } from '@/components/shared/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { StepProps } from '../wizard-context';

const INDUSTRIES = [
  { value: 'plumbing', label: 'Plumbing', icon: Droplets },
  { value: 'electrical', label: 'Electrical', icon: Zap },
  { value: 'building', label: 'Building', icon: Hammer },
  { value: 'roofing', label: 'Roofing', icon: Hammer },
  { value: 'landscaping', label: 'Landscaping', icon: Leaf },
  { value: 'automotive', label: 'Automotive', icon: Wrench },
  { value: 'hospitality', label: 'Hospitality', icon: UtensilsCrossed },
  { value: 'professional_services', label: 'Professional services', icon: Landmark },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

export function StepIndustry({ draft, update, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-charcoal-800">What industry are you in?</p>
        {errors.industry && <p className="mt-1 text-xs font-medium text-destructive">{errors.industry}</p>}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {INDUSTRIES.map((industry) => {
            const Icon = industry.icon;
            const active = draft.industry === industry.value;
            return (
              <button
                key={industry.value}
                type="button"
                onClick={() => update({ industry: industry.value })}
                className={cn(
                  'flex flex-col items-center gap-2.5 rounded-xl border p-5 text-center transition-all',
                  active
                    ? 'border-charcoal-900 bg-charcoal-900 text-white shadow-card'
                    : 'border-border bg-white text-charcoal-700 hover:border-charcoal-300',
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="text-sm font-medium">{industry.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {draft.industry === 'other' && (
        <Field label="Tell us what you do" htmlFor="industryOther" error={errors.industryOther}>
          <Input value={draft.industryOther} onChange={(e) => update({ industryOther: e.target.value })} />
        </Field>
      )}
    </div>
  );
}
