import { NextResponse } from 'next/server';

import { handleRoute, requireApiAdmin } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';
import { changeRequestReviewSchema } from '@/lib/validation/schemas';

/**
 * Reviews a customer's change request. "approve" / "reject" record the
 * admin's decision; once the agency has actually made the change (via the
 * business editor, the website content tools, or a direct database edit),
 * mark it "applied" so it drops off the active queue.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const actor = await requireApiAdmin();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);

    /* "applied" isn't part of the review schema (approve/reject only) — handle it separately. */
    if (payload && payload.action === 'applied') {
      const { error } = await supabase
        .from('content_change_requests')
        .update({ status: 'applied', reviewed_by: actor.userId, reviewed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) return NextResponse.json({ error: 'Could not update that request.' }, { status: 500 });
      return NextResponse.json({ data: { ok: true } });
    }

    const parsed = changeRequestReviewSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request.' }, { status: 422 });

    const { error } = await supabase
      .from('content_change_requests')
      .update({
        status: parsed.data.action === 'approve' ? 'approved' : 'rejected',
        admin_notes: parsed.data.adminNotes ?? null,
        reviewed_by: actor.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) return NextResponse.json({ error: 'Could not update that request.' }, { status: 500 });
    return NextResponse.json({ data: { ok: true } });
  });
}
