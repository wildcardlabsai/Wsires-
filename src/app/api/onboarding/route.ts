import { NextResponse } from 'next/server';

import { requireApiCustomer, handleRoute } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';
import { getOrCreateDraftWebsite } from '@/lib/websites/provisioning';
import { onboardingSaveSchema } from '@/lib/validation/schemas';

/** Fetch the customer's in-progress onboarding submission, creating one if needed. */
export async function GET() {
  return handleRoute(async () => {
    const { actor, customer } = await requireApiCustomer();
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const website = await getOrCreateDraftWebsite(supabase, customer.id, {
      businessName: customer.business_name,
      planId: customer.plan_id,
    });

    let { data: submission } = await supabase
      .from('onboarding_submissions')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!submission) {
      const { data: created, error } = await supabase
        .from('onboarding_submissions')
        .insert({
          customer_id: customer.id,
          website_id: website.id,
          plan_id: customer.plan_id,
          data: {
            businessName: customer.business_name,
            contactName: customer.contact_name ?? actor.profile.full_name ?? '',
            email: customer.email,
            phone: customer.phone ?? '',
          },
        })
        .select('*')
        .single();

      if (error || !created) {
        return NextResponse.json({ error: 'Could not start onboarding.' }, { status: 500 });
      }
      submission = created;
    }

    return NextResponse.json({ data: { submission, website } });
  });
}

/** Save progress on one or more steps. Partial data is merged, not replaced. */
export async function POST(request: Request) {
  return handleRoute(async () => {
    const { customer } = await requireApiCustomer();
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = onboardingSaveSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid submission data.' }, { status: 422 });
    }

    const { data: existing } = await supabase
      .from('onboarding_submissions')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'No draft found — reload the page.' }, { status: 404 });
    }

    const mergedData = { ...(existing.data as Record<string, unknown>), ...parsed.data.data };

    const { data: updated, error } = await supabase
      .from('onboarding_submissions')
      .update({ data: mergedData, current_step: parsed.data.step })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: 'Could not save your progress.' }, { status: 500 });
    }

    return NextResponse.json({ data: { submission: updated } });
  });
}
