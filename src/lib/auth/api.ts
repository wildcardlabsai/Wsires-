import 'server-only';

import { NextResponse } from 'next/server';

import { createServerSupabase } from '@/lib/supabase/server';
import type { CustomerRow, ProfileRow } from '@/types/database';

export interface ApiActor {
  userId: string;
  email: string;
  profile: ProfileRow;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status = 400,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Consistent JSON error envelope for every API route. */
export function apiError(message: string, status = 400, code?: string) {
  return NextResponse.json({ error: message, code: code ?? null }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

/** Resolve the caller, or throw an ApiError the route handler converts to 401. */
export async function requireApiUser(): Promise<ApiActor> {
  const supabase = await createServerSupabase();
  if (!supabase) throw new ApiError('Supabase is not configured.', 503, 'not_configured');

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new ApiError('You must be signed in.', 401, 'unauthenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) throw new ApiError('Profile not found.', 401, 'no_profile');

  return { userId: user.id, email: user.email ?? profile.email, profile };
}

export async function requireApiAdmin(): Promise<ApiActor> {
  const actor = await requireApiUser();
  if (actor.profile.role !== 'admin') {
    throw new ApiError('Administrator access required.', 403, 'forbidden');
  }
  return actor;
}

/** Caller plus the customer record they own. */
export async function requireApiCustomer(): Promise<{ actor: ApiActor; customer: CustomerRow }> {
  const actor = await requireApiUser();
  const supabase = await createServerSupabase();
  if (!supabase) throw new ApiError('Supabase is not configured.', 503, 'not_configured');

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('profile_id', actor.userId)
    .maybeSingle();

  if (!customer) throw new ApiError('No customer account found.', 404, 'no_customer');
  return { actor, customer };
}

/**
 * Wrap a route handler so thrown ApiErrors (and unexpected errors) always come
 * back as JSON the client can show the user.
 */
export async function handleRoute<T>(fn: () => Promise<T>): Promise<T | NextResponse> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ApiError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error('[api] unhandled error', error);
    const message =
      error instanceof Error ? error.message : 'Something went wrong. Please try again.';
    return apiError(message, 500, 'internal_error');
  }
}

/**
 * Verify the caller may act on a customer's data. Admins may act on anyone's;
 * customers only on their own.
 */
export async function assertCustomerAccess(
  actor: ApiActor,
  customerId: string,
): Promise<void> {
  if (actor.profile.role === 'admin') return;

  const supabase = await createServerSupabase();
  if (!supabase) throw new ApiError('Supabase is not configured.', 503, 'not_configured');

  const { data } = await supabase
    .from('customers')
    .select('id')
    .eq('id', customerId)
    .eq('profile_id', actor.userId)
    .maybeSingle();

  if (!data) throw new ApiError('Not found.', 404, 'not_found');
}
