import { NextResponse } from 'next/server';

import { handleRoute, requireApiAdmin } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';
import { businessDetailsSchema, fieldErrors } from '@/lib/validation/schemas';

/**
 * Admin edits a customer's business record — the agency-managed
 * replacement for the direct self-service editor customers used to have.
 * Creates the record if the customer somehow doesn't have one yet (e.g.
 * onboarding was skipped and the agency is building the brief manually).
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    await requireApiAdmin();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = businessDetailsSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }
    const data = parsed.data;

    const businessPayload = {
      customer_id: id,
      name: data.name,
      tagline: data.tagline ?? null,
      description: data.description ?? null,
      phone: data.phone ?? null,
      email: data.email || null,
      whatsapp_number: data.whatsappNumber ?? null,
      address_line1: data.addressLine1 ?? null,
      address_line2: data.addressLine2 ?? null,
      city: data.city ?? null,
      postcode: data.postcode || null,
      google_maps_url: data.googleMapsUrl ?? null,
      services: data.services ?? [],
      service_areas: data.serviceAreas ?? [],
      opening_hours: data.openingHours ?? [],
      social_links: data.socialLinks ?? {},
    };

    const { data: existing } = await supabase.from('businesses').select('id').eq('customer_id', id).maybeSingle();

    const { data: business, error } = existing
      ? await supabase.from('businesses').update(businessPayload).eq('id', existing.id).select('*').single()
      : await supabase.from('businesses').insert(businessPayload).select('*').single();

    if (error || !business) {
      return NextResponse.json({ error: 'Could not save business details.' }, { status: 500 });
    }

    return NextResponse.json({ data: { business } });
  });
}
