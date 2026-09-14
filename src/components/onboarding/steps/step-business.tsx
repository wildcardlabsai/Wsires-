'use client';

import { Field } from '@/components/shared/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { StepProps } from '../wizard-context';

export function StepBusiness({ draft, update, errors }: StepProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Business name" htmlFor="businessName" error={errors.businessName} required>
          <Input
            value={draft.businessName}
            onChange={(e) => update({ businessName: e.target.value })}
            placeholder="Lewis Plumbing & Heating"
          />
        </Field>
        <Field label="Contact name" htmlFor="contactName" error={errors.contactName} required>
          <Input
            value={draft.contactName}
            onChange={(e) => update({ contactName: e.target.value })}
            placeholder="Gareth Lewis"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" htmlFor="email" error={errors.email} required>
          <Input
            type="email"
            value={draft.email}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="you@example.co.uk"
          />
        </Field>
        <Field label="Phone" htmlFor="phone" error={errors.phone} required hint="Shown on your website.">
          <Input
            type="tel"
            value={draft.phone}
            onChange={(e) => update({ phone: e.target.value })}
            placeholder="07700 900000"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Address line 1" htmlFor="addressLine1" error={errors.addressLine1}>
          <Input value={draft.addressLine1} onChange={(e) => update({ addressLine1: e.target.value })} />
        </Field>
        <Field label="Address line 2" htmlFor="addressLine2" error={errors.addressLine2}>
          <Input value={draft.addressLine2} onChange={(e) => update({ addressLine2: e.target.value })} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Town / city" htmlFor="city" error={errors.city}>
          <Input value={draft.city} onChange={(e) => update({ city: e.target.value })} placeholder="Pontypridd" />
        </Field>
        <Field label="Postcode" htmlFor="postcode" error={errors.postcode} required>
          <Input
            value={draft.postcode}
            onChange={(e) => update({ postcode: e.target.value.toUpperCase() })}
            placeholder="CF37 1AB"
          />
        </Field>
      </div>

      <Field
        label="Existing website"
        htmlFor="existingWebsite"
        error={errors.existingWebsite}
        hint="Leave blank if you don’t have one yet."
      >
        <Input value={draft.existingWebsite} onChange={(e) => update({ existingWebsite: e.target.value })} />
      </Field>

      <Field
        label="Tell us about your business"
        htmlFor="description"
        error={errors.description}
        required
        hint="A couple of sentences is fine — we’ll turn this into your website copy."
      >
        <Textarea
          rows={5}
          value={draft.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="We're a family-run plumbing and heating business covering Pontypridd and the surrounding valleys. We specialise in boiler repairs, bathroom installations and emergency call-outs…"
        />
      </Field>
    </div>
  );
}
