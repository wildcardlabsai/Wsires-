/**
 * Removes every row this project's demo seed created — anything flagged
 * `is_demo = true`, plus the demo Supabase auth users themselves. Leaves
 * real customer data completely untouched.
 *
 * Usage: npm run seed:remove
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. Add them to .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

/* Children before parents, respecting foreign keys. */
const TABLES_WITH_DEMO_FLAG = [
  'analytics_daily',
  'analytics_events',
  'support_messages',
  'support_tickets',
  'admin_notes',
  'notifications',
  'leads',
  'domains',
  'content_change_requests',
  'website_content',
  'website_pages',
  'website_status_history',
  'onboarding_submissions',
  'payments',
  'orders',
  'subscriptions',
  'media',
  'websites',
  'businesses',
  'customers',
];

async function main() {
  console.log('Removing CymruSites demo data…\n');

  /* support_messages has no is_demo column of its own — clear via its parent tickets. */
  const { data: demoTickets } = await supabase.from('support_tickets').select('id').eq('is_demo', true);
  if (demoTickets && demoTickets.length > 0) {
    await supabase.from('support_messages').delete().in('ticket_id', demoTickets.map((t) => t.id));
  }

  for (const table of TABLES_WITH_DEMO_FLAG) {
    if (table === 'support_messages') continue;
    const { error, count } = await supabase.from(table).delete({ count: 'exact' }).eq('is_demo', true);
    if (error) {
      console.error(`  ${table}: ${error.message}`);
    } else {
      console.log(`  ${table}: removed ${count ?? 0} row(s)`);
    }
  }

  console.log('\nRemoving demo auth users…');
  const { data: profiles } = await supabase.from('profiles').select('id').eq('is_demo', true);
  const { data: usersPage } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const demoEmails = new Set((usersPage?.users ?? []).filter((u) => u.user_metadata?.is_demo).map((u) => u.id));
  const idsToDelete = new Set([...(profiles ?? []).map((p) => p.id), ...demoEmails]);

  let removedUsers = 0;
  for (const id of idsToDelete) {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (!error) removedUsers += 1;
  }
  console.log(`  Removed ${removedUsers} demo auth user(s)`);

  console.log('\nDone. All demo data has been removed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
