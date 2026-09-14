'use client';

import * as React from 'react';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';

import { Field, FormError } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ForgotPasswordForm() {
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (!response.ok) {
        if (result.fields) setErrors(result.fields);
        setFormError(result.error ?? 'Something went wrong.');
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setFormError('We couldn’t reach the server. Check your connection and try again.');
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cymru-50">
          <MailCheck className="h-6 w-6 text-cymru-600" aria-hidden />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-charcoal-900">Check your email</h1>
        <p className="mt-3 text-sm leading-relaxed text-charcoal-600">
          If an account exists for that address, we’ve sent a link to reset your password. It’s valid for one
          hour.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-cymru-700 hover:underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-charcoal-900">Reset your password</h1>
      <p className="mt-2 text-sm text-charcoal-500">
        Enter your email address and we’ll send you a link to set a new password.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <FormError message={formError} />
        <Field label="Email" htmlFor="email" error={errors.email} required>
          <Input name="email" type="email" autoComplete="email" required autoFocus />
        </Field>
        <Button type="submit" className="w-full" size="lg" loading={loading} loadingText="Sending link…">
          Send reset link
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-charcoal-500">
        <Link href="/login" className="font-medium text-cymru-700 hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
