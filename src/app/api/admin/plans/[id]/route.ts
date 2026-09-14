import { NextResponse } from 'next/server';

import { handleRoute, requireApiAdmin } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';
import { fieldErrors, planUpsertSchema } from '@/lib/validation/schemas';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    await requireApiAdmin();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = planUpsertSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) }, { status: 422 });
    }
    const d = parsed.data;

    const { data: plan, error } = await supabase
      .from('plans')
      .update({
        slug: d.slug,
        name: d.name,
        tagline: d.tagline ?? null,
        description: d.description ?? null,
        setup_price_pence: d.setupPricePence,
        monthly_price_pence: d.monthlyPricePence,
        max_pages: d.maxPages,
        features: d.features,
        stripe_setup_price_id: d.stripeSetupPriceId ?? null,
        stripe_monthly_price_id: d.stripeMonthlyPriceId ?? null,
        is_active: d.isActive,
        is_featured: d.isFeatured,
        sort_order: d.sortOrder,
      })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error || !plan) return NextResponse.json({ error: 'Could not save that plan.' }, { status: 500 });
    return NextResponse.json({ data: { plan } });
  });
}
