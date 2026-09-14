'use client';

import * as React from 'react';
import { CheckCircle2, Send } from 'lucide-react';

import { Field, FormError } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

const BUSINESS_TYPES = [
  'Plumbing',
  'Electrical',
  'Building',
  'Roofing',
  'Landscaping',
  'Automotive',
  'Hospitality',
  'Professional services',
  'Health & beauty',
  'Other',
];

const REQUIREMENTS = [
  'A brand new website',
  'Replacing an existing website',
  'Not sure yet — advice please',
  'Just pricing information',
];

const BUDGETS = [
  'Starter (£299 setup, £29/mo)',
  'Business (£499 setup, £39/mo)',
  'Pro (£799 setup, £59/mo)',
  'Not sure yet',
];

export function ContactForm() {
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success'>('idle');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [businessType, setBusinessType] = React.useState('');
  const [requirement, setRequirement] = React.useState('');
  const [budget, setBudget] = React.useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setErrors({});
    setFormError(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get('name') ?? ''),
      businessName: String(data.get('businessName') ?? ''),
      email: String(data.get('email') ?? ''),
      phone: String(data.get('phone') ?? ''),
      currentWebsite: String(data.get('currentWebsite') ?? ''),
      message: String(data.get('message') ?? ''),
      company_website: String(data.get('company_website') ?? ''),
      businessType,
      requirement,
      budget,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.fields) setErrors(result.fields);
        setFormError(result.error ?? 'We couldn’t send your message. Please try again.');
        setStatus('idle');
        return;
      }

      setStatus('success');
      form.reset();
      setBusinessType('');
      setRequirement('');
      setBudget('');
      toast.success('Message sent', 'We’ll come back to you within one working day.');
    } catch {
      setFormError(
        'We couldn’t reach the server. Check your connection and try again, or email hello@cymrusites.co.uk.',
      );
      setStatus('idle');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-moss-200 bg-moss-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-moss-600" aria-hidden />
        <h2 className="mt-4 text-xl font-semibold text-moss-900">Thank you — that’s with us</h2>
        <p className="mx-auto mt-2 max-w-md text-[0.9375rem] leading-relaxed text-moss-800">
          We read every message ourselves and reply within one working day. If it’s urgent, ring us and we’ll
          pick up.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setStatus('idle')}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <FormError message={formError} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name" error={errors.name} required>
          <Input name="name" autoComplete="name" placeholder="Gareth Lewis" required />
        </Field>
        <Field label="Business name" htmlFor="businessName" error={errors.businessName}>
          <Input name="businessName" autoComplete="organization" placeholder="Lewis Plumbing" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" htmlFor="email" error={errors.email} required>
          <Input name="email" type="email" autoComplete="email" placeholder="you@example.co.uk" required />
        </Field>
        <Field label="Phone" htmlFor="phone" error={errors.phone} hint="So we can ring you back if it’s easier.">
          <Input name="phone" type="tel" autoComplete="tel" placeholder="07700 900000" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Business type" htmlFor="businessType" error={errors.businessType}>
          <Select value={businessType} onValueChange={setBusinessType}>
            <SelectTrigger id="businessType">
              <SelectValue placeholder="Choose your trade" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Current website"
          htmlFor="currentWebsite"
          error={errors.currentWebsite}
          hint="Leave blank if you don’t have one."
        >
          <Input name="currentWebsite" placeholder="yourbusiness.co.uk" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="What do you need?" htmlFor="requirement" error={errors.requirement}>
          <Select value={requirement} onValueChange={setRequirement}>
            <SelectTrigger id="requirement">
              <SelectValue placeholder="Choose one" />
            </SelectTrigger>
            <SelectContent>
              {REQUIREMENTS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Budget" htmlFor="budget" error={errors.budget}>
          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger id="budget">
              <SelectValue placeholder="Which plan interests you?" />
            </SelectTrigger>
            <SelectContent>
              {BUDGETS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field
        label="Message"
        htmlFor="message"
        error={errors.message}
        required
        hint="Tell us what you do, where you work and what you’re hoping for."
      >
        <Textarea
          name="message"
          rows={6}
          required
          placeholder="I'm a plumber in Pontypridd. I've got no website at all at the moment and I want something that lets people ring me easily…"
        />
      </Field>

      {/* Honeypot — hidden from people, tempting to bots. */}
      <div className="hidden" aria-hidden>
        <label htmlFor="company_website">Do not fill this in</label>
        <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto" loading={status === 'submitting'} loadingText="Sending…">
        <Send className="h-4 w-4" aria-hidden />
        Send message
      </Button>

      <p className="text-xs leading-relaxed text-charcoal-500">
        We use your details only to reply to this enquiry. See our{' '}
        <a href="/privacy" className="underline hover:text-charcoal-700">
          privacy notice
        </a>
        .
      </p>
    </form>
  );
}
