'use client';

import { Field } from '@/components/shared/form-field';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ImageUpload } from '../image-upload';
import type { StepProps } from '../wizard-context';

const SCHEMES = [
  { value: 'cymru-red', label: 'Cymru red', colour: '#C8102E' },
  { value: 'valley-green', label: 'Valley green', colour: '#2F5444' },
  { value: 'slate-blue', label: 'Slate blue', colour: '#1D4ED8' },
  { value: 'warm-amber', label: 'Warm amber', colour: '#B45309' },
  { value: 'heather', label: 'Heather', colour: '#7C2D45' },
  { value: 'custom', label: 'Custom colours', colour: '#6B675F' },
];

export function StepBrand({ draft, update, errors }: StepProps) {
  return (
    <div className="space-y-7">
      <ImageUpload
        kind="logo"
        label="Your logo"
        hint="Optional — if you don’t have one, we’ll design your name and services in a clean typographic style."
        value={draft.logoUrl ? [draft.logoUrl] : []}
        onChange={(urls) => update({ logoUrl: urls[0] ?? '' })}
      />

      <div>
        <Label>Colour scheme</Label>
        {errors.colourScheme && <p className="mt-1 text-xs font-medium text-destructive">{errors.colourScheme}</p>}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SCHEMES.map((scheme) => {
            const active = draft.colourScheme === scheme.value;
            return (
              <button
                key={scheme.value}
                type="button"
                onClick={() => update({ colourScheme: scheme.value })}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3.5 text-left transition-all',
                  active ? 'border-charcoal-900 shadow-subtle' : 'border-border hover:border-charcoal-300',
                )}
              >
                <span
                  className="h-8 w-8 shrink-0 rounded-full ring-2 ring-white ring-offset-2"
                  style={{ backgroundColor: scheme.colour, ...(active ? { boxShadow: '0 0 0 2px #1C1B19' } : {}) }}
                  aria-hidden
                />
                <span className="text-sm font-medium text-charcoal-800">{scheme.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {draft.colourScheme === 'custom' && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Primary colour" htmlFor="primaryColour" error={errors.primaryColour} hint="Hex code, e.g. #C8102E">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={draft.primaryColour || '#C8102E'}
                onChange={(e) => update({ primaryColour: e.target.value })}
                className="h-11 w-11 shrink-0 cursor-pointer rounded-md border border-input"
              />
              <input
                value={draft.primaryColour}
                onChange={(e) => update({ primaryColour: e.target.value })}
                placeholder="#C8102E"
                className="h-11 w-full rounded-md border border-input px-3 text-sm"
              />
            </div>
          </Field>
          <Field label="Secondary colour" htmlFor="secondaryColour" error={errors.secondaryColour}>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={draft.secondaryColour || '#1C1B19'}
                onChange={(e) => update({ secondaryColour: e.target.value })}
                className="h-11 w-11 shrink-0 cursor-pointer rounded-md border border-input"
              />
              <input
                value={draft.secondaryColour}
                onChange={(e) => update({ secondaryColour: e.target.value })}
                placeholder="#1C1B19"
                className="h-11 w-full rounded-md border border-input px-3 text-sm"
              />
            </div>
          </Field>
        </div>
      )}

      <ImageUpload
        kind="photo"
        multiple
        label="Photos of your work"
        hint="Optional — add as many as you like. We can also use professional stock photography if you don’t have any yet."
        value={draft.photoUrls}
        onChange={(urls) => update({ photoUrls: urls })}
      />
    </div>
  );
}
