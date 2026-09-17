'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

import { Field, FormError, FormSuccess } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import type { BusinessRow } from '@/types/database';

type FormState = {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  addressLine1: string;
  city: string;
  postcode: string;
  googleMapsUrl: string;
  services: { title: string; description?: string; price_from?: string }[];
  serviceAreas: string[];
};

function fromBusiness(business: BusinessRow | null, fallbackName: string): FormState {
  return {
    name: business?.name ?? fallbackName,
    tagline: business?.tagline ?? '',
    description: business?.description ?? '',
    phone: business?.phone ?? '',
    email: business?.email ?? '',
    whatsappNumber: business?.whatsapp_number ?? '',
    addressLine1: business?.address_line1 ?? '',
    city: business?.city ?? '',
    postcode: business?.postcode ?? '',
    googleMapsUrl: business?.google_maps_url ?? '',
    services: business?.services ?? [],
    serviceAreas: business?.service_areas ?? [],
  };
}

/**
 * Admin's replacement for the customer self-service editor: the agency
 * makes the change here on the client's behalf, usually while working
 * through a support ticket or content change request.
 */
export function BusinessEditorForm({ customerId, business, fallbackName }: { customerId: string; business: BusinessRow | null; fallbackName: string }) {
  const router = useRouter();
  const [state, setState] = React.useState<FormState>(() => fromBusiness(business, fallbackName));
  const [areaInput, setAreaInput] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    setSuccess(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/business`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'Could not save changes.');
        return;
      }
      setSuccess('Saved.');
      toast.success('Business details updated');
      router.refresh();
    } catch {
      setError('We couldn’t reach the server.');
    } finally {
      setSaving(false);
    }
  }

  function addService() {
    set('services', [...state.services, { title: '', description: '', price_from: '' }]);
  }
  function updateService(i: number, patch: Partial<FormState['services'][number]>) {
    const next = [...state.services];
    next[i] = { ...next[i]!, ...patch };
    set('services', next);
  }
  function removeService(i: number) {
    set('services', state.services.filter((_, idx) => idx !== i));
  }

  function addArea() {
    const value = areaInput.trim();
    if (!value || state.serviceAreas.includes(value)) return;
    set('serviceAreas', [...state.serviceAreas, value]);
    setAreaInput('');
  }
  function removeArea(area: string) {
    set('serviceAreas', state.serviceAreas.filter((a) => a !== area));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormError message={error} />
      <FormSuccess message={success} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business name" htmlFor="name">
          <Input value={state.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Tagline" htmlFor="tagline">
          <Input value={state.tagline} onChange={(e) => set('tagline', e.target.value)} />
        </Field>
      </div>

      <Field label="About / description" htmlFor="description">
        <Textarea rows={3} value={state.description} onChange={(e) => set('description', e.target.value)} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" htmlFor="phone">
          <Input value={state.phone} onChange={(e) => set('phone', e.target.value)} />
        </Field>
        <Field label="WhatsApp number" htmlFor="whatsappNumber">
          <Input value={state.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input value={state.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label="Google Maps link" htmlFor="googleMapsUrl">
          <Input value={state.googleMapsUrl} onChange={(e) => set('googleMapsUrl', e.target.value)} />
        </Field>
        <Field label="Address" htmlFor="addressLine1">
          <Input value={state.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Town / city" htmlFor="city">
            <Input value={state.city} onChange={(e) => set('city', e.target.value)} />
          </Field>
          <Field label="Postcode" htmlFor="postcode">
            <Input value={state.postcode} onChange={(e) => set('postcode', e.target.value.toUpperCase())} />
          </Field>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-charcoal-800">Services</p>
          <Button type="button" size="sm" variant="outline" onClick={addService}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {state.services.map((service, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-white p-3">
              <div className="grid flex-1 gap-2 sm:grid-cols-[2fr_1fr]">
                <Input placeholder="Service name" value={service.title} onChange={(e) => updateService(i, { title: e.target.value })} />
                <Input placeholder="From £—" value={service.price_from ?? ''} onChange={(e) => updateService(i, { price_from: e.target.value })} />
              </div>
              <button type="button" onClick={() => removeService(i)} className="mt-2 text-charcoal-300 hover:text-destructive" aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-charcoal-800">Service areas</p>
        <div className="mt-2">
          <Input
            value={areaInput}
            onChange={(e) => setAreaInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addArea();
              }
            }}
            placeholder="Type an area and press Enter"
          />
          {state.serviceAreas.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {state.serviceAreas.map((area) => (
                <span key={area} className="inline-flex items-center gap-1.5 rounded-full bg-charcoal-900 py-1 pl-3 pr-1.5 text-xs font-medium text-white">
                  {area}
                  <button type="button" onClick={() => removeArea(area)} className="rounded-full p-0.5 hover:bg-white/20" aria-label={`Remove ${area}`}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button type="submit" loading={saving} loadingText="Saving…">
        Save business details
      </Button>
    </form>
  );
}
