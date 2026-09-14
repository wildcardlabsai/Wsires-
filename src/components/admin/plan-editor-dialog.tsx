'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, X } from 'lucide-react';

import { Field, FormError } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { slugify } from '@/lib/utils';
import type { PlanRow } from '@/types/database';

interface FormState {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  setupPrice: string;
  monthlyPrice: string;
  maxPages: string;
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: string;
}

function fromPlan(plan?: PlanRow): FormState {
  return {
    slug: plan?.slug ?? '',
    name: plan?.name ?? '',
    tagline: plan?.tagline ?? '',
    description: plan?.description ?? '',
    setupPrice: plan ? (plan.setup_price_pence / 100).toString() : '',
    monthlyPrice: plan ? (plan.monthly_price_pence / 100).toString() : '',
    maxPages: plan ? plan.max_pages.toString() : '5',
    features: plan?.features ?? [],
    isActive: plan?.is_active ?? true,
    isFeatured: plan?.is_featured ?? false,
    sortOrder: plan ? plan.sort_order.toString() : '0',
  };
}

export function PlanEditorDialog({ plan }: { plan?: PlanRow }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<FormState>(() => fromPlan(plan));
  const [featureInput, setFeatureInput] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) setForm(fromPlan(plan));
  }, [open, plan]);

  function addFeature() {
    if (!featureInput.trim()) return;
    setForm((f) => ({ ...f, features: [...f.features, featureInput.trim()] }));
    setFeatureInput('');
  }

  async function save() {
    setSaving(true);
    setError(null);

    const body = {
      id: plan?.id,
      slug: form.slug || slugify(form.name),
      name: form.name,
      tagline: form.tagline || undefined,
      description: form.description || undefined,
      setupPricePence: Math.round(parseFloat(form.setupPrice || '0') * 100),
      monthlyPricePence: Math.round(parseFloat(form.monthlyPrice || '0') * 100),
      maxPages: parseInt(form.maxPages || '1', 10),
      features: form.features,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      sortOrder: parseInt(form.sortOrder || '0', 10),
    };

    try {
      const response = await fetch(plan ? `/api/admin/plans/${plan.id}` : '/api/admin/plans', {
        method: plan ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'Could not save that plan.');
        return;
      }
      toast.success('Plan saved');
      setOpen(false);
      router.refresh();
    } catch {
      setError('We couldn’t reach the server.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {plan ? (
          <Button size="sm" variant="outline">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> New plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{plan ? `Edit ${plan.name}` : 'New plan'}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <FormError message={error} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" htmlFor="name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Slug" htmlFor="slug" hint="Used in URLs">
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto" />
            </Field>
          </div>
          <Field label="Tagline" htmlFor="tagline">
            <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
          </Field>
          <Field label="Description" htmlFor="description">
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Setup (£)" htmlFor="setupPrice">
              <Input type="number" value={form.setupPrice} onChange={(e) => setForm({ ...form, setupPrice: e.target.value })} />
            </Field>
            <Field label="Monthly (£)" htmlFor="monthlyPrice">
              <Input type="number" value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })} />
            </Field>
            <Field label="Max pages" htmlFor="maxPages">
              <Input type="number" value={form.maxPages} onChange={(e) => setForm({ ...form, maxPages: e.target.value })} />
            </Field>
          </div>

          <div>
            <Label>Features</Label>
            <div className="mt-2 flex gap-2">
              <Input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFeature();
                  }
                }}
                placeholder="Add a feature and press Enter"
              />
              <Button type="button" variant="outline" onClick={addFeature}>
                Add
              </Button>
            </div>
            <ul className="mt-2 space-y-1.5">
              {form.features.map((feature, i) => (
                <li key={i} className="flex items-center justify-between rounded-md bg-cream-100 px-3 py-1.5 text-sm">
                  {feature}
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }))}
                    className="text-charcoal-400 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label className="font-normal">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
              <Label className="font-normal">Featured (“Most popular”)</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} loadingText="Saving…">
            Save plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
