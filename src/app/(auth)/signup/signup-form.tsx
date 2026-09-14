'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

import { Field, FormError } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PlanRow } from '@/types/database';
import { formatPrice } from '@/lib/utils';

export function SignupForm({ plans }: { plans: PlanRow[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const preselected = params.get('plan');

  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [planSlug, setPlanSlug] = React.useState(preselected ?? plans[0]?.slug ?? '');

  const selectedPlan = plans.find((p) => p.slug === planSlug);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const payload = {
      fullName: String(data.get('fullName') ?? ''),
      businessName: String(data.get('businessName') ?? ''),
      email: String(data.get('email') ?? ''),
      phone: String(data.get('phone') ?? ''),
      password: String(data.get('password') ?? ''),
      planSlug,
      marketingOptIn: data.get('marketingOptIn') === 'on',
    };

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        if (result.fields) setErrors(result.fields);
        setFormError(result.error ?? 'We couldn’t create your account.');
        setLoading(false);
        return;
      }

      router.push(result.data.redirectTo);
      router.refresh();
    } catch {
      setFormError('We couldn’t reach the server. Check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-charcoal-900">Get your website started</h1>
      <p className="mt-2 text-sm text-charcoal-500">
        Create your account — the next step is telling us about your business.
      </p>

      {plans.length > 0 && (
        <div className="mt-6">
          <Label>Package</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {plans.map((plan) => (
              <button
                key={plan.slug}
                type="button"
                onClick={() => setPlanSlug(plan.slug)}
                className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  planSlug === plan.slug
                    ? 'border-charcoal-900 bg-charcoal-900 text-white'
                    : 'border-border bg-white text-charcoal-700 hover:border-charcoal-300'
                }`}
              >
                <span className="block text-sm font-semibold">{plan.name}</span>
                <span className={`block text-xs ${planSlug === plan.slug ? 'text-charcoal-300' : 'text-charcoal-500'}`}>
                  {formatPrice(plan.setup_price_pence)} setup
                </span>
              </button>
            ))}
          </div>
          {selectedPlan && (
            <p className="mt-2 text-xs text-charcoal-500">
              {formatPrice(selectedPlan.setup_price_pence)} setup, then {formatPrice(selectedPlan.monthly_price_pence)}
              /month once live. You’ll pay the setup fee on the next step.
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        <FormError message={formError} />

        <Field label="Your name" htmlFor="fullName" error={errors.fullName} required>
          <Input name="fullName" autoComplete="name" required autoFocus />
        </Field>

        <Field label="Business name" htmlFor="businessName" error={errors.businessName} required>
          <Input name="businessName" autoComplete="organization" required />
        </Field>

        <Field label="Email" htmlFor="email" error={errors.email} required>
          <Input name="email" type="email" autoComplete="email" required />
        </Field>

        <Field label="Phone" htmlFor="phone" error={errors.phone} hint="Optional, but it helps us reach you faster.">
          <Input name="phone" type="tel" autoComplete="tel" />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          error={errors.password}
          required
          hint="At least 8 characters, with a letter and a number."
        >
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <div className="flex items-start gap-2.5">
          <Checkbox id="marketingOptIn" name="marketingOptIn" className="mt-0.5" />
          <Label htmlFor="marketingOptIn" className="text-sm font-normal leading-relaxed text-charcoal-600">
            Send me occasional emails about new features. You can unsubscribe any time.
          </Label>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading} loadingText="Creating your account…">
          Create account
        </Button>

        <p className="text-xs leading-relaxed text-charcoal-500">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="underline hover:text-charcoal-700">
            terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-charcoal-700">
            privacy notice
          </Link>
          .
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-charcoal-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-cymru-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
