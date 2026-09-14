import { NextResponse } from 'next/server';
import { z } from 'zod';

import { handleRoute, requireApiAdmin } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';

const schema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  description: z.string().trim().max(500).optional(),
  bestFor: z.string().trim().max(200).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    await requireApiAdmin();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = schema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request.' }, { status: 422 });

    const update: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) update.name = parsed.data.name;
    if (parsed.data.description !== undefined) update.description = parsed.data.description;
    if (parsed.data.bestFor !== undefined) update.best_for = parsed.data.bestFor;
    if (parsed.data.isActive !== undefined) update.is_active = parsed.data.isActive;

    const { data: template, error } = await supabase
      .from('website_templates')
      .update(update)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error || !template) return NextResponse.json({ error: 'Could not update template.' }, { status: 500 });
    return NextResponse.json({ data: { template } });
  });
}
