import { NextResponse } from 'next/server';

import { handleRoute, requireApiAdmin } from '@/lib/auth/api';
import { sendSubscriptionCancelledEmail } from '@/lib/email/templates';
import { createServerSupabase } from '@/lib/supabase/server';
import { cancelStripeSubscription } from '@/lib/stripe/client';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    await requireApiAdmin();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { data: subscription } = await supabase.from('subscriptions').select('*').eq('id', id).maybeSingle();
    if (!subscription) return NextResponse.json({ error: 'Subscription not found.' }, { status: 404 });

    if (subscription.stripe_subscription_id) {
      const result = await cancelStripeSubscription(subscription.stripe_subscription_id);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 502 });
      }
    } else {
      /* No Stripe subscription attached — update locally (e.g. demo data). */
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled', canceled_at: new Date().toISOString(), cancel_at_period_end: false })
        .eq('id', id);
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', subscription.customer_id)
      .maybeSingle();

    if (customer) {
      void sendSubscriptionCancelledEmail({
        to: customer.email,
        name: customer.contact_name,
        endsAt: subscription.current_period_end,
      }).catch(() => {});
    }

    return NextResponse.json({ data: { ok: true } });
  });
}
