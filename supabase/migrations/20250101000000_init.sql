-- =====================================================================
-- CymruSites — core schema
-- Professional websites for Welsh businesses.
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type user_role as enum ('customer', 'admin');

create type customer_status as enum ('active', 'suspended', 'cancelled');

create type website_status as enum (
  'lead',
  'purchased',
  'awaiting_information',
  'in_production',
  'awaiting_customer_approval',
  'changes_requested',
  'approved',
  'domain_setup',
  'live',
  'suspended',
  'cancelled'
);

create type site_locale as enum ('en', 'cy');
create type site_language_mode as enum ('en', 'cy', 'bilingual');

create type subscription_status as enum (
  'incomplete', 'incomplete_expired', 'trialing', 'active',
  'past_due', 'canceled', 'unpaid', 'paused'
);

create type order_status as enum ('pending', 'paid', 'failed', 'refunded', 'cancelled');
create type order_kind as enum ('setup', 'subscription', 'one_off');
create type payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');

create type domain_status as enum ('pending', 'connected', 'verified', 'live', 'failed');
create type dns_status as enum ('pending', 'propagating', 'verified', 'failed');
create type ssl_status as enum ('pending', 'issuing', 'active', 'failed');
create type domain_kind as enum ('custom', 'subdomain');

create type lead_status as enum ('new', 'contacted', 'qualified', 'won', 'lost');

create type ticket_status as enum ('open', 'in_progress', 'waiting_for_customer', 'resolved');
create type ticket_priority as enum ('low', 'normal', 'high', 'urgent');
create type ticket_category as enum (
  'website_changes', 'technical', 'billing', 'domain_email', 'new_feature', 'other'
);

create type media_kind as enum ('logo', 'photo', 'gallery', 'attachment', 'template_preview');

create type change_request_status as enum ('pending', 'approved', 'rejected', 'applied');

create type onboarding_status as enum ('draft', 'submitted');

create type analytics_event_type as enum ('pageview', 'session_start', 'enquiry');

create type notification_type as enum (
  'account', 'order', 'website', 'billing', 'support', 'lead', 'domain', 'system'
);

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null,
  full_name text,
  phone text,
  avatar_url text,
  role user_role not null default 'customer',
  is_demo boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_role_idx on public.profiles (role);
create index profiles_email_idx on public.profiles (email);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Role lookup used by RLS. SECURITY DEFINER so policies can read the role
-- without recursing through profiles' own RLS policies.
create or replace function public.current_role_name()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------
-- plans
-- ---------------------------------------------------------------------
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  setup_price_pence integer not null default 0 check (setup_price_pence >= 0),
  monthly_price_pence integer not null default 0 check (monthly_price_pence >= 0),
  currency text not null default 'gbp',
  max_pages integer not null default 3 check (max_pages > 0),
  features jsonb not null default '[]'::jsonb,
  stripe_setup_price_id text,
  stripe_monthly_price_id text,
  stripe_product_id text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index plans_active_idx on public.plans (is_active, sort_order);
create trigger plans_updated_at before update on public.plans
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- customers (the billing account / company record)
-- ---------------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  business_name text not null,
  contact_name text,
  email citext not null,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  county text,
  postcode text,
  status customer_status not null default 'active',
  stripe_customer_id text unique,
  plan_id uuid references public.plans(id) on delete set null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customers_profile_idx on public.customers (profile_id);
create index customers_status_idx on public.customers (status);
create index customers_demo_idx on public.customers (is_demo);
create index customers_created_idx on public.customers (created_at desc);
create trigger customers_updated_at before update on public.customers
  for each row execute function public.set_updated_at();

-- Ownership helper for RLS.
create or replace function public.owns_customer(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.customers c
    where c.id = target and c.profile_id = auth.uid()
  );
$$;

create or replace function public.my_customer_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.customers where profile_id = auth.uid() limit 1;
$$;

-- ---------------------------------------------------------------------
-- businesses (the trading details rendered onto the website)
-- ---------------------------------------------------------------------
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  name text not null,
  industry text not null default 'other',
  tagline text,
  description text,
  phone text,
  email citext,
  whatsapp_number text,
  address_line1 text,
  address_line2 text,
  city text,
  county text,
  postcode text,
  google_maps_url text,
  google_business_profile_url text,
  companies_house_number text,
  vat_number text,
  services jsonb not null default '[]'::jsonb,
  service_areas jsonb not null default '[]'::jsonb,
  opening_hours jsonb not null default '[]'::jsonb,
  social_links jsonb not null default '{}'::jsonb,
  brand_colors jsonb not null default '{}'::jsonb,
  logo_url text,
  accreditations jsonb not null default '[]'::jsonb,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index businesses_customer_idx on public.businesses (customer_id);
