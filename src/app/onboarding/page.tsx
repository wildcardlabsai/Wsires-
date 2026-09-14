import type { Metadata } from 'next';

import { requireCustomer } from '@/lib/auth/session';
import { getWebsiteTemplates } from '@/lib/content/settings';

import { OnboardingWizard } from '@/components/onboarding/wizard';

export const metadata: Metadata = { title: 'Set up your website', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const { customer } = await requireCustomer();
  const templates = await getWebsiteTemplates();

  return (
    <div className="min-h-dvh bg-cream-100">
      <OnboardingWizard customerId={customer.id} templates={templates} />
    </div>
  );
}
