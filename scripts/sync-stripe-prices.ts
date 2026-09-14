/**
 * Creates (or reuses) a Stripe Product + two Prices — setup fee and monthly
 * — for every active plan, and writes the resulting IDs back onto the
 * `plans` row. Safe to re-run: it looks for a product already tagged with
 * the plan's id before creating a new one.
 *
 * Usage: npm run stripe:sync
 * Requires: STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

config({ path: '.env.local' });
config();

async function main() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!stripeKey) {
    console.error('STRIPE_SECRET_KEY is not set. Add it to .env.local and try again.');
    process.exit(1);
  }
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. Add them to .env.local.');
    process.exit(1);
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2025-01-27.acacia', typescript: true });
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: plans, error } = await supabase.from('plans').select('*').order('sort_order');
  if (error) {
    console.error('Could not read plans from Supabase:', error.message);
    process.exit(1);
  }
  if (!plans || plans.length === 0) {
    console.log('No plans found — run the database migrations first.');
    return;
  }

  for (const plan of plans) {
    console.log(`\nSyncing plan "${plan.name}" (${plan.slug})…`);

    let productId = plan.stripe_product_id as string | null;
    if (productId) {
      try {
        await stripe.products.retrieve(productId);
      } catch {
        productId = null;
      }
    }

    if (!productId) {
      const product = await stripe.products.create({
        name: `CymruSites — ${plan.name}`,
        description: plan.tagline ?? plan.description ?? undefined,
        metadata: { planId: plan.id, planSlug: plan.slug },
      });
      productId = product.id;
      console.log(`  Created product ${productId}`);
    } else {
      console.log(`  Reusing product ${productId}`);
    }

    const setupPrice = await stripe.prices.create({
      product: productId,
      currency: plan.currency,
      unit_amount: plan.setup_price_pence,
      nickname: `${plan.name} — setup fee`,
      metadata: { planId: plan.id, kind: 'setup' },
    });
    console.log(`  Created setup price ${setupPrice.id} (${(plan.setup_price_pence / 100).toFixed(2)} ${plan.currency})`);

    const monthlyPrice = await stripe.prices.create({
      product: productId,
      currency: plan.currency,
      unit_amount: plan.monthly_price_pence,
      recurring: { interval: 'month' },
      nickname: `${plan.name} — monthly`,
      metadata: { planId: plan.id, kind: 'monthly' },
    });
    console.log(`  Created monthly price ${monthlyPrice.id} (${(plan.monthly_price_pence / 100).toFixed(2)} ${plan.currency}/mo)`);

    const { error: updateError } = await supabase
      .from('plans')
      .update({
        stripe_product_id: productId,
        stripe_setup_price_id: setupPrice.id,
        stripe_monthly_price_id: monthlyPrice.id,
      })
      .eq('id', plan.id);

    if (updateError) {
      console.error(`  Failed to save Stripe IDs for ${plan.slug}:`, updateError.message);
    } else {
      console.log(`  Saved to plan "${plan.name}"`);
    }
  }

  console.log('\nDone. Old prices are left in Stripe (prices cannot be deleted, only archived) — archive any you no longer need from the Stripe dashboard.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
