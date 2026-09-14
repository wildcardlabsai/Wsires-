import { NextResponse } from 'next/server';

import { handleRoute, requireApiAdmin } from '@/lib/auth/api';
import { createServerSupabase } from '@/lib/supabase/server';
import { sectionUpsertSchema } from '@/lib/validation/schemas';

/**
 * Admin authoring of a section's content in a specific locale — used to add
 * the Welsh (`cy`) version of a section on a bilingual website. `websiteId`
 * in the URL and body must agree; the row is upserted on
 * (website_id, page_id, section_key, locale).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    await requireApiAdmin();
    const { id } = await params;
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const payload = await request.json().catch(() => null);
    const parsed = sectionUpsertSchema.safeParse({ ...payload, websiteId: id });
    if (!parsed.success) return NextResponse.json({ error: 'Invalid content.' }, { status: 422 });
    const d = parsed.data;

    const { data: section, error } = await supabase
      .from('website_content')
      .upsert(
        {
          website_id: id,
          page_id: d.pageId ?? null,
          section_key: d.sectionKey,
          section_type: d.sectionType,
          locale: d.locale,
          data: d.data as never,
          is_visible: d.isVisible ?? true,
          sort_order: d.sortOrder ?? 0,
        },
        { onConflict: 'website_id,page_id,section_key,locale' },
      )
      .select('*')
      .single();

    if (error || !section) return NextResponse.json({ error: 'Could not save that content.' }, { status: 500 });
    return NextResponse.json({ data: { section } });
  });
}
