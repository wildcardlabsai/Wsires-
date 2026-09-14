'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import { env, isSupabaseConfigured } from '@/lib/env';
import type { Database } from '@/types/database';

export type TypedSupabaseClient = SupabaseClient<Database>;

let browserClient: TypedSupabaseClient | null = null;

/**
 * Browser Supabase client (singleton). Throws a readable error rather than a
 * cryptic one when the project has not been connected yet.
 */
export function createClient(): TypedSupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.',
    );
  }
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(env.supabaseUrl!, env.supabaseAnonKey!);
  }
  return browserClient;
}
