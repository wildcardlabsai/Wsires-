'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

import { Field, FormError } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ERROR_MESSAGES: Record<string, string> = {
  link_expired: 'That link has expired. Please log in, or request a new link.',
  admin_only: 'That area is for administrators only.',
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(
    params.get('error') ? ERROR_MESSAGES[params.get('error')!] ?? null : null,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const payload = {
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
    };

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        if (result.fields) setErrors(result.fields);
        setFormError(result.error ?? 'We couldn’t log you in.');
        setLoading(false);
        return;
      }

      const next = params.get('next');
      router.push(next || result.data.redirectTo);
      router.refresh();
    } catch {
      setFormError('We couldn’t reach the server. Check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-charcoal-900">Log in</h1>
      <p className="mt-2 text-sm text-charcoal-500">Welcome back. Enter your details to continue.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <FormError message={formError} />

        <Field label="Email" htmlFor="email" error={errors.email} required>
          <Input name="email" type="email" autoComplete="email" required autoFocus />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password} required>
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
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

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-cymru-700 hover:underline">
            Forgotten your password?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading} loadingText="Logging in…">
          Log in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-charcoal-500">
        Don’t have an account?{' '}
        <Link href="/signup" className="font-medium text-cymru-700 hover:underline">
          Get your website started
        </Link>
      </p>
    </div>
  );
}
