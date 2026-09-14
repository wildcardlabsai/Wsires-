'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { Field, FormError } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function DomainRequestForm() {
  const router = useRouter();
  const [domain, setDomain] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'Could not save your request.');
        return;
      }
      router.refresh();
    } catch {
      setError('We couldn’t reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormError message={error} />
      <Field label="Your domain" htmlFor="domain" hint="Already own one? Enter it here and we’ll get it connected.">
        <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourbusiness.co.uk" />
      </Field>
      <Button type="submit" loading={loading} loadingText="Submitting…">
        Request domain connection
      </Button>
    </form>
  );
}
