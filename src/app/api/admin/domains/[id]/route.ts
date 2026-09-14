import { NextResponse } from 'next/server';

import { handleRoute, requireApiAdmin } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';
import { domainAdminUpdateSchema } from '@/lib/validation/schemas';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    await requireApiAdmin();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = domainAdminUpdateSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request.' }, { status: 422 });

    const d = parsed.data;
    const update: Record<string, unknown> = {};
    if (d.status !== undefined) update.status = d.status;
    if (d.dnsStatus !== undefined) update.dns_status = d.dnsStatus;
    if (d.sslStatus !== undefined) update.ssl_status = d.sslStatus;
    if (d.notes !== undefined) update.notes = d.notes;
    if (d.websiteId !== undefined) update.website_id = d.websiteId;
    if (d.isPrimary !== undefined) update.is_primary = d.isPrimary;
    if (d.status === 'verified' && !update.verified_at) update.verified_at = new Date().toISOString();
    if (d.status === 'live') update.live_at = new Date().toISOString();

    const { data: domain, error } = await supabase
      .from('domains')
      .update(update)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error || !domain) return NextResponse.json({ error: 'Could not update domain.' }, { status: 500 });

    /* Marking a domain live also puts the site live and records it as the primary domain. */
    if (d.status === 'live' && domain.website_id) {
      await supabase
        .from('websites')
        .update({ primary_domain: domain.domain, status: 'live', published_at: new Date().toISOString() })
        .eq('id', domain.website_id);
    }

    return NextResponse.json({ data: { domain } });
  });
}
