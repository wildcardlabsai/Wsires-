import type { Metadata } from 'next';
import { Inbox } from 'lucide-react';

import { LeadsTable } from '@/components/dashboard/leads-table';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { requireCustomer } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Leads', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const { customer } = await requireCustomer();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader title="Leads" description="Enquiries from your website contact form." />

      {!leads || leads.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No leads yet"
          description="When someone fills in the contact form on your website, their enquiry will appear here — and we’ll email it to you too."
        />
      ) : (
        <LeadsTable leads={leads} />
      )}
    </div>
  );
}
