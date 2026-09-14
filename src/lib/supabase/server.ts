import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

import { env, isServiceRoleConfigured, isSupabaseConfigured } from '@/lib/env';
import type { Database } from '@/types/database';

export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Request-scoped Supabase client that carries the signed-in user's session.
 * All reads through this client are subject to Row Level Security.
 */
export async function createServerSupabase(): Promise<TypedSupabaseClient | null> {
  if (!isSupabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — the middleware refreshes the
          // session cookie instead, so this is safe to ignore.
        }
      },
    },
  });
}

/**
 * Service-role client. Bypasses RLS, so it is only ever used from trusted
 * server code: Stripe webhooks, public form submissions that must write to a
 * customer's rows, and admin operations that have already been authorised.
 *
 * Never import this into a Client Component.
 */
export function createAdminSupabase(): TypedSupabaseClient | null {
  if (!isServiceRoleConfigured()) return null;

  return createSupabaseClient<Database>(env.supabaseUrl!, env.supabaseServiceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Service-role client that throws when unavailable — for routes that require it. */
export function requireAdminSupabase(): TypedSupabaseClient {
  const client = createAdminSupabase();
  if (!client) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. This operation requires server-side database access.',
    );
  }
  return client;
}
