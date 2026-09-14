import type { Metadata } from 'next';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

import { AdminAllowlistEditor } from '@/components/admin/admin-allowlist-editor';
import { PlanEditorDialog } from '@/components/admin/plan-editor-dialog';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth/session';
import { getSetting } from '@/lib/content/settings';
import { SETTINGS_KEYS } from '@/lib/content/defaults';
import { integrationStatus } from '@/lib/env';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import type { PlanRow } from '@/types/database';

export const metadata: Metadata = { title: 'Settings', robots: { index: false } };
export const dynamic = 'force-dynamic';

const INTEGRATIONS: { key: keyof ReturnType<typeof integrationStatus>; label: string; envVars: string[] }[] = [
  { key: 'supabase', label: 'Supabase (database & auth)', envVars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] },
  { key: 'supabaseAdmin', label: 'Supabase service role (admin operations)', envVars: ['SUPABASE_SERVICE_ROLE_KEY'] },
  { key: 'stripe', label: 'Stripe (payments)', envVars: ['STRIPE_SECRET_KEY', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'] },
  { key: 'stripeWebhook', label: 'Stripe webhook signature', envVars: ['STRIPE_WEBHOOK_SECRET'] },
  { key: 'resend', label: 'Resend (transactional email)', envVars: ['RESEND_API_KEY'] },
];

export default async function AdminSettingsPage() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: plans } = (await supabase.from('plans').select('*').order('sort_order')) as { data: PlanRow[] | null };
  const adminEmails = await getSetting<string[]>(SETTINGS_KEYS.adminAllowlist, []);
  const status = integrationStatus();

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Platform configuration — pricing, admin access and integrations." />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Pricing & packages</CardTitle>
          <PlanEditorDialog />
        </CardHeader>
        <CardContent className="space-y-3">
          {!plans || plans.length === 0 ? (
            <p className="text-sm text-charcoal-500">No plans configured.</p>
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-charcoal-900">{plan.name}</p>
                    {plan.is_featured && <Badge variant="cymru" size="sm">Featured</Badge>}
                    {!plan.is_active && <Badge variant="secondary" size="sm">Hidden</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-charcoal-500">
                    {formatPrice(plan.setup_price_pence)} setup · {formatPrice(plan.monthly_price_pence)}/month · {plan.max_pages} pages
                  </p>
                </div>
                <PlanEditorDialog plan={plan} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin access</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminAllowlistEditor emails={adminEmails} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {INTEGRATIONS.map((integration) => {
            const connected = status[integration.key];
            return (
              <div key={integration.key} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                <div>
                  <div className="flex items-center gap-2">
                    {connected ? (
                      <CheckCircle2 className="h-4 w-4 text-moss-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-charcoal-300" />
                    )}
                    <p className="font-medium text-charcoal-900">{integration.label}</p>
                  </div>
                  <p className="mt-1 text-xs text-charcoal-500">
                    {connected ? 'Connected' : `Add ${integration.envVars.join(', ')} to enable.`}
                  </p>
                </div>
                <Badge variant={connected ? 'success' : 'secondary'}>{connected ? 'Connected' : 'Not configured'}</Badge>
              </div>
            );
          })}
          {!status.stripe && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-900">
                Without Stripe configured, customers cannot pay for a plan and billing pages will show a clear
                &ldquo;not available&rdquo; message rather than a broken checkout.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
