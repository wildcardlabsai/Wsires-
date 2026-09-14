import type { Metadata } from 'next';
import { Suspense } from 'react';

import { getPlans } from '@/lib/content/settings';
import { isStripeConfigured } from '@/lib/env';
import { requireCustomer } from '@/lib/auth/session';

import { CheckoutClient } from './checkout-client';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  await requireCustomer();
  const plans = await getPlans();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream-100 px-6">
      <div className="w-full max-w-md">
        <Suspense>
          <CheckoutClient plans={plans} stripeConfigured={isStripeConfigured()} />
        </Suspense>
      </div>
    </div>
  );
}
