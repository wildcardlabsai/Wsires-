'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { PlanRow } from '@/types/database';

export function CheckoutClient({ plans, stripeConfigured }: { plans: PlanRow[]; stripeConfigured: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const planSlug = params.get('plan');
  const plan = plans.find((p) => p.slug === planSlug) ?? plans[0];

  const [loading, setLoading] = React.useState(stripeConfigured);
  const [error, setError] = React.useState<string | null>(null);
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    if (!stripeConfigured || !plan || startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const response = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planSlug: plan.slug }),
        });
        const result = await response.json();
        if (!response.ok) {
          setError(result.error ?? 'Could not start checkout.');
          setLoading(false);
          return;
        }
        window.location.href = result.data.url;
      } catch {
        setError('We couldn’t reach the server. Please try again.');
        setLoading(false);
      }
    })();
  }, [stripeConfigured, plan]);

  if (!plan) {
    return (
      <div className="text-center">
        <p className="text-charcoal-600">No plan selected.</p>
        <Button asChild className="mt-4">
          <Link href="/pricing">Choose a plan</Link>
        </Button>
      </div>
    );
  }

  if (!stripeConfigured) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-amber-600" />
        <h1 className="mt-4 text-xl font-semibold text-amber-950">Payments aren’t connected yet</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-amber-900">
          This deployment doesn’t have Stripe configured, so we can’t take payment for the{' '}
          <strong>{plan.name}</strong> plan right now. You can continue straight to onboarding — your setup fee
          will be arranged separately — or come back once payments are enabled.
        </p>
        <Button className="mt-6" onClick={() => router.push('/onboarding')}>
          Continue to onboarding
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
        <h1 className="mt-4 text-xl font-semibold text-red-950">Couldn’t start checkout</h1>
        <p className="mt-2 text-sm text-red-800">{error}</p>
        <Button className="mt-6" variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-charcoal-400" />
      <h1 className="mt-4 text-xl font-semibold text-charcoal-900">Taking you to secure checkout…</h1>
      <p className="mt-2 text-sm text-charcoal-500">
        {plan.name} — {formatPrice(plan.setup_price_pence)} setup, then {formatPrice(plan.monthly_price_pence)}/month
      </p>
      {loading && <p className="mt-1 text-xs text-charcoal-400">Powered by Stripe</p>}
    </div>
  );
}
