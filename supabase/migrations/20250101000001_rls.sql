-- =====================================================================
-- CymruSites — Row Level Security
--
-- Rules of the house:
--   * every table has RLS enabled; nothing is readable by default
--   * customers may only ever touch rows belonging to their own customer row
--   * admins (profiles.role = 'admin') may read/write everything
--   * anonymous visitors may read only what a public website must render
--   * writes that create money or change state are done with the service
--     role from server code, never from the browser
-- =====================================================================

alter table public.profiles                enable row level security;
alter table public.plans                   enable row level security;
alter table public.customers               enable row level security;
alter table public.businesses              enable row level security;
alter table public.website_templates       enable row level security;
alter table public.websites                enable row level security;
alter table public.website_status_history  enable row level security;
alter table public.website_pages           enable row level security;
alter table public.website_content         enable row level security;
alter table public.content_change_requests enable row level security;
alter table public.media                   enable row level security;
alter table public.domains                 enable row level security;
alter table public.subscriptions           enable row level security;
alter table public.orders                  enable row level security;
alter table public.payments                enable row level security;
alter table public.stripe_events           enable row level security;
alter table public.onboarding_submissions  enable row level security;
alter table public.leads                   enable row level security;
alter table public.contact_submissions     enable row level security;
alter table public.support_tickets         enable row level security;
alter table public.support_messages        enable row level security;
alter table public.notifications           enable row level security;
alter table public.admin_notes             enable row level security;
alter table public.analytics_events        enable row level security;
alter table public.analytics_daily         enable row level security;
alter table public.settings                enable row level security;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create policy "profiles: read own" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles: admin manage" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- A customer must never be able to promote themselves to admin.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ---------------------------------------------------------------------
-- plans — public pricing, admin managed
-- ---------------------------------------------------------------------
create policy "plans: public read active" on public.plans
  for select using (is_active or public.is_admin());

create policy "plans: admin manage" on public.plans
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------
create policy "customers: read own" on public.customers
  for select using (profile_id = auth.uid() or public.is_admin());

create policy "customers: insert own" on public.customers
  for insert with check (profile_id = auth.uid() or public.is_admin());

create policy "customers: update own" on public.customers
  for update using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

create policy "customers: admin delete" on public.customers
  for delete using (public.is_admin());

-- Customers must not be able to change their own billing linkage or status.
create or replace function public.protect_customer_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.status := old.status;
    new.stripe_customer_id := old.stripe_customer_id;
    new.plan_id := old.plan_id;
    new.is_demo := old.is_demo;
  end if;
  return new;
end;
$$;

create trigger customers_protect_fields
  before update on public.customers
  for each row execute function public.protect_customer_fields();

-- ---------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------
create policy "businesses: read own" on public.businesses
  for select using (public.owns_customer(customer_id) or public.is_admin());

create policy "businesses: write own" on public.businesses
  for insert with check (public.owns_customer(customer_id) or public.is_admin());

create policy "businesses: update own" on public.businesses
  for update using (public.owns_customer(customer_id) or public.is_admin())
  with check (public.owns_customer(customer_id) or public.is_admin());

create policy "businesses: admin delete" on public.businesses
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------
-- website_templates — public read (used by the onboarding picker)
-- ---------------------------------------------------------------------
create policy "templates: public read" on public.website_templates
  for select using (is_active or public.is_admin());

create policy "templates: admin manage" on public.website_templates
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- websites
--
-- Anonymous read is required so a published customer website can render
-- for the public. Only live sites are exposed; everything else needs the
-- owning customer or an admin.
-- ---------------------------------------------------------------------
create policy "websites: public read live" on public.websites
  for select using (
    status = 'live'
    or public.owns_customer(customer_id)
    or public.is_admin()
  );

create policy "websites: admin manage" on public.websites
  for all using (public.is_admin()) with check (public.is_admin());

-- Customers may adjust presentation-level fields on their own site, but
-- status, plan and slug changes belong to admin/server code only.
create policy "websites: customer update own" on public.websites
  for update using (public.owns_customer(customer_id))
  with check (public.owns_customer(customer_id));

create or replace function public.protect_website_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.status := old.status;
    new.slug := old.slug;
    new.subdomain := old.subdomain;
    new.plan_id := old.plan_id;
    new.customer_id := old.customer_id;
    new.primary_domain := old.primary_domain;
    new.published_at := old.published_at;
    new.is_demo := old.is_demo;
  end if;
  return new;
end;
$$;

create trigger websites_protect_fields
  before update on public.websites
  for each row execute function public.protect_website_fields();

-- ---------------------------------------------------------------------
-- website_status_history
-- ---------------------------------------------------------------------
create policy "status history: read own" on public.website_status_history
  for select using (public.owns_website(website_id) or public.is_admin());

create policy "status history: admin manage" on public.website_status_history
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- website_pages / website_content — public read for live sites
-- ---------------------------------------------------------------------
create policy "pages: read" on public.website_pages
  for select using (
    exists (
      select 1 from public.websites w
      where w.id = website_pages.website_id
        and (w.status = 'live' or public.owns_customer(w.customer_id) or public.is_admin())
    )
  );

create policy "pages: admin manage" on public.website_pages
  for all using (public.is_admin()) with check (public.is_admin());

create policy "content: read" on public.website_content
  for select using (
    exists (
      select 1 from public.websites w
      where w.id = website_content.website_id
        and (w.status = 'live' or public.owns_customer(w.customer_id) or public.is_admin())
    )
  );

