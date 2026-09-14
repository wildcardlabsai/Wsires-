import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

import {
  sendAdminOrderNotification,
  sendPaymentFailedEmail,
  sendPaymentSucceededEmail,
  sendPurchaseConfirmationEmail,
  sendSubscriptionCancelledEmail,
} from '@/lib/email/templates';
import { env } from '@/lib/env';
import { requireAdminSupabase } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe/client';
import { getOrCreateDraftWebsite } from '@/lib/websites/provisioning';
import type { SubscriptionStatus } from '@/types/database';

/**
 * Stripe webhook endpoint. Keeps `orders`, `subscriptions` and `payments`
 * in sync with what Stripe actually did. Every handler is idempotent: the
 * event id is recorded in `stripe_events` before any writes, so a retried
 * delivery (Stripe retries on non-2xx) never double-applies a side effect
 * such as sending an email twice.
 */
export async function POST(request: Request) {
  const stripe = getStripeClient();
  if (!stripe || !env.stripeWebhookSecret) {
    return NextResponse.json({ error: 'Stripe webhooks are not configured.' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
  } catch (error) {
    console.error('[stripe webhook] signature verification failed', error);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  const supabase = requireAdminSupabase();

  /* Idempotency: record the event first; if it's already there, skip. */
  const { error: insertError } = await supabase
    .from('stripe_events')
    .insert({ id: event.id, type: event.type, payload: event as never });

  if (insertError) {
    /* Unique violation ⇒ already processed. */
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, stripe);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(`[stripe webhook] handler failed for ${event.type}`, error);
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, stripe: Stripe) {
  const supabase = requireAdminSupabase();
  const customerId = session.metadata?.customerId;
  const planId = session.metadata?.planId;
  if (!customerId) return;

  const { data: customer } = await supabase.from('customers').select('*').eq('id', customerId).maybeSingle();
  if (!customer) return;

  const { data: plan } = planId ? await supabase.from('plans').select('*').eq('id', planId).maybeSingle() : { data: null };

  /* Set the plan on the customer now that payment has succeeded. */
  if (planId) await supabase.from('customers').update({ plan_id: planId }).eq('id', customerId);

  const website = await getOrCreateDraftWebsite(supabase, customerId, {
    businessName: customer.business_name,
    planId: planId ?? customer.plan_id,
  });
  await supabase
    .from('websites')
    .update({ status: 'awaiting_information', plan_id: planId ?? website.plan_id })
    .eq('id', website.id)
    .eq('status', 'lead');

  const setupAmount = plan?.setup_price_pence ?? 0;

  const { data: order } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      plan_id: planId ?? null,
      website_id: website.id,
      kind: 'setup',
      status: 'paid',
      amount_pence: setupAmount,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      paid_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  /* Create the subscription row from the Checkout session's subscription. */
  if (typeof session.subscription === 'string') {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    await upsertSubscriptionRow(subscription, customerId, planId ?? null);
  }

  void sendPurchaseConfirmationEmail({
    to: customer.email,
    name: customer.contact_name,
    planName: plan?.name ?? 'CymruSites',
    setupPence: setupAmount,
    monthlyPence: plan?.monthly_price_pence ?? 0,
    reference: order?.reference ?? session.id,
  }).catch(() => {});

  void sendAdminOrderNotification({
    businessName: customer.business_name,
    planName: plan?.name ?? 'Unknown plan',
    amountPence: setupAmount,
    customerId,
  }).catch(() => {});
}

async function upsertSubscriptionRow(subscription: Stripe.Subscription, customerId: string, planId: string | null) {
  const supabase = requireAdminSupabase();
  const recurringItem = subscription.items.data.find((item) => item.price.recurring);

  await supabase.from('subscriptions').upsert(
    {
      customer_id: customerId,
      plan_id: planId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
      stripe_price_id: recurringItem?.price.id ?? null,
      status: mapStripeStatus(subscription.status),
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      amount_pence: recurringItem?.price.unit_amount ?? 0,
      currency: subscription.currency,
    },
    { onConflict: 'stripe_subscription_id' },
  );
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  const known: SubscriptionStatus[] = [
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused',
  ];
  return (known as string[]).includes(status) ? (status as SubscriptionStatus) : 'incomplete';
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const supabase = requireAdminSupabase();
  const customerId = await resolveCustomerId(invoice);
  if (!customerId) return;

  const { data: subscriptionRow } =
    typeof invoice.subscription === 'string'
      ? await supabase.from('subscriptions').select('id').eq('stripe_subscription_id', invoice.subscription).maybeSingle()
      : { data: null };

  await supabase.from('payments').upsert(
    {
      customer_id: customerId,
      subscription_id: subscriptionRow?.id ?? null,
      stripe_invoice_id: invoice.id,
      stripe_payment_intent_id: typeof invoice.payment_intent === 'string' ? invoice.payment_intent : null,
      invoice_number: invoice.number ?? null,
      invoice_url: invoice.hosted_invoice_url ?? null,
      receipt_url: invoice.hosted_invoice_url ?? null,
      description: invoice.billing_reason === 'subscription_create' ? 'First month + setup' : 'Monthly subscription',
      amount_pence: invoice.amount_paid,
      currency: invoice.currency,
      status: 'succeeded',
      paid_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_invoice_id' },
  );

  /* Skip the confirmation email for the very first invoice — the purchase
     confirmation email already covers it. */
  if (invoice.billing_reason !== 'subscription_create') {
    const { data: customer } = await supabase.from('customers').select('*').eq('id', customerId).maybeSingle();
    if (customer) {
      void sendPaymentSucceededEmail({
        to: customer.email,
        name: customer.contact_name,
        amountPence: invoice.amount_paid,
        description: 'Monthly subscription',
        invoiceUrl: invoice.hosted_invoice_url,
      }).catch(() => {});
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = requireAdminSupabase();
  const customerId = await resolveCustomerId(invoice);
  if (!customerId) return;

  await supabase.from('payments').upsert(
    {
      customer_id: customerId,
      stripe_invoice_id: invoice.id,
      description: 'Monthly subscription',
      amount_pence: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      failure_reason: 'Card declined',
    },
    { onConflict: 'stripe_invoice_id' },
  );

  const { data: customer } = await supabase.from('customers').select('*').eq('id', customerId).maybeSingle();
  if (customer) {
    void sendPaymentFailedEmail({
      to: customer.email,
      name: customer.contact_name,
      amountPence: invoice.amount_due,
    }).catch(() => {});
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = requireAdminSupabase();
  const customerId = subscription.metadata?.customerId ?? (await resolveCustomerIdFromStripeCustomer(subscription.customer));
  if (!customerId) return;
  await upsertSubscriptionRow(subscription, customerId, subscription.metadata?.planId ?? null);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = requireAdminSupabase();
  const customerId = subscription.metadata?.customerId ?? (await resolveCustomerIdFromStripeCustomer(subscription.customer));
  if (!customerId) return;

  await supabase
    .from('subscriptions')
    .update({ status: 'canceled', canceled_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscription.id);

  const { data: customer } = await supabase.from('customers').select('*').eq('id', customerId).maybeSingle();
  if (customer) {
    void sendSubscriptionCancelledEmail({ to: customer.email, name: customer.contact_name }).catch(() => {});
  }
}

async function resolveCustomerId(invoice: Stripe.Invoice): Promise<string | null> {
  if (typeof invoice.customer === 'string') return resolveCustomerIdFromStripeCustomer(invoice.customer);
  return null;
}

async function resolveCustomerIdFromStripeCustomer(stripeCustomer: string | Stripe.Customer | Stripe.DeletedCustomer | null): Promise<string | null> {
  if (!stripeCustomer) return null;
  const id = typeof stripeCustomer === 'string' ? stripeCustomer : stripeCustomer.id;
  const supabase = requireAdminSupabase();
  const { data } = await supabase.from('customers').select('id').eq('stripe_customer_id', id).maybeSingle();
  return data?.id ?? null;
}
