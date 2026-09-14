import { NextResponse } from 'next/server';

import { handleRoute, requireApiAdmin } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';
import { customerAdminUpdateSchema, fieldErrors } from '@/lib/validation/schemas';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    await requireApiAdmin();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { data: customer } = await supabase.from('customers').select('*').eq('id', id).maybeSingle();
    if (!customer) return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });

    return NextResponse.json({ data: { customer } });
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    await requireApiAdmin();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = customerAdminUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }
    const d = parsed.data;
    const update: Record<string, unknown> = {};
    if (d.businessName !== undefined) update.business_name = d.businessName;
    if (d.contactName !== undefined) update.contact_name = d.contactName;
    if (d.email !== undefined) update.email = d.email;
    if (d.phone !== undefined) update.phone = d.phone;
    if (d.addressLine1 !== undefined) update.address_line1 = d.addressLine1;
    if (d.city !== undefined) update.city = d.city;
    if (d.postcode !== undefined) update.postcode = d.postcode;
    if (d.status !== undefined) update.status = d.status;
    if (d.planId !== undefined) update.plan_id = d.planId;

    const { data: customer, error } = await supabase
      .from('customers')
      .update(update)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error || !customer) return NextResponse.json({ error: 'Could not save changes.' }, { status: 500 });
    return NextResponse.json({ data: { customer } });
  });
}
