import { NextResponse } from 'next/server';
import { z } from 'zod';

import { handleRoute, requireApiCustomer } from '@/lib/auth/api';
import { absoluteUrl } from '@/lib/env';
import { createServerSupabase } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe/client';

const schema = z.object({ planSlug: z.string().trim().min(1) });

/**
 * Starts a Stripe Checkout session covering both the one-off setup fee and
 * the recurring monthly subscription in a single payment: subscription-mode
 * Checkout accepts a one-time price as an extra line item, which is billed
 * once on the first invoice and never recurs.
 */
export async function POST(request: Request) {
  return handleRoute(async () => {
    const { actor, customer } = await requireApiCustomer();
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        {
          error:
            'Payments are not available yet — Stripe is not configured on this deployment. Add STRIPE_SECRET_KEY to enable checkout.',
        },
        { status: 503 },
      );
    }

    const payload = await request.json().catch(() => null);
    const parsed = schema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: 'Choose a plan to continue.' }, { status: 422 });

    const { data: plan } = await supabase.from('plans').select('*').eq('slug', parsed.data.planSlug).maybeSingle();
    if (!plan) return NextResponse.json({ error: 'That plan could not be found.' }, { status: 404 });

    if (!plan.stripe_monthly_price_id || !plan.stripe_setup_price_id) {
      return NextResponse.json(
        {
          error:
            'This plan has not been connected to Stripe yet. An administrator needs to run the price sync before customers can check out.',
        },
        { status: 503 },
      );
    }

    /* Reuse an existing Stripe customer, or create one now. */
    let stripeCustomerId = customer.stripe_customer_id;
    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: customer.email,
        name: customer.business_name,
        phone: customer.phone ?? undefined,
        metadata: { customerId: customer.id, profileId: actor.userId },
      });
      stripeCustomerId = stripeCustomer.id;
      await supabase.from('customers').update({ stripe_customer_id: stripeCustomerId }).eq('id', customer.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        { price: plan.stripe_monthly_price_id, quantity: 1 },
        { price: plan.stripe_setup_price_id, quantity: 1 },
      ],
      subscription_data: {
        metadata: { customerId: customer.id, planId: plan.id, planSlug: plan.slug },
      },
      metadata: { customerId: customer.id, planId: plan.id, planSlug: plan.slug },
      allow_promotion_codes: true,
      success_url: absoluteUrl('/onboarding?checkout=success'),
      cancel_url: absoluteUrl('/pricing?checkout=cancelled'),
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ data: { url: session.url } });
  });
}
