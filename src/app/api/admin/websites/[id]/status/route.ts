import { NextResponse } from 'next/server';

import { handleRoute, requireApiAdmin } from '@/lib/auth/api';
import {
  sendChangesRequestedEmail,
  sendPreviewReadyEmail,
  sendWebsiteApprovedEmail,
  sendWebsiteLiveEmail,
} from '@/lib/email/templates';
import { createServerSupabase } from '@/lib/supabase/server';
import { websiteUrl } from '@/lib/tenant';
import { websiteStatusUpdateSchema } from '@/lib/validation/schemas';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    await requireApiAdmin();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = websiteStatusUpdateSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid status.' }, { status: 422 });

    const { data: website } = await supabase.from('websites').select('*').eq('id', id).maybeSingle();
    if (!website) return NextResponse.json({ error: 'Website not found.' }, { status: 404 });

    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', website.customer_id)
      .maybeSingle();

    const updates: Record<string, unknown> = { status: parsed.data.status };
    if (parsed.data.status === 'live') updates.published_at = new Date().toISOString();

    const { error } = await supabase.from('websites').update(updates).eq('id', id);
    if (error) return NextResponse.json({ error: 'Could not update status.' }, { status: 500 });

    if (parsed.data.note) {
      await supabase
        .from('website_status_history')
        .update({ note: parsed.data.note })
        .eq('website_id', id)
        .order('created_at', { ascending: false })
        .limit(1);
    }

    if (parsed.data.notifyCustomer && customer) {
      const previewUrl = websiteUrl({
        primaryDomain: website.primary_domain,
        subdomain: website.subdomain,
        slug: website.slug,
        isLive: false,
        previewToken: website.preview_token,
      });
      const liveUrl = websiteUrl({
        primaryDomain: website.primary_domain,
        subdomain: website.subdomain,
        slug: website.slug,
        isLive: true,
      });

      const emailArgs = { to: customer.email, name: customer.contact_name };
      switch (parsed.data.status) {
        case 'awaiting_customer_approval':
          void sendPreviewReadyEmail({ ...emailArgs, previewUrl, businessName: customer.business_name }).catch(() => {});
          break;
        case 'approved':
          void sendWebsiteApprovedEmail(emailArgs).catch(() => {});
          break;
        case 'live':
          void sendWebsiteLiveEmail({ ...emailArgs, websiteUrl: liveUrl, businessName: customer.business_name }).catch(() => {});
          break;
        case 'changes_requested':
          void sendChangesRequestedEmail({
            ...emailArgs,
            summary: parsed.data.note ?? 'We are making changes to your website.',
          }).catch(() => {});
          break;
      }
    }

    return NextResponse.json({ data: { ok: true } });
  });
}
