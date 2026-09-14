import type { Metadata } from 'next';

import { ContentEditorForm } from '@/components/dashboard/content-editor-form';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { requireCustomer } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Website Content', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function ContentPage() {
  const { customer } = await requireCustomer();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('customer_id', customer.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Content"
        description="Update the everyday details on your website. Changes are saved straight away."
      />

      {!business ? (
        <EmptyState
          title="Nothing to edit yet"
          description="Once your onboarding is complete, you’ll be able to update your business details here."
          action={{ label: 'Complete onboarding', href: '/onboarding' }}
        />
      ) : (
        <>
          <Alert variant="info">
            <Info />
            <AlertDescription>
              These changes update your website directly. For a new page, a different layout, or anything more
              involved, use <strong>Request changes</strong> from the My Website page instead.
            </AlertDescription>
          </Alert>
          <ContentEditorForm business={business} />
        </>
      )}
    </div>
  );
}
