import 'server-only';

import { slugify } from '@/lib/utils';
import type { TypedSupabaseClient } from '@/lib/supabase/server';
import type { WebsiteRow } from '@/types/database';

/**
 * Website provisioning.
 *
 * A customer always has at most one "in progress" website at a time (the
 * happy path). This finds it, or creates a fresh draft — so onboarding
 * works whether a website row was already created by the Stripe checkout
 * webhook or not. Idempotent per customer.
 */

const DRAFT_STATUSES = ['lead', 'purchased', 'awaiting_information', 'in_production'] as const;

export async function getOrCreateDraftWebsite(
  supabase: TypedSupabaseClient,
  customerId: string,
  opts: { businessName?: string; planId?: string | null } = {},
): Promise<WebsiteRow> {
  const { data: existing } = await supabase
    .from('websites')
    .select('*')
    .eq('customer_id', customerId)
    .in('status', DRAFT_STATUSES as unknown as string[])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return existing;

  const baseName = opts.businessName?.trim() || 'new-website';
  const slug = await generateUniqueSlug(supabase, 'websites', 'slug', baseName);
  const subdomain = await generateUniqueSlug(supabase, 'websites', 'subdomain', baseName);

  const { data: created, error } = await supabase
    .from('websites')
    .insert({
      customer_id: customerId,
      name: opts.businessName?.trim() || 'New website',
      slug,
      subdomain,
      plan_id: opts.planId ?? null,
      status: 'awaiting_information',
    })
    .select('*')
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? 'Could not create a website record.');
  }

  return created;
}

/** Appends `-2`, `-3`, … until the value is free in `table.column`. */
export async function generateUniqueSlug(
  supabase: TypedSupabaseClient,
  table: 'websites',
  column: 'slug' | 'subdomain',
  seed: string,
): Promise<string> {
  const base = slugify(seed) || 'website';
  let candidate = base;
  let attempt = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data } = await supabase.from(table).select('id').eq(column, candidate).maybeSingle();
    if (!data) return candidate;
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
}
