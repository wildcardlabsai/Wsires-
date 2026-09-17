import type { Metadata } from 'next';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';

import { ChangeRequestActions } from '@/components/admin/change-request-actions';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
import { CHANGE_REQUEST_STATUS } from '@/lib/status';
import { formatRelative } from '@/lib/utils';
import type { ContentChangeRequestRow, CustomerRow } from '@/types/database';

export const metadata: Metadata = { title: 'Change requests', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminChangeRequestsPage() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: requests } = (await supabase
    .from('content_change_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)) as { data: ContentChangeRequestRow[] | null };

  const { data: customers } = (await supabase.from('customers').select('*')) as { data: CustomerRow[] | null };
  const customerMap = new Map((customers ?? []).map((c) => [c.id, c]));

  const rows = requests ?? [];
  const pending = rows.filter((r) => r.status === 'pending');
  const rest = rows.filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Change requests"
        description="Everything customers have asked to have changed on their website — this is now the only way they can request an edit."
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No change requests yet"
          description="When a customer asks for something to be changed, it will appear here for review."
        />
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-charcoal-400">
              Awaiting review ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <p className="text-sm text-charcoal-500">Nothing pending — you’re caught up.</p>
            ) : (
              <div className="space-y-3">
                {pending.map((r) => (
                  <RequestCard key={r.id} request={r} customer={customerMap.get(r.customer_id)} />
                ))}
              </div>
            )}
          </section>

          {rest.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-charcoal-400">History</h2>
              <div className="space-y-3">
                {rest.map((r) => (
                  <RequestCard key={r.id} request={r} customer={customerMap.get(r.customer_id)} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function RequestCard({ request, customer }: { request: ContentChangeRequestRow; customer?: CustomerRow }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {customer ? (
                <Link href={`/admin/customers/${customer.id}`} className="text-sm font-semibold text-charcoal-900 hover:text-cymru-700 hover:underline">
                  {customer.business_name}
                </Link>
              ) : (
                <span className="text-sm font-semibold text-charcoal-900">Unknown customer</span>
              )}
              <Badge variant={CHANGE_REQUEST_STATUS[request.status].variant} size="sm">
                {CHANGE_REQUEST_STATUS[request.status].label}
              </Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-charcoal-700">{request.summary}</p>
            {request.admin_notes && (
              <p className="mt-1.5 text-xs italic text-charcoal-500">Note: {request.admin_notes}</p>
            )}
            <p className="mt-2 text-xs text-charcoal-400">{formatRelative(request.created_at)}</p>
          </div>
          <ChangeRequestActions requestId={request.id} status={request.status} />
        </div>
      </CardContent>
    </Card>
  );
}
