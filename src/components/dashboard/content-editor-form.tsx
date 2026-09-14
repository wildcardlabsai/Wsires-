'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

import { Field, FormError, FormSuccess } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { BusinessRow } from '@/types/database';

type FormState = {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  googleMapsUrl: string;
  services: { title: string; description?: string; price_from?: string }[];
  serviceAreas: string[];
  openingHours: { day: string; opens: string | null; closes: string | null; closed: boolean }[];
  socialLinks: { facebook?: string; instagram?: string };
  testimonials: { quote: string; author: string; location?: string }[];
};

function fromBusiness(business: BusinessRow): FormState {
  return {
    name: business.name,
    tagline: business.tagline ?? '',
    description: business.description ?? '',
    phone: business.phone ?? '',
    email: business.email ?? '',
    whatsappNumber: business.whatsapp_number ?? '',
    addressLine1: business.address_line1 ?? '',
    addressLine2: business.address_line2 ?? '',
    city: business.city ?? '',
    postcode: business.postcode ?? '',
    googleMapsUrl: business.google_maps_url ?? '',
    services: business.services ?? [],
    serviceAreas: business.service_areas ?? [],
    openingHours: business.opening_hours ?? [],
    socialLinks: business.social_links ?? {},
    testimonials: [],
  };
}

export function ContentEditorForm({ business }: { business: BusinessRow }) {
  const router = useRouter();
  const [state, setState] = React.useState<FormState>(() => fromBusiness(business));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [areaInput, setAreaInput] = React.useState('');

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
      const response = await fetch('/api/business/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'Could not save your changes.');
        return;
      }
      setSuccess('Saved — your website will reflect this shortly.');
      router.refresh();
    } catch {
      setError('We couldn’t reach the server. Please try again.');
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

  function updateHours(i: number, patch: Partial<FormState['openingHours'][number]>) {
    const next = [...state.openingHours];
    next[i] = { ...next[i]!, ...patch };
    set('openingHours', next);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <FormError message={error} />
      <FormSuccess message={success} />

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-cymru-600">Business details</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field label="Business name" htmlFor="name">
            <Input value={state.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Tagline" htmlFor="tagline" hint="A short line shown under your business name.">
            <Input value={state.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </Field>
        </div>
        <Field label="About / description" htmlFor="description" className="mt-5">
          <Textarea rows={4} value={state.description} onChange={(e) => set('description', e.target.value)} />
        </Field>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-cymru-600">Contact</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field label="Phone" htmlFor="phone">
            <Input value={state.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
          <Field label="WhatsApp number" htmlFor="whatsappNumber">
            <Input value={state.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input type="email" value={state.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <Field label="Google Maps link" htmlFor="googleMapsUrl">
            <Input value={state.googleMapsUrl} onChange={(e) => set('googleMapsUrl', e.target.value)} />
          </Field>
          <Field label="Address line 1" htmlFor="addressLine1">
            <Input value={state.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} />
          </Field>
          <Field label="Town / city" htmlFor="city">
            <Input value={state.city} onChange={(e) => set('city', e.target.value)} />
          </Field>
          <Field label="Postcode" htmlFor="postcode">
            <Input value={state.postcode} onChange={(e) => set('postcode', e.target.value.toUpperCase())} />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-cymru-600">Opening hours</h2>
        <div className="mt-4 space-y-2">
          {state.openingHours.map((hours, i) => (
            <div key={hours.day} className="flex items-center gap-3 rounded-lg border border-border bg-white px-4 py-2.5">
              <span className="w-24 shrink-0 text-sm font-medium text-charcoal-800">{hours.day}</span>
              {hours.closed ? (
                <span className="flex-1 text-sm text-charcoal-400">Closed</span>
              ) : (
                <div className="flex flex-1 items-center gap-2">
                  <Input type="time" value={hours.opens ?? ''} onChange={(e) => updateHours(i, { opens: e.target.value })} className="h-9 w-28" />
                  <span className="text-charcoal-400">–</span>
                  <Input type="time" value={hours.closes ?? ''} onChange={(e) => updateHours(i, { closes: e.target.value })} className="h-9 w-28" />
                </div>
              )}
              <label className="ml-auto flex items-center gap-2 text-xs text-charcoal-500">
                <input
                  type="checkbox"
                  checked={hours.closed}
                  onChange={(e) => updateHours(i, { closed: e.target.checked })}
                  className="h-4 w-4 rounded border-charcoal-300"
                />
                Closed
              </label>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-cymru-600">Services</h2>
          <Button type="button" size="sm" variant="outline" onClick={addService}>
            <Plus className="h-3.5 w-3.5" /> Add service
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {state.services.map((service, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="grid flex-1 gap-2 sm:grid-cols-[2fr_1fr]">
                  <Input placeholder="Service name" value={service.title} onChange={(e) => updateService(i, { title: e.target.value })} />
                  <Input placeholder="From £—" value={service.price_from ?? ''} onChange={(e) => updateService(i, { price_from: e.target.value })} />
                </div>
                <button type="button" onClick={() => removeService(i)} className="mt-1.5 text-charcoal-300 hover:text-destructive" aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <Textarea rows={2} className="mt-2" placeholder="Description" value={service.description ?? ''} onChange={(e) => updateService(i, { description: e.target.value })} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-cymru-600">Service areas</h2>
        <div className="mt-4">
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
            <div className="mt-3 flex flex-wrap gap-2">
              {state.serviceAreas.map((area) => (
                <span key={area} className="inline-flex items-center gap-1.5 rounded-full bg-charcoal-900 py-1.5 pl-3.5 pr-2 text-sm font-medium text-white">
                  {area}
                  <button type="button" onClick={() => removeArea(area)} className="ml-0.5 rounded-full p-0.5 hover:bg-white/20" aria-label={`Remove ${area}`}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <Label>Social links</Label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Facebook URL"
            value={state.socialLinks.facebook ?? ''}
            onChange={(e) => set('socialLinks', { ...state.socialLinks, facebook: e.target.value })}
          />
          <Input
            placeholder="Instagram URL"
            value={state.socialLinks.instagram ?? ''}
            onChange={(e) => set('socialLinks', { ...state.socialLinks, instagram: e.target.value })}
          />
        </div>
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <Button type="submit" size="lg" loading={saving} loadingText="Saving…" className="shadow-lift">
          Save changes
        </Button>
      </div>
    </form>
  );
}
