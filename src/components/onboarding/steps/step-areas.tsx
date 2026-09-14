'use client';

import * as React from 'react';
import { MapPin, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import type { StepProps } from '../wizard-context';

const SUGGESTIONS = [
  'Cardiff',
  'Newport',
  'Swansea',
  'Pontypridd',
  'Caerphilly',
  'Bridgend',
  'Merthyr Tydfil',
  'Aberdare',
  'Barry',
  'Neath',
];

export function StepAreas({ draft, update, errors }: StepProps) {
  const [input, setInput] = React.useState('');

  function addArea(value: string) {
    const trimmed = value.trim();
    if (!trimmed || draft.serviceAreas.includes(trimmed)) return;
    update({ serviceAreas: [...draft.serviceAreas, trimmed] });
    setInput('');
  }

  function removeArea(area: string) {
    update({ serviceAreas: draft.serviceAreas.filter((a) => a !== area) });
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-charcoal-600">
        Which towns, cities or postcode areas do you cover? Each one can help you appear in local searches.
      </p>

      <div>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addArea(input);
            }
          }}
          placeholder="Type an area and press Enter"
        />
        {errors.serviceAreas && <p className="mt-1.5 text-xs font-medium text-destructive">{errors.serviceAreas}</p>}

        {draft.serviceAreas.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {draft.serviceAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1.5 rounded-full bg-charcoal-900 py-1.5 pl-3.5 pr-2 text-sm font-medium text-white"
              >
                <MapPin className="h-3 w-3" aria-hidden />
                {area}
                <button
                  type="button"
                  onClick={() => removeArea(area)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-white/20"
                  aria-label={`Remove ${area}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-charcoal-400">Common areas</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SUGGESTIONS.filter((s) => !draft.serviceAreas.includes(s)).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addArea(suggestion)}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-sm text-charcoal-600 transition-colors hover:border-charcoal-300 hover:text-charcoal-900"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
