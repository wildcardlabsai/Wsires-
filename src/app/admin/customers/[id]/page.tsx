import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';

import {
  AddNoteForm,
  EditCustomerDialog,
  SendEmailDialog,
  SuspendReactivateButton,
} from '@/components/admin/customer-actions';
import { BusinessEditorForm } from '@/components/admin/business-editor-form';
import { CancelSubscriptionButton } from '@/components/admin/subscription-actions';
import { TemplateControl } from '@/components/admin/template-control';
import { WebsiteStatusControl } from '@/components/admin/website-status-control';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { requireAdmin } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
import { websiteUrl } from '@/lib/tenant';
import {
  CUSTOMER_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  SUBSCRIPTION_STATUS,
  WEBSITE_STATUS,
} from '@/lib/status';
import { formatDate, formatDateTime, formatPrice } from '@/lib/utils';
import type {
  AdminNoteRow,
  BusinessRow,
  ContentChangeRequestRow,
  CustomerRow,
  OnboardingSubmissionRow,
  OrderRow,
  PaymentRow,
  PlanRow,
  SubscriptionRow,
  SupportTicketRow,
  WebsiteRow,
  WebsiteTemplateRow,
} from '@/types/database';
import { CHANGE_REQUEST_STATUS } from '@/lib/status';

