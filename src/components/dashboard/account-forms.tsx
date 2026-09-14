'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { Field, FormError, FormSuccess } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ProfileForm({ fullName, phone, email }: { fullName: string; phone: string; email: string }) {
  const router = useRouter();
  const [name, setName] = React.useState(fullName);
  const [phoneValue, setPhoneValue] = React.useState(phone);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, phone: phoneValue }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'Could not save your profile.');
        return;
      }
      setSuccess('Saved.');
      router.refresh();
    } catch {
      setError('We couldn’t reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormError message={error} />
      <FormSuccess message={success} />
      <Field label="Full name" htmlFor="fullName">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Email" htmlFor="email" hint="Contact us to change your email address.">
        <Input value={email} disabled />
      </Field>
      <Field label="Phone" htmlFor="phone">
        <Input value={phoneValue} onChange={(e) => setPhoneValue(e.target.value)} />
      </Field>
      <Button type="submit" loading={saving} loadingText="Saving…">
        Save profile
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const [current, setCurrent] = React.useState('');
  const [next, setNext] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (next !== confirm) {
      setError('The new passwords don’t match.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'Could not update your password.');
        return;
      }
      setSuccess('Password updated.');
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch {
      setError('We couldn’t reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormError message={error} />
      <FormSuccess message={success} />
      <Field label="Current password" htmlFor="currentPassword">
        <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
      </Field>
      <Field label="New password" htmlFor="newPassword" hint="At least 8 characters, with a letter and a number.">
        <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
      </Field>
      <Field label="Confirm new password" htmlFor="confirmPassword">
        <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
      </Field>
      <Button type="submit" loading={saving} loadingText="Updating…">
        Update password
      </Button>
    </form>
  );
}
