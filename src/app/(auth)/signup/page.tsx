import type { Metadata } from 'next';
import { Suspense } from 'react';

import { getPlans } from '@/lib/content/settings';

import { SignupForm } from './signup-form';

export const metadata: Metadata = { title: 'Get started', robots: { index: false } };

export default async function SignupPage() {
  const plans = await getPlans();

  return (
    <Suspense>
      <SignupForm plans={plans} />
    </Suspense>
  );
}
