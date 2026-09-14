import 'server-only';

import Stripe from 'stripe';

import { env, isStripeConfigured } from '@/lib/env';

let client: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (!isStripeConfigured()) return null;
  if (!client) {
    client = new Stripe(env.stripeSecretKey!, {
      apiVersion: '2025-01-27.acacia',
      typescript: true,
      appInfo: { name: 'CymruSites', version: '1.0.0' },
    });
  }
  return client;
}

type StripeResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function cancelStripeSubscription(
  stripeSubscriptionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const stripe = getStripeClient();
  if (!stripe) {
    return {
      ok: false,
      error:
        'Stripe is not configured on this deployment. Add STRIPE_SECRET_KEY to enable live subscription management.',
    };
  }

  try {
    await stripe.subscriptions.cancel(stripeSubscriptionId);
    return { ok: true };
  } catch (error) {
    console.error('[stripe] cancel subscription failed', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Stripe request failed.' };
  }
}

export async function createBillingPortalSession(
  stripeCustomerId: string,
  returnUrl: string,
): Promise<StripeResult<{ url: string }>> {
  const stripe = getStripeClient();
  if (!stripe) {
    return {
      ok: false,
      error: 'Billing is not available yet — Stripe is not configured on this deployment.',
    };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });
    return { ok: true, data: { url: session.url } };
  } catch (error) {
    console.error('[stripe] portal session failed', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Stripe request failed.' };
  }
}
