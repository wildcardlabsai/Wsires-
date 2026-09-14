import type { Metadata } from 'next';
import Link from 'next/link';
import { Users } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { requireAdmin } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
import { CUSTOMER_STATUS } from '@/lib/status';
import { formatDate } from '@/lib/utils';
import type { CustomerRow, PlanRow } from '@/types/database';

export const metadata: Metadata = { title: 'Customers', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  let query = supabase.from('customers').select('*').order('created_at', { ascending: false }).limit(100);
  if (q) query = query.or(`business_name.ilike.%${q}%,email.ilike.%${q}%`);
  const { data: customers } = (await query) as { data: CustomerRow[] | null };

  const { data: plans } = (await supabase.from('plans').select('*')) as { data: PlanRow[] | null };
  const planMap = new Map((plans ?? []).map((p) => [p.id, p.name]));

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Every business using CymruSites." />

      <form className="max-w-sm">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by business or email…"
          className="h-10 w-full rounded-md border border-input bg-white px-3.5 text-sm shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </form>

      {!customers || customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers yet" description="Customers will appear here as they sign up." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/admin/customers/${customer.id}`} className="font-medium text-charcoal-900 hover:text-cymru-700 hover:underline">
                      {customer.business_name}
                    </Link>
                    {customer.is_demo && (
                      <Badge variant="demo" size="sm" className="ml-2">
                        Demo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-charcoal-600">{customer.email}</TableCell>
                  <TableCell className="text-charcoal-600">
                    {customer.plan_id ? planMap.get(customer.plan_id) ?? '—' : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={CUSTOMER_STATUS[customer.status].variant} size="sm">
                      {CUSTOMER_STATUS[customer.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-charcoal-500">{formatDate(customer.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
