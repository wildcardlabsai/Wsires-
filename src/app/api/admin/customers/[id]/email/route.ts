import { NextResponse } from 'next/server';

import { handleRoute, requireApiAdmin } from '@/lib/auth/api';
import { sendAdminCustomerEmail } from '@/lib/email/templates';
import { createServerSupabase } from '@/lib/supabase/server';
import { adminEmailSchema } from '@/lib/validation/schemas';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    await requireApiAdmin();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = adminEmailSchema.safeParse({ ...payload, customerId: id });
    if (!parsed.success) return NextResponse.json({ error: 'Enter a subject and message.' }, { status: 422 });

    const { data: customer } = await supabase.from('customers').select('*').eq('id', id).maybeSingle();
    if (!customer) return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });

    const result = await sendAdminCustomerEmail({
      to: customer.email,
      name: customer.contact_name,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });

    if (!result.sent && result.skipped !== 'not_configured') {
      return NextResponse.json({ error: 'The email could not be sent.' }, { status: 500 });
    }

    return NextResponse.json({ data: { ok: true, skipped: result.skipped ?? null } });
  });
}
