import type { Metadata } from 'next';

import { MediaLibrary } from '@/components/dashboard/media-library';
import { PageHeader } from '@/components/shared/page-header';
import { requireCustomer } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Media', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const { customer } = await requireCustomer();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: media } = await supabase
    .from('media')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader title="Media" description="Photos and files for your website." />
      <MediaLibrary initialMedia={media ?? []} />
    </div>
  );
}
