import { NextResponse } from 'next/server';

import { handleRoute, requireApiCustomer } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';
import { domainRequestSchema, fieldErrors } from '@/lib/validation/schemas';

/** Customer requests a domain be connected. Admin confirms DNS/SSL/live status manually. */
export async function POST(request: Request) {
  return handleRoute(async () => {
    const { customer } = await requireApiCustomer();
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = domainRequestSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please check the domain you entered.', fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    const { data: existing } = await supabase
      .from('domains')
      .select('id')
      .eq('domain', parsed.data.domain)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'That domain has already been requested.' }, { status: 409 });
    }

    const { data: website } = await supabase
      .from('websites')
      .select('id')
      .eq('customer_id', customer.id)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await supabase.from('domains').insert({
      customer_id: customer.id,
      website_id: parsed.data.websiteId ?? website?.id ?? null,
      domain: parsed.data.domain,
      kind: 'custom',
      registrar: parsed.data.registrar ?? null,
      notes: parsed.data.notes ?? null,
    });

    if (error) {
      return NextResponse.json({ error: 'Could not save your domain request.' }, { status: 500 });
    }

    return NextResponse.json({ data: { ok: true } });
  });
}
