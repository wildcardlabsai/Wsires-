import { NextResponse } from 'next/server';

import { handleRoute, requireApiCustomer } from '@/lib/auth/api';
import { absoluteUrl } from '@/lib/env';
import { createBillingPortalSession } from '@/lib/stripe/client';

export async function POST() {
  return handleRoute(async () => {
    const { customer } = await requireApiCustomer();

    if (!customer.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found yet. Choose a plan to get started.' },
        { status: 404 },
      );
    }

    const result = await createBillingPortalSession(customer.stripe_customer_id, absoluteUrl('/dashboard/billing'));
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });

    return NextResponse.json({ data: { url: result.data.url } });
  });
}
