import type { Metadata } from 'next';
import { Globe, ShieldCheck } from 'lucide-react';

import { DomainRequestForm } from '@/components/dashboard/domain-request-form';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { requireCustomer } from '@/lib/auth/session';
import { getCustomerWebsite } from '@/lib/dashboard/data';
import { createServerSupabase } from '@/lib/supabase/server';
import { DOMAIN_STATUS } from '@/lib/status';
import { subdomainUrl } from '@/lib/tenant';
import type { DomainRow } from '@/types/database';

export const metadata: Metadata = { title: 'Domain', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function DomainPage() {
  const { customer } = await requireCustomer();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const [website, domainsResult] = await Promise.all([
    getCustomerWebsite(supabase, customer.id),
    supabase.from('domains').select('*').eq('customer_id', customer.id).order('created_at', { ascending: false }),
  ]);
  const domains = domainsResult.data as DomainRow[] | null;

  return (
    <div className="space-y-6">
      <PageHeader title="Domain" description="Where your website lives on the internet." />

      {website?.subdomain && (
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-charcoal-400" aria-hidden />
              <div>
                <p className="text-sm font-medium text-charcoal-900">Included CymruSites address</p>
                <a
                  href={subdomainUrl(website.subdomain)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-cymru-700 hover:underline"
                >
                  {website.subdomain}.cymrusites.co.uk
                </a>
              </div>
            </div>
            <Badge variant="secondary">Always available</Badge>
          </CardContent>
        </Card>
      )}

      {!domains || domains.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No custom domain yet"
          description="Your website is available at your CymruSites address above. Add your own domain when you’re ready."
        />
      ) : (
        <div className="space-y-3">
          {domains.map((domain) => (
            <Card key={domain.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-charcoal-900">{domain.domain}</p>
                  <p className="mt-0.5 text-xs text-charcoal-500">
                    DNS: {domain.dns_status.replace('_', ' ')} · SSL: {domain.ssl_status.replace('_', ' ')}
                  </p>
                </div>
                <Badge variant={DOMAIN_STATUS[domain.status].variant}>{DOMAIN_STATUS[domain.status].label}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-charcoal-900">
            <ShieldCheck className="h-4 w-4 text-charcoal-400" aria-hidden />
            Connect your own domain
          </h3>
          <p className="mt-2 text-sm text-charcoal-500">
            Already own a domain, or want us to register one for you? Let us know and we’ll take care of the
            DNS and SSL setup — it can take up to 48 hours to go live.
          </p>
          <div className="mt-5">
            <DomainRequestForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
