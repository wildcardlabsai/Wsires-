import { NextResponse } from 'next/server';

import { handleRoute, requireApiCustomer } from '@/lib/auth/api';
import { sendWebsiteApprovedEmail } from '@/lib/email/templates';
import { requireAdminSupabase } from '@/lib/supabase/server';

/**
 * Approving is a customer action, but the `websites.status` column is
 * protected against non-admin writes at the database level (see
 * protect_website_fields in the RLS migration) — correctly, since a
 * customer must never be able to set their own site to "live" or bypass
 * production stages. requireApiCustomer() has already verified the caller
 * owns this website; the actual write goes through the service role so
 * that verified, narrow state change can succeed.
 */
export async function POST() {
  return handleRoute(async () => {
    const { customer } = await requireApiCustomer();
    const supabase = requireAdminSupabase();

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