export const metadata: Metadata = { title: 'Customer', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: customer } = (await supabase.from('customers').select('*').eq('id', id).maybeSingle()) as {
    data: CustomerRow | null;
  };
  if (!customer) notFound();

  const [
    plansResult,
    businessResult,
    websitesResult,
    ordersResult,
    subscriptionsResult,
    paymentsResult,
    onboardingResult,
    ticketsResult,
    notesResult,
  ] = await Promise.all([
    supabase.from('plans').select('*'),
    supabase.from('businesses').select('*').eq('customer_id', id).maybeSingle(),
    supabase.from('websites').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
    supabase.from('orders').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
    supabase.from('subscriptions').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
    supabase.from('payments').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
    supabase
      .from('onboarding_submissions')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('support_tickets').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
    supabase.from('admin_notes').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
  ]);

  const plans = (plansResult.data ?? []) as PlanRow[];
  const business = businessResult.data as BusinessRow | null;
  const websites = (websitesResult.data ?? []) as WebsiteRow[];
  const orders = (ordersResult.data ?? []) as OrderRow[];
  const subscriptions = (subscriptionsResult.data ?? []) as SubscriptionRow[];
  const payments = (paymentsResult.data ?? []) as PaymentRow[];
  const onboarding = onboardingResult.data as OnboardingSubmissionRow | null;
  const tickets = (ticketsResult.data ?? []) as SupportTicketRow[];
  const notes = (notesResult.data ?? []) as AdminNoteRow[];

  const website = websites[0] ?? null;
  const plan = plans.find((p) => p.id === customer.plan_id);

  const [templatesResult, changeRequestsResult] = await Promise.all([
    supabase.from('website_templates').select('*').order('sort_order'),
    supabase.from('content_change_requests').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
  ]);
  const templates = (templatesResult.data ?? []) as WebsiteTemplateRow[];
  const changeRequests = (changeRequestsResult.data ?? []) as ContentChangeRequestRow[];

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.business_name}
        eyebrow="Customer"
        description={customer.email}
        actions={
          <>
            <Badge variant={CUSTOMER_STATUS[customer.status].variant}>{CUSTOMER_STATUS[customer.status].label}</Badge>
            {customer.is_demo && <Badge variant="demo">Demo</Badge>}
            <EditCustomerDialog customer={customer} plans={plans} />
            <SendEmailDialog customerId={customer.id} />
            <SuspendReactivateButton customerId={customer.id} status={customer.status} />
          </>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row label="Contact" value={customer.contact_name ?? '—'} />
                <Row label="Email" value={customer.email} />
                <Row label="Phone" value={customer.phone ?? '—'} />
                <Row
                  label="Address"
                  value={[customer.address_line1, customer.city, customer.postcode].filter(Boolean).join(', ') || '—'}
                />
                <Row label="Plan" value={plan?.name ?? '—'} />
                <Row label="Customer since" value={formatDate(customer.created_at)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {business ? (
                  <>
                    <Row label="Industry" value={business.industry.replace(/_/g, ' ')} />
                    <Row label="Services" value={business.services?.map((s) => s.title).join(', ') || '—'} />
                    <Row label="Areas" value={business.service_areas?.join(', ') || '—'} />
                  </>
                ) : (
                  <p className="text-charcoal-500">No business profile yet — onboarding not complete.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="website">
          {!website ? (
            <p className="text-sm text-charcoal-500">No website created yet.</p>
          ) : (
            <Card>
              <CardContent className="space-y-5 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-charcoal-900">{website.name}</p>
                    <p className="text-sm text-charcoal-500">{WEBSITE_STATUS[website.status].label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={websiteUrl({
                        primaryDomain: website.primary_domain,
                        subdomain: website.subdomain,
                        slug: website.slug,
                        isLive: website.status === 'live',
                        previewToken: website.preview_token,
                      })}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-cymru-700 hover:underline"
                    >
                      View site <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <WebsiteStatusControl websiteId={website.id} status={website.status} />
                  </div>
                </div>
                <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
                  <Row label="Slug" value={website.slug} />
                  <Row label="Subdomain" value={website.subdomain ?? '—'} />
                  <Row label="Custom domain" value={website.primary_domain ?? '—'} />
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm text-charcoal-500">Website style</span>
                  <TemplateControl websiteId={website.id} templateId={website.template_id} templates={templates} />
                </div>
                <div className="border-t border-border pt-4">
                  <Link href={`/admin/websites/${website.id}`} className="text-sm font-medium text-cymru-700 hover:underline">
                    Open full website record →
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {changeRequests.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Change requests</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {changeRequests.map((cr) => (
                    <li key={cr.id} className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <Badge variant={CHANGE_REQUEST_STATUS[cr.status].variant} size="sm">
                          {CHANGE_REQUEST_STATUS[cr.status].label}
                        </Badge>
                        <span className="text-xs text-charcoal-400">{formatDate(cr.created_at)}</span>
                      </div>
                      <p className="mt-2 text-sm text-charcoal-800">{cr.summary}</p>
                    </li>
                  ))}
                </ul>
                <Link href="/admin/change-requests" className="mt-4 inline-block text-sm font-medium text-cymru-700 hover:underline">
                  Manage all change requests →
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Business details</CardTitle>
            </CardHeader>
            <CardContent>
              <BusinessEditorForm customerId={id} business={business} fallbackName={customer.business_name} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <p className="text-sm text-charcoal-500">No subscription yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {subscriptions.map((sub) => (
                      <li key={sub.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-charcoal-900">{formatPrice(sub.amount_pence)}/month</p>
                            <Badge variant={SUBSCRIPTION_STATUS[sub.status].variant} size="sm">
                              {SUBSCRIPTION_STATUS[sub.status].label}
                            </Badge>
                          </div>
                          {sub.current_period_end && (
                            <p className="mt-1 text-xs text-charcoal-500">
                              Renews {formatDate(sub.current_period_end)}
                            </p>
                          )}
                        </div>
                        {sub.status === 'active' && <CancelSubscriptionButton subscriptionId={sub.id} />}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-sm text-charcoal-500">No orders yet.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {orders.map((order) => (
                      <li key={order.id} className="flex items-center justify-between py-2.5 text-sm">
                        <span>
                          {order.reference} · {order.kind}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-charcoal-900">{formatPrice(order.amount_pence)}</span>
                          <Badge variant={ORDER_STATUS[order.status].variant} size="sm">
                            {ORDER_STATUS[order.status].label}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment history</CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-sm text-charcoal-500">No payments yet.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {payments.map((payment) => (
                      <li key={payment.id} className="flex items-center justify-between py-2.5 text-sm">
                        <span>{payment.description ?? 'Payment'}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-charcoal-900">{formatPrice(payment.amount_pence)}</span>
                          <Badge variant={PAYMENT_STATUS[payment.status].variant} size="sm">
                            {PAYMENT_STATUS[payment.status].label}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="onboarding">
          <Card>
            <CardContent className="p-6">
              {!onboarding ? (
                <p className="text-sm text-charcoal-500">No onboarding submission yet.</p>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Badge variant={onboarding.status === 'submitted' ? 'success' : 'warning'}>
                      {onboarding.status === 'submitted' ? 'Submitted' : 'In progress'}
                    </Badge>
                    <span className="text-xs text-charcoal-500">
                      {onboarding.submitted_at ? `Submitted ${formatDateTime(onboarding.submitted_at)}` : `Step ${onboarding.current_step} of 10`}
                    </span>
                  </div>
                  <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-charcoal-950 p-4 text-xs text-charcoal-200">
                    {JSON.stringify(onboarding.data, null, 2)}
                  </pre>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          {tickets.length === 0 ? (
            <p className="text-sm text-charcoal-500">No support tickets.</p>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <Link key={ticket.id} href={`/admin/support/${ticket.id}`}>
                  <Card className="transition-shadow hover:shadow-card">
                    <CardContent className="flex items-center justify-between p-4">
                      <span className="text-sm font-medium text-charcoal-900">{ticket.subject}</span>
                      <span className="text-xs text-charcoal-500">{formatDate(ticket.created_at)}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="space-y-5 p-6">
              <AddNoteForm customerId={customer.id} />
              {notes.length === 0 ? (
                <p className="text-sm text-charcoal-500">No notes yet.</p>
              ) : (
                <ul className="space-y-3 border-t border-border pt-4">
                  {notes.map((note) => (
                    <li key={note.id} className="rounded-lg bg-cream-100 p-4">
                      <p className="text-sm text-charcoal-800">{note.body}</p>
                      <p className="mt-2 text-xs text-charcoal-400">
                        {note.author_name ?? 'Admin'} · {formatDateTime(note.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-charcoal-500">{label}</dt>
      <dd className="text-right font-medium text-charcoal-900">{value}</dd>
    </div>
  );
}
