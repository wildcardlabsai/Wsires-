import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';

import { createServerSupabase } from '@/lib/supabase/server';
import type { CustomerRow, ProfileRow } from '@/types/database';

export interface SessionUser {
  id: string;
  email: string;
  profile: ProfileRow;
}

/**
 * The signed-in user and their profile, or null.
 * Cached per request so layouts and pages don't re-query.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) return null;

  return { id: user.id, email: user.email ?? profile.email, profile };
});

/** The customer record owned by the signed-in user, if they have one. */
export const getCurrentCustomer = cache(async (): Promise<CustomerRow | null> => {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const user = await getSessionUser();
  if (!user) return null;

  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('profile_id', user.id)
    .maybeSingle();

  return data ?? null;
});

export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  return user?.profile.role === 'admin';
}

/** Guard for any signed-in area. Redirects to login, preserving the target. */
export async function requireUser(redirectTo = '/dashboard'): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}

/** Guard for /admin. Customers are sent back to their own dashboard. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login?next=%2Fadmin');
  }
  if (user.profile.role !== 'admin') {
    redirect('/dashboard?error=admin_only');
  }
  return user;
}

/** Guard for customer dashboard routes that need a customer record. */
export async function requireCustomer(): Promise<{ user: SessionUser; customer: CustomerRow }> {
  const user = await requireUser();
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect('/onboarding/start');
  }
  return { user, customer };
}
