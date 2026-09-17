-- =====================================================================
-- CymruSites — agency model
--
-- Product change: customers no longer edit their own website content
-- directly. Onboarding is a one-time brief the agency builds from; every
-- ongoing change goes through a support ticket or a content change
-- request, both reviewed by an admin. This migration removes the direct
-- write access to `businesses` that self-service editing depended on —
-- the application's onboarding and admin routes now write through the
-- service role instead, so no customer-facing write policy is needed
-- here any more.
--
-- Safe to run once, after the initial schema. Uses `drop policy if
-- exists` so it can also be re-run harmlessly.
-- =====================================================================

drop policy if exists "businesses: write own" on public.businesses;
drop policy if exists "businesses: update own" on public.businesses;

-- Customers can still see their own business record (it appears read-only
-- on their dashboard); only an admin, or the server acting on the
-- customer's behalf during onboarding, can write to it.
create policy "businesses: admin write" on public.businesses
  for insert with check (public.is_admin());

create policy "businesses: admin update" on public.businesses
  for update using (public.is_admin())
  with check (public.is_admin());

-- Same reasoning for `websites` itself: no remaining application code path
-- writes to it via a customer's own session (approving a preview and
-- requesting changes both now go through the service role, having already
-- verified ownership in the API route). Admins retain full access via the
-- existing "websites: admin manage" policy.
drop policy if exists "websites: customer update own" on public.websites;