create policy "content: admin manage" on public.website_content
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- content_change_requests — the customer edit approval queue
-- ---------------------------------------------------------------------
create policy "change requests: read own" on public.content_change_requests
  for select using (public.owns_customer(customer_id) or public.is_admin());

create policy "change requests: create own" on public.content_change_requests
  for insert with check (
    (public.owns_customer(customer_id) and status = 'pending') or public.is_admin()
  );

create policy "change requests: admin manage" on public.content_change_requests
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- media
-- ---------------------------------------------------------------------
create policy "media: read own" on public.media
  for select using (
    public.owns_customer(customer_id)
    or public.is_admin()
    or exists (
      select 1 from public.websites w
      where w.id = media.website_id and w.status = 'live'
    )
  );

create policy "media: insert own" on public.media
  for insert with check (public.owns_customer(customer_id) or public.is_admin());

create policy "media: update own" on public.media
  for update using (public.owns_customer(customer_id) or public.is_admin())
  with check (public.owns_customer(customer_id) or public.is_admin());

create policy "media: delete own" on public.media
  for delete using (public.owns_customer(customer_id) or public.is_admin());

-- ---------------------------------------------------------------------
-- domains
-- ---------------------------------------------------------------------
create policy "domains: read own" on public.domains
  for select using (public.owns_customer(customer_id) or public.is_admin());

create policy "domains: admin manage" on public.domains
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- money: read-only for customers, written by server/webhooks
-- ---------------------------------------------------------------------
create policy "subscriptions: read own" on public.subscriptions
  for select using (public.owns_customer(customer_id) or public.is_admin());

create policy "subscriptions: admin manage" on public.subscriptions
  for all using (public.is_admin()) with check (public.is_admin());

create policy "orders: read own" on public.orders
  for select using (public.owns_customer(customer_id) or public.is_admin());

create policy "orders: admin manage" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

create policy "payments: read own" on public.payments
  for select using (public.owns_customer(customer_id) or public.is_admin());

create policy "payments: admin manage" on public.payments
  for all using (public.is_admin()) with check (public.is_admin());

-- stripe_events is service-role only: no policies granted to anon/authenticated.
create policy "stripe events: admin read" on public.stripe_events
  for select using (public.is_admin());

-- ---------------------------------------------------------------------
-- onboarding
-- ---------------------------------------------------------------------
create policy "onboarding: read own" on public.onboarding_submissions
  for select using (public.owns_customer(customer_id) or public.is_admin());

create policy "onboarding: insert own" on public.onboarding_submissions
  for insert with check (public.owns_customer(customer_id) or public.is_admin());

create policy "onboarding: update own" on public.onboarding_submissions
  for update using (public.owns_customer(customer_id) or public.is_admin())
  with check (public.owns_customer(customer_id) or public.is_admin());

create policy "onboarding: admin delete" on public.onboarding_submissions
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------
-- leads — customers manage their own; inserts arrive via the server
-- ---------------------------------------------------------------------
create policy "leads: read own" on public.leads
  for select using (public.owns_customer(customer_id) or public.is_admin());

create policy "leads: update own" on public.leads
  for update using (public.owns_customer(customer_id) or public.is_admin())
  with check (public.owns_customer(customer_id) or public.is_admin());

create policy "leads: admin manage" on public.leads
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- contact_submissions — admin only (public form posts via service role)
-- ---------------------------------------------------------------------
create policy "contact: admin manage" on public.contact_submissions
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- support
-- ---------------------------------------------------------------------
create policy "tickets: read own" on public.support_tickets
  for select using (public.owns_customer(customer_id) or public.is_admin());

create policy "tickets: create own" on public.support_tickets
  for insert with check (public.owns_customer(customer_id) or public.is_admin());

create policy "tickets: update own" on public.support_tickets
  for update using (public.owns_customer(customer_id) or public.is_admin())
  with check (public.owns_customer(customer_id) or public.is_admin());

create policy "tickets: admin delete" on public.support_tickets
  for delete using (public.is_admin());

-- Internal admin notes on a ticket are never visible to the customer.
create policy "ticket messages: read own" on public.support_messages
  for select using (
    (public.owns_ticket(ticket_id) and is_internal = false) or public.is_admin()
  );

create policy "ticket messages: create own" on public.support_messages
  for insert with check (
    (public.owns_ticket(ticket_id) and is_internal = false and author_id = auth.uid())
    or public.is_admin()
  );

create policy "ticket messages: admin manage" on public.support_messages
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------
create policy "notifications: read own" on public.notifications
  for select using (profile_id = auth.uid() or public.is_admin());

create policy "notifications: update own" on public.notifications
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "notifications: admin manage" on public.notifications
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- admin_notes — never exposed to customers
-- ---------------------------------------------------------------------
create policy "admin notes: admin only" on public.admin_notes
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- analytics — customers read their own; writes go through the server
-- ---------------------------------------------------------------------
create policy "analytics events: read own" on public.analytics_events
  for select using (public.owns_website(website_id) or public.is_admin());

create policy "analytics events: admin manage" on public.analytics_events
  for all using (public.is_admin()) with check (public.is_admin());

create policy "analytics daily: read own" on public.analytics_daily
  for select using (public.owns_website(website_id) or public.is_admin());

create policy "analytics daily: admin manage" on public.analytics_daily
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- settings — public read (the marketing site is rendered from these),
-- admin write.
-- ---------------------------------------------------------------------
create policy "settings: public read" on public.settings
  for select using (group_name <> 'private' or public.is_admin());

create policy "settings: admin manage" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());
