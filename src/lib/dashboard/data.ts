import 'server-only';

import type { TypedSupabaseClient } from '@/lib/supabase/server';
import type {
  BusinessRow,
  DomainRow,
  LeadRow,
  SupportTicketRow,
  WebsiteRow,
  WebsiteTemplateRow,
} from '@/types/database';

/** The customer's current website — the most recently created, non-cancelled one. */
export async function getCustomerWebsite(
  supabase: TypedSupabaseClient,
  customerId: string,
): Promise<(WebsiteRow & { business: BusinessRow | null; template: WebsiteTemplateRow | null }) | null> {
  const { data: website } = await supabase
    .from('websites')
    .select('*')
    .eq('customer_id', customerId)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!website) return null;

  const [{ data: business }, { data: template }] = await Promise.all([
    website.business_id
      ? supabase.from('businesses').select('*').eq('id', website.business_id).maybeSingle()
      : Promise.resolve({ data: null }),
    website.template_id
      ? supabase.from('website_templates').select('*').eq('id', website.template_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return { ...website, business: business ?? null, template: template ?? null };
}

export interface DashboardStats {
  pageviews30d: number;
  pageviews30dPrev: number;
  sessions30d: number;
  enquiries30d: number;
  enquiries30dPrev: number;
  topPages: { path: string; views: number }[];
}

export async function getDashboardStats(
  supabase: TypedSupabaseClient,
  websiteId: string,
): Promise<DashboardStats> {
  const today = new Date();
  const start30 = new Date(today);
  start30.setDate(start30.getDate() - 30);
  const start60 = new Date(today);
  start60.setDate(start60.getDate() - 60);

  const { data: rows } = await supabase
    .from('analytics_daily')
    .select('date, pageviews, sessions, enquiries, top_pages')
    .eq('website_id', websiteId)
    .gte('date', start60.toISOString().slice(0, 10))
    .order('date', { ascending: true });

  const all = rows ?? [];
  const recent = all.filter((r) => r.date >= start30.toISOString().slice(0, 10));
  const previous = all.filter((r) => r.date < start30.toISOString().slice(0, 10));

  const sum = (list: typeof all, key: 'pageviews' | 'sessions' | 'enquiries') =>
    list.reduce((total, row) => total + (row[key] ?? 0), 0);

  const topPagesMap = new Map<string, number>();
  for (const row of recent) {
    for (const page of (row.top_pages ?? []) as { path: string; views: number }[]) {
      topPagesMap.set(page.path, (topPagesMap.get(page.path) ?? 0) + page.views);
    }
  }
  const topPages = Array.from(topPagesMap.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return {
    pageviews30d: sum(recent, 'pageviews'),
    pageviews30dPrev: sum(previous, 'pageviews'),
    sessions30d: sum(recent, 'sessions'),
    enquiries30d: sum(recent, 'enquiries'),
    enquiries30dPrev: sum(previous, 'enquiries'),
    topPages,
  };
}

export async function getRecentLeads(
  supabase: TypedSupabaseClient,
  customerId: string,
  limit = 5,
): Promise<LeadRow[]> {
  const { data } = await supabase
    .from('leads')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getOpenTickets(
  supabase: TypedSupabaseClient,
  customerId: string,
): Promise<SupportTicketRow[]> {
  const { data } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('customer_id', customerId)
    .neq('status', 'resolved')
    .order('last_message_at', { ascending: false });
  return data ?? [];
}

export async function getCustomerDomain(
  supabase: TypedSupabaseClient,
  customerId: string,
): Promise<DomainRow | null> {
  const { data } = await supabase
    .from('domains')
    .select('*')
    .eq('customer_id', customerId)
    .eq('is_primary', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}