create index businesses_industry_idx on public.businesses (industry);
create trigger businesses_updated_at before update on public.businesses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- website_templates
-- ---------------------------------------------------------------------
create table public.website_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  best_for text,
  preview_image_url text,
  style_tokens jsonb not null default '{}'::jsonb,
  supported_sections jsonb not null default '[]'::jsonb,
  default_sections jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger website_templates_updated_at before update on public.website_templates
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- websites
-- ---------------------------------------------------------------------
create table public.websites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  template_id uuid references public.website_templates(id) on delete set null,
  plan_id uuid references public.plans(id) on delete set null,
  name text not null,
  slug text not null unique,
  subdomain text unique,
  status website_status not null default 'lead',
  language_mode site_language_mode not null default 'en',
  default_locale site_locale not null default 'en',
  theme jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  preview_token text not null default encode(gen_random_bytes(16), 'hex'),
  primary_domain text,
  requested_pages jsonb not null default '[]'::jsonb,
  launch_notes text,
  published_at timestamptz,
  last_updated_by uuid references public.profiles(id) on delete set null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index websites_customer_idx on public.websites (customer_id);
create index websites_status_idx on public.websites (status);
create index websites_slug_idx on public.websites (slug);
create index websites_subdomain_idx on public.websites (subdomain);
create index websites_demo_idx on public.websites (is_demo);
create trigger websites_updated_at before update on public.websites
  for each row execute function public.set_updated_at();

