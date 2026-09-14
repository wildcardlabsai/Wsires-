import { NextResponse } from 'next/server';

import { handleRoute, requireApiCustomer } from '@/lib/auth/api';
import { sendWebsiteApprovedEmail } from '@/lib/email/templates';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST() {
  return handleRoute(async () => {
    const { customer } = await requireApiCustomer();
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { data: website } = await supabase
      .from('websites')
      .select('id, status')
      .eq('customer_id', customer.id)
      .eq('status', 'awaiting_customer_approval')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!website) {
      return NextResponse.json({ error: 'There is nothing awaiting your approval right now.' }, { status: 404 });
    }

    const { error } = await supabase.from('websites').update({ status: 'approved' }).eq('id', website.id);
    if (error) return NextResponse.json({ error: 'Could not record your approval.' }, { status: 500 });

    void sendWebsiteApprovedEmail({ to: customer.email, name: customer.contact_name }).catch(() => {});

    return NextResponse.json({ data: { ok: true } });
  });
}
