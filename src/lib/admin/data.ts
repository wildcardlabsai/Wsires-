import 'server-only';

import type { TypedSupabaseClient } from '@/lib/supabase/server';

export interface AdminOverview {
  totalCustomers: number;
  activeWebsites: number;
  inProduction: number;
  awaitingInformation: number;
  mrrPence: number;
  newCustomersThisMonth: number;
  newCustomersLastMonth: number;
  churnedThisMonth: number;
  outstandingSupportTickets: number;
}

function monthStart(offset = 0): string {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCMonth(d.getUTCMonth() + offset);
  return d.toISOString();
}

export async function getAdminOverview(supabase: TypedSupabaseClient): Promise<AdminOverview> {
  const [
    customersCount,
    activeWebsitesCount,
    inProductionCount,
    awaitingInfoCount,
    activeSubs,
    newThisMonth,
    newLastMonth,
    churned,
    tickets,
  ] = await Promise.all([
    supabase.from('customers').select('id', { count: 'exact', head: true }),
    supabase.from('websites').select('id', { count: 'exact', head: true }).eq('status', 'live'),
    supabase.from('websites').select('id', { count: 'exact', head: true }).eq('status', 'in_production'),
    supabase.from('websites').select('id', { count: 'exact', head: true }).eq('status', 'awaiting_information'),
    supabase.from('subscriptions').select('amount_pence').eq('status', 'active'),
    supabase.from('customers').select('id', { count: 'exact', head: true }).gte('created_at', monthStart(0)),
    supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', monthStart(-1))
      .lt('created_at', monthStart(0)),
    supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'canceled')
      .gte('canceled_at', monthStart(0)),
    supabase
      .from('support_tickets')
      .select('id', { count: 'exact', head: true })
      .in('status', ['open', 'in_progress', 'waiting_for_customer']),
  ]);

  const mrrPence = (activeSubs.data ?? []).reduce((sum, row) => sum + (row.amount_pence ?? 0), 0);

  return {
    totalCustomers: customersCount.count ?? 0,
    activeWebsites: activeWebsitesCount.count ?? 0,
    inProduction: inProductionCount.count ?? 0,
    awaitingInformation: awaitingInfoCount.count ?? 0,
    mrrPence,
    newCustomersThisMonth: newThisMonth.count ?? 0,
    newCustomersLastMonth: newLastMonth.count ?? 0,
    churnedThisMonth: churned.count ?? 0,
    outstandingSupportTickets: tickets.count ?? 0,
  };
}

export interface MonthPoint {
  month: string;
  value: number;
}

/** Buckets a set of timestamped rows into the last N months. */
function bucketByMonth<T>(
  rows: T[],
  getDate: (row: T) => string | null,
  months: number,
): MonthPoint[] {
  const buckets = new Map<string, number>();
  const labels: string[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCMonth(d.getUTCMonth() - i);
    const key = d.toISOString().slice(0, 7);
    buckets.set(key, 0);
    labels.push(key);
  }

  for (const row of rows) {
    const date = getDate(row);
    if (!date) continue;
    const key = date.slice(0, 7);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return labels.map((month) => ({ month, value: buckets.get(month) ?? 0 }));
}

export async function getCustomerGrowth(supabase: TypedSupabaseClient, months = 6): Promise<MonthPoint[]> {
  const since = new Date();
  since.setUTCMonth(since.getUTCMonth() - (months - 1), 1);
  const { data } = await supabase.from('customers').select('created_at').gte('created_at', since.toISOString());
  return bucketByMonth(data ?? [], (r) => r.created_at, months);
}

export async function getRevenueHistory(supabase: TypedSupabaseClient, months = 6): Promise<MonthPoint[]> {
  const since = new Date();
  since.setUTCMonth(since.getUTCMonth() - (months - 1), 1);
  const { data } = await supabase
    .from('payments')
    .select('paid_at, amount_pence')
    .eq('status', 'succeeded')
    .gte('paid_at', since.toISOString());

  const buckets = new Map<string, number>();
  const labels: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCMonth(d.getUTCMonth() - i);
    const key = d.toISOString().slice(0, 7);
    buckets.set(key, 0);
    labels.push(key);
  }
  for (const row of data ?? []) {
    if (!row.paid_at) continue;
    const key = row.paid_at.slice(0, 7);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + row.amount_pence / 100);
  }
  return labels.map((month) => ({ month, value: Math.round((buckets.get(month) ?? 0) * 100) / 100 }));
}

export async function getMrrHistory(supabase: TypedSupabaseClient, months = 6): Promise<MonthPoint[]> {
  /* Approximated from active subscription start dates — a true historic MRR
     ledger would need its own snapshot table, out of scope for v1. */
  const since = new Date();
  since.setUTCMonth(since.getUTCMonth() - (months - 1), 1);
  const { data } = await supabase
    .from('subscriptions')
    .select('created_at, amount_pence, status')
    .neq('status', 'incomplete')
    .gte('created_at', since.toISOString());

  const buckets = new Map<string, number>();
  const labels: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCMonth(d.getUTCMonth() - i);
    const key = d.toISOString().slice(0, 7);
    buckets.set(key, 0);
    labels.push(key);
  }
  let running = 0;
  const sorted = [...(data ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at));
  for (const key of labels) {
    for (const row of sorted) {
      if (row.created_at.slice(0, 7) === key) running += row.amount_pence / 100;
    }
    buckets.set(key, running);
  }
  return labels.map((month) => ({ month, value: Math.round((buckets.get(month) ?? 0) * 100) / 100 }));
}

export interface StatusCount {
  status: string;
  count: number;
}

export async function getWebsiteStatusBreakdown(supabase: TypedSupabaseClient): Promise<StatusCount[]> {
  const { data } = await supabase.from('websites').select('status');
  const counts = new Map<string, number>();
  for (const row of data ?? []) counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
  return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
}
