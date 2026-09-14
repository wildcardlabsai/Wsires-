import { NextResponse } from 'next/server';

import { handleRoute, requireApiCustomer } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';
import { businessDetailsSchema, fieldErrors } from '@/lib/validation/schemas';

/**
 * Direct edits to the customer's own business record — the "everyday"
 * fields the spec calls out (name, phone, hours, services, about text,
 * photos, testimonials, social links, service areas). RLS restricts this
 * to the caller's own row regardless of what customerId is implied.
 */
export async function POST(request: Request) {
  return handleRoute(async () => {
    const { customer } = await requireApiCustomer();
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

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('customer_id', customer.id)
      .maybeSingle();

    if (!business) {
      return NextResponse.json({ error: 'No business profile found yet.' }, { status: 404 });
    }

    const { error } = await supabase
      .from('businesses')
      .update({
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
      })
      .eq('id', business.id);

    if (error) {
      return NextResponse.json({ error: 'Could not save your changes.' }, { status: 500 });
    }

    /* Website content and preview regenerate lazily from this record on next render. */
    await supabase
      .from('websites')
      .update({ last_updated_by: customer.profile_id })
      .eq('customer_id', customer.id)
      .eq('business_id', business.id);

    return NextResponse.json({ data: { ok: true } });
  });
}
