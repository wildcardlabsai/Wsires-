'use client';

import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/shared/states';
import { Wrench } from 'lucide-react';
import type { StepProps } from '../wizard-context';

export function StepServices({ draft, update, errors }: StepProps) {
  function addService() {
    update({ services: [...draft.services, { title: '', description: '', price_from: '' }] });
  }

  function updateService(index: number, patch: Partial<(typeof draft.services)[number]>) {
    const next = [...draft.services];
    next[index] = { ...next[index]!, ...patch };
    update({ services: next });
  }

  function removeService(index: number) {
    update({ services: draft.services.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-charcoal-600">
        List the services you offer. Each one can become its own section, or its own page on larger plans.
      </p>
      {errors.services && <p className="text-xs font-medium text-destructive">{errors.services}</p>}

      {draft.services.length === 0 ? (
        <EmptyState
          icon={Wrench}
          compact
          title="No services added yet"
          description="Add at least one service to continue — for example, “Boiler repairs” or “Bathroom installations”."
          action={{ label: 'Add a service', onClick: addService }}
        />
      ) : (
        <div className="space-y-4">
          {draft.services.map((service, index) => (
            <div key={index} className="rounded-xl border border-border bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="grid flex-1 gap-3 sm:grid-cols-[2fr_1fr]">
                  <Input
                    placeholder="Service name, e.g. Boiler repairs"
                    value={service.title}
                    onChange={(e) => updateService(index, { title: e.target.value })}
                  />
                  <Input
                    placeholder="From £—  (optional)"
                    value={service.price_from ?? ''}
                    onChange={(e) => updateService(index, { price_from: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="mt-1.5 shrink-0 text-charcoal-300 transition-colors hover:text-destructive"
                  aria-label="Remove service"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <Textarea
                className="mt-3"
                rows={2}
                placeholder="A sentence or two about this service (optional — we can write it for you)"
                value={service.description ?? ''}
                onChange={(e) => updateService(index, { description: e.target.value })}
              />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addService}>
            <Plus className="h-4 w-4" />
            Add another service
          </Button>
        </div>
      )}
    </div>
  );
}
