import type { Metadata } from 'next';
import { FileText } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { requireCustomer } from '@/lib/auth/session';
import { getCustomerWebsite } from '@/lib/dashboard/data';
import { createServerSupabase } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Pages', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function PagesListPage() {
  const { customer } = await requireCustomer();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const website = await getCustomerWebsite(supabase, customer.id);
  const { data: pages } = website
    ? await supabase.from('website_pages').select('*').eq('website_id', website.id).order('sort_order')
    : { data: [] };

  return (
    <div className="space-y-6">
      <PageHeader title="Pages" description="The pages that make up your website." />

      {!pages || pages.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No pages yet"
          description="Pages are created once your onboarding is complete and we’ve started building your website."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {pages.map((page) => (
            <Card key={page.id}>
              <CardContent className="flex items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-charcoal-900">{page.title}</p>
                  <p className="truncate text-xs text-charcoal-500">/{page.slug}</p>
                </div>
                <Badge variant={page.is_published ? 'success' : 'secondary'} size="sm">
                  {page.is_published ? 'Published' : 'Draft'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-sm text-charcoal-500">
        Want a new page adding, or one removed? Use <strong>Request changes</strong> from the My Website page.
      </p>
    </div>
  );
}
