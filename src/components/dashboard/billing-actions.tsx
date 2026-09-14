'use client';

import * as React from 'react';
import { ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

/**
 * Opens the Stripe Customer Portal, where a customer manages their payment
 * method, views invoices and cancels their subscription — Stripe's own
 * hosted UI, so we never build a card form ourselves.
 */
export function BillingActions({ hasSubscription }: { hasSubscription: boolean }) {
  const [loading, setLoading] = React.useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const response = await fetch('/api/billing/portal', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) {
        toast.error('Could not open billing', result.error);
        return;
      }
      window.location.href = result.data.url;
    } catch {
      toast.error('Something went wrong', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!hasSubscription) {
    return (
      <Button asChild>
        <a href="/pricing">Choose a plan</a>
      </Button>
    );
  }

  return (
    <Button onClick={openPortal} loading={loading} loadingText="Opening…" variant="outline">
      Manage billing
      <ExternalLink className="h-4 w-4" />
    </Button>
  );
}
