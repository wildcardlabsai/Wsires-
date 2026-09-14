import type { Metadata } from 'next';
import Link from 'next/link';
import { Globe } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { requireAdmin } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
import { WEBSITE_STATUS } from '@/lib/status';
import { formatDate } from '@/lib/utils';
import type { CustomerRow, WebsiteRow } from '@/types/database';

export const metadata: Metadata = { title: 'Websites', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminWebsitesPage() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: websites } = (await supabase
    .from('websites')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)) as { data: WebsiteRow[] | null };

  const { data: customers } = (await supabase.from('customers').select('*')) as { data: CustomerRow[] | null };
  const customerMap = new Map((customers ?? []).map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <PageHeader title="Websites" description="Every website across the platform." />

      {!websites || websites.length === 0 ? (
        <EmptyState icon={Globe} title="No websites yet" description="Websites appear here once a customer completes onboarding." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Website</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {websites.map((website) => {
                const customer = customerMap.get(website.customer_id);
                return (
                  <TableRow key={website.id}>
                    <TableCell>
                      <Link href={`/admin/websites/${website.id}`} className="font-medium text-charcoal-900 hover:text-cymru-700 hover:underline">
                        {website.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-charcoal-600">{customer?.business_name ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={WEBSITE_STATUS[website.status].variant} size="sm">
                        {WEBSITE_STATUS[website.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-charcoal-600">{website.primary_domain ?? website.subdomain ?? '—'}</TableCell>
                    <TableCell className="text-charcoal-500">{formatDate(website.created_at)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
