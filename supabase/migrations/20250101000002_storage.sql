-- =====================================================================
-- CymruSites — storage buckets and object policies
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 10485760,
    array['image/png','image/jpeg','image/jpg','image/webp','image/gif','image/svg+xml','image/avif']),
  ('logos', 'logos', true, 5242880,
    array['image/png','image/jpeg','image/jpg','image/webp','image/svg+xml','image/avif']),
  ('attachments', 'attachments', false, 10485760,
    array['image/png','image/jpeg','image/webp','application/pdf','text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Objects are namespaced by customer id: <customer_id>/<website_id>/<file>
-- so the first path segment is the ownership key.
create or replace function public.storage_owner_is_current_customer(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  owner_segment text;
  owner_id uuid;
begin
  owner_segment := split_part(object_name, '/', 1);
  begin
    owner_id := owner_segment::uuid;
  exception when others then
    return false;
  end;
  return public.owns_customer(owner_id);
end;
$$;

-- Public buckets: anyone may read (customer websites render these images).
create policy "media public read" on storage.objects
  for select using (bucket_id in ('media', 'logos'));

create policy "media owner insert" on storage.objects
  for insert to authenticated with check (
    bucket_id in ('media', 'logos')
    and (public.storage_owner_is_current_customer(name) or public.is_admin())
  );

create policy "media owner update" on storage.objects
  for update to authenticated using (
    bucket_id in ('media', 'logos')
    and (public.storage_owner_is_current_customer(name) or public.is_admin())
  );

create policy "media owner delete" on storage.objects
  for delete to authenticated using (
    bucket_id in ('media', 'logos')
    and (public.storage_owner_is_current_customer(name) or public.is_admin())
  );

-- Private bucket: support ticket attachments.
create policy "attachments owner read" on storage.objects
  for select to authenticated using (
    bucket_id = 'attachments'
    and (public.storage_owner_is_current_customer(name) or public.is_admin())
  );

create policy "attachments owner insert" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'attachments'
    and (public.storage_owner_is_current_customer(name) or public.is_admin())
  );

create policy "attachments owner delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'attachments'
    and (public.storage_owner_is_current_customer(name) or public.is_admin())
  );
