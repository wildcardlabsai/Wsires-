import type { Metadata } from 'next';
import { Globe } from 'lucide-react';

import { DomainStatusControls } from '@/components/admin/domain-status-controls';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { requireAdmin } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import type { CustomerRow, DomainRow } from '@/types/database';

export const metadata: Metadata = { title: 'Domains', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminDomainsPage() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: domains } = (await supabase
    .from('domains')
    .select('*')
    .order('created_at', { ascending: false })) as { data: DomainRow[] | null };
  const { data: customers } = (await supabase.from('customers').select('*')) as { data: CustomerRow[] | null };
  const customerMap = new Map((customers ?? []).map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Domains"
        description="Manage DNS, SSL and go-live status for every domain. Provisioning is confirmed manually for now."
      />
      {!domains || domains.length === 0 ? (
        <EmptyState icon={Globe} title="No domains requested yet" description="Domain requests from customers will appear here." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="font-medium text-charcoal-900">
                    {domain.domain}
                    {domain.kind === 'subdomain' && (
                      <Badge variant="secondary" size="sm" className="ml-2">
                        Subdomain
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-charcoal-600">{customerMap.get(domain.customer_id)?.business_name ?? '—'}</TableCell>
                  <TableCell>
                    <DomainStatusControls
                      domainId={domain.id}
                      status={domain.status}
                      dnsStatus={domain.dns_status}
                      sslStatus={domain.ssl_status}
                    />
                  </TableCell>
                  <TableCell className="text-charcoal-500">{formatDate(domain.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
