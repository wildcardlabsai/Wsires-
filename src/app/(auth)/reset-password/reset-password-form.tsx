'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

import { Field, FormError } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ResetPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const payload = {
      password: String(data.get('password') ?? ''),
      confirmPassword: String(data.get('confirmPassword') ?? ''),
    };

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        if (result.fields) setErrors(result.fields);
        setFormError(result.error ?? 'We couldn’t update your password.');
        setLoading(false);
        return;
      }

      setDone(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1600);
    } catch {
      setFormError('We couldn’t reach the server. Check your connection and try again.');
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-moss-50">
          <CheckCircle2 className="h-6 w-6 text-moss-600" aria-hidden />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-charcoal-900">Password updated</h1>
        <p className="mt-3 text-sm leading-relaxed text-charcoal-600">Taking you to your dashboard…</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-charcoal-900">Set a new password</h1>
      <p className="mt-2 text-sm text-charcoal-500">Choose something you haven’t used before.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <FormError message={formError} />
        <Field label="New password" htmlFor="password" error={errors.password} required>
          <Input name="password" type="password" autoComplete="new-password" required autoFocus />
        </Field>
        <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword} required>
          <Input name="confirmPassword" type="password" autoComplete="new-password" required />
        </Field>
        <Button type="submit" className="w-full" size="lg" loading={loading} loadingText="Updating…">
          Update password
        </Button>
      </form>
    </div>
  );
}
