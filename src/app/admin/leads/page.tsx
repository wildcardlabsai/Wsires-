import type { Metadata } from 'next';
import { Inbox } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { requireAdmin } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
import { LEAD_STATUS } from '@/lib/status';
import { formatRelative } from '@/lib/utils';
import type { CustomerRow, LeadRow } from '@/types/database';

export const metadata: Metadata = { title: 'Leads', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: leads } = (await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)) as { data: LeadRow[] | null };
  const { data: customers } = (await supabase.from('customers').select('*')) as { data: CustomerRow[] | null };
  const customerMap = new Map((customers ?? []).map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <PageHeader title="Leads" description="Every enquiry captured across all customer websites." />
      {!leads || leads.length === 0 ? (
        <EmptyState icon={Inbox} title="No leads yet" description="Enquiries from customer websites will appear here." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium text-charcoal-900">{lead.name}</TableCell>
                  <TableCell className="text-charcoal-600">{customerMap.get(lead.customer_id)?.business_name ?? '—'}</TableCell>
                  <TableCell className="max-w-xs truncate text-charcoal-600">{lead.message}</TableCell>
                  <TableCell className="text-charcoal-500">{formatRelative(lead.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={LEAD_STATUS[lead.status].variant} size="sm">
                      {LEAD_STATUS[lead.status].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