create or replace function public.owns_website(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.websites w
    join public.customers c on c.id = w.customer_id
    where w.id = target and c.profile_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------
-- website_status_history
-- ---------------------------------------------------------------------
create table public.website_status_history (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  from_status website_status,
  to_status website_status not null,
  note text,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index website_status_history_website_idx
  on public.website_status_history (website_id, created_at desc);

-- Record every status transition automatically.
create or replace function public.log_website_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.website_status_history (website_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, auth.uid());
  elsif new.status is distinct from old.status then
    insert into public.website_status_history (website_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger websites_status_history
  after insert or update of status on public.websites
  for each row execute function public.log_website_status_change();

-- ---------------------------------------------------------------------
-- website_pages
-- ---------------------------------------------------------------------
create table public.website_pages (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  slug text not null,
  page_type text not null default 'custom',
  title text not null,
  nav_label text,
  show_in_nav boolean not null default true,
  show_in_footer boolean not null default false,
  is_published boolean not null default true,
  is_home boolean not null default false,
  sort_order integer not null default 0,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (website_id, slug)
);
create index website_pages_website_idx on public.website_pages (website_id, sort_order);
create trigger website_pages_updated_at before update on public.website_pages
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- website_content (section instances, one row per locale)
-- ---------------------------------------------------------------------
create table public.website_content (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  page_id uuid references public.website_pages(id) on delete cascade,
  section_key text not null,
  section_type text not null,
  locale site_locale not null default 'en',
  data jsonb not null default '{}'::jsonb,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (website_id, page_id, section_key, locale)
);
create index website_content_website_idx on public.website_content (website_id, locale);
create index website_content_page_idx on public.website_content (page_id, sort_order);
create trigger website_content_updated_at before update on public.website_content
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- content_change_requests (customer edits enter an approval queue)
-- ---------------------------------------------------------------------
create table public.content_change_requests (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  submitted_by uuid references public.profiles(id) on delete set null,
  target_table text not null,
  target_id uuid,
  summary text not null,
  changes jsonb not null default '{}'::jsonb,
  status change_request_status not null default 'pending',
  admin_notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ccr_website_idx on public.content_change_requests (website_id, status);
create index ccr_status_idx on public.content_change_requests (status, created_at desc);
create trigger ccr_updated_at before update on public.content_change_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- media
-- ---------------------------------------------------------------------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  website_id uuid references public.websites(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  bucket text not null default 'media',
  storage_path text not null,
  public_url text,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  width integer,
  height integer,
  kind media_kind not null default 'photo',
  alt_text text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index media_customer_idx on public.media (customer_id, created_at desc);
create index media_website_idx on public.media (website_id);
create trigger media_updated_at before update on public.media
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- domains
-- ---------------------------------------------------------------------
create table public.domains (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  website_id uuid references public.websites(id) on delete set null,
  domain citext not null unique,
  kind domain_kind not null default 'custom',
  status domain_status not null default 'pending',
  dns_status dns_status not null default 'pending',
  ssl_status ssl_status not null default 'pending',
  is_primary boolean not null default true,
  registrar text,
  verification_token text not null default encode(gen_random_bytes(12), 'hex'),
  notes text,
  verified_at timestamptz,
  live_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index domains_customer_idx on public.domains (customer_id);
create index domains_website_idx on public.domains (website_id);
create index domains_status_idx on public.domains (status);
create trigger domains_updated_at before update on public.domains
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- subscriptions / orders / payments
-- ---------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  stripe_price_id text,
  status subscription_status not null default 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  trial_end timestamptz,
  amount_pence integer not null default 0,
  currency text not null default 'gbp',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_customer_idx on public.subscriptions (customer_id);
create index subscriptions_status_idx on public.subscriptions (status);
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  website_id uuid references public.websites(id) on delete set null,
  kind order_kind not null default 'setup',
  reference text not null unique default ('CYM-' || upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 8))),
  status order_status not null default 'pending',
  amount_pence integer not null default 0,
  currency text not null default 'gbp',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  metadata jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_customer_idx on public.orders (customer_id, created_at desc);
create index orders_status_idx on public.orders (status);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  stripe_payment_intent_id text,
  stripe_invoice_id text,
  stripe_charge_id text,
  invoice_number text,
  invoice_url text,
  receipt_url text,
  description text,
  amount_pence integer not null default 0,
  currency text not null default 'gbp',
  status payment_status not null default 'pending',
  failure_reason text,
  paid_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index payments_invoice_unique
  on public.payments (stripe_invoice_id) where stripe_invoice_id is not null;
create unique index payments_intent_unique
  on public.payments (stripe_payment_intent_id) where stripe_payment_intent_id is not null;
create index payments_customer_idx on public.payments (customer_id, created_at desc);
create index payments_status_idx on public.payments (status, paid_at desc);
create trigger payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

-- Idempotency ledger for Stripe webhook deliveries.
create table public.stripe_events (
  id text primary key,
  type text not null,
  payload jsonb,
  processed_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- onboarding_submissions
-- ---------------------------------------------------------------------
create table public.onboarding_submissions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  website_id uuid references public.websites(id) on delete set null,
  plan_id uuid references public.plans(id) on delete set null,
  status onboarding_status not null default 'draft',
  current_step integer not null default 1,
  data jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index onboarding_customer_idx on public.onboarding_submissions (customer_id);
create index onboarding_status_idx on public.onboarding_submissions (status);
create trigger onboarding_updated_at before update on public.onboarding_submissions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- leads (enquiries captured by customer websites)
-- ---------------------------------------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  website_id uuid references public.websites(id) on delete set null,
  name text not null,
  email citext,
  phone text,
  message text,
  service text,
  source text not null default 'website_contact_form',
  page_url text,
  status lead_status not null default 'new',
  notes text,
  contacted_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index leads_customer_idx on public.leads (customer_id, created_at desc);
create index leads_website_idx on public.leads (website_id);
create index leads_status_idx on public.leads (status);
create trigger leads_updated_at before update on public.leads
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- contact_submissions (enquiries to CymruSites itself)
-- ---------------------------------------------------------------------
create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_name text,
  email citext not null,
  phone text,
  business_type text,
  current_website text,
  requirement text,
  budget text,
  message text,
  source text default 'contact_page',
  status lead_status not null default 'new',
  handled_by uuid references public.profiles(id) on delete set null,
  notes text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index contact_submissions_status_idx on public.contact_submissions (status, created_at desc);
create trigger contact_submissions_updated_at before update on public.contact_submissions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- support
-- ---------------------------------------------------------------------
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  website_id uuid references public.websites(id) on delete set null,
  reference text not null unique default ('TKT-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6))),
  subject text not null,
  category ticket_category not null default 'other',
  status ticket_status not null default 'open',
  priority ticket_priority not null default 'normal',
  created_by uuid references public.profiles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  last_message_at timestamptz not null default now(),
  resolved_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index support_tickets_customer_idx on public.support_tickets (customer_id, created_at desc);
create index support_tickets_status_idx on public.support_tickets (status, last_message_at desc);
create trigger support_tickets_updated_at before update on public.support_tickets
  for each row execute function public.set_updated_at();

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_role user_role not null default 'customer',
  author_name text,
  body text not null,
  is_internal boolean not null default false,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index support_messages_ticket_idx on public.support_messages (ticket_id, created_at);

create or replace function public.owns_ticket(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.support_tickets t
    join public.customers c on c.id = t.customer_id
    where t.id = target and c.profile_id = auth.uid()
  );
$$;

-- Keep ticket activity timestamps accurate.
create or replace function public.touch_ticket_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.support_tickets
  set last_message_at = new.created_at,
      updated_at = now()
  where id = new.ticket_id;
  return new;
end;
$$;

create trigger support_messages_touch_ticket
  after insert on public.support_messages
  for each row execute function public.touch_ticket_on_message();

-- ---------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type notification_type not null default 'system',
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_profile_idx on public.notifications (profile_id, created_at desc);
create index notifications_unread_idx on public.notifications (profile_id) where read_at is null;

-- ---------------------------------------------------------------------
-- admin_notes
-- ---------------------------------------------------------------------
create table public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  website_id uuid references public.websites(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text,
  body text not null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index admin_notes_customer_idx on public.admin_notes (customer_id, created_at desc);

-- ---------------------------------------------------------------------
-- analytics
-- ---------------------------------------------------------------------
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  event_type analytics_event_type not null default 'pageview',
  path text not null default '/',
  page_title text,
  referrer text,
  source text not null default 'direct',
  session_id text,
  device text,
  country text,
  locale site_locale,
  is_demo boolean not null default false,
  occurred_at timestamptz not null default now()
);
create index analytics_events_website_idx on public.analytics_events (website_id, occurred_at desc);
create index analytics_events_type_idx on public.analytics_events (website_id, event_type, occurred_at desc);

-- Daily rollup used by dashboards (cheap reads, seedable history).
create table public.analytics_daily (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  date date not null,
  pageviews integer not null default 0,
  sessions integer not null default 0,
  enquiries integer not null default 0,
  top_pages jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (website_id, date)
);
create index analytics_daily_website_idx on public.analytics_daily (website_id, date desc);
create trigger analytics_daily_updated_at before update on public.analytics_daily
  for each row execute function public.set_updated_at();

-- Roll an event window into analytics_daily. Safe to run repeatedly.
create or replace function public.rollup_analytics_daily(target_date date default current_date)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.analytics_daily (website_id, date, pageviews, sessions, enquiries, top_pages, sources, is_demo)
  select
    e.website_id,
    target_date,
    count(*) filter (where e.event_type = 'pageview'),
    count(distinct e.session_id) filter (where e.session_id is not null),
    count(*) filter (where e.event_type = 'enquiry'),
    coalesce((
      select jsonb_agg(t) from (
        select p.path, count(*) as views
        from public.analytics_events p
        where p.website_id = e.website_id
          and p.occurred_at::date = target_date
          and p.event_type = 'pageview'
        group by p.path order by count(*) desc limit 10
      ) t
    ), '[]'::jsonb),
    coalesce((
      select jsonb_agg(s) from (
        select p.source, count(*) as visits
        from public.analytics_events p
        where p.website_id = e.website_id
          and p.occurred_at::date = target_date
        group by p.source order by count(*) desc limit 10
      ) s
    ), '[]'::jsonb),
    bool_or(e.is_demo)
  from public.analytics_events e
  where e.occurred_at::date = target_date
  group by e.website_id
  on conflict (website_id, date) do update
    set pageviews = excluded.pageviews,
        sessions = excluded.sessions,
        enquiries = excluded.enquiries,
        top_pages = excluded.top_pages,
        sources = excluded.sources,
        updated_at = now();
$$;

-- ---------------------------------------------------------------------
-- settings (admin-editable site content & configuration)
-- ---------------------------------------------------------------------
create table public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  group_name text not null default 'general',
  label text,
  description text,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index settings_group_idx on public.settings (group_name);
create trigger settings_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- New auth users automatically get a profile.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_domains text[];
  assigned_role user_role := 'customer';
begin
  select coalesce(
    (select array(select jsonb_array_elements_text(value) from public.settings where key = 'admin_email_allowlist')),
    array[]::text[]
  ) into admin_domains;

  if new.email is not null and new.email = any(admin_domains) then
    assigned_role := 'admin';
  end if;

  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    assigned_role
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
