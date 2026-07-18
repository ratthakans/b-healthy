-- ============================================================
-- B-Healthy — Supabase Storage for package image uploads
-- Run once in: Supabase → SQL Editor → New query → Run
-- Creates a public bucket "package-images" and lets logged-in
-- staff upload/replace/delete, while the public can only read.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('package-images', 'package-images', true)
on conflict (id) do nothing;

-- Public can read images (the bucket is public)
drop policy if exists "public read package images" on storage.objects;
create policy "public read package images" on storage.objects
  for select to anon using (bucket_id = 'package-images');

-- Logged-in staff can upload / replace / delete
drop policy if exists "staff upload package images" on storage.objects;
create policy "staff upload package images" on storage.objects
  for insert to authenticated with check (bucket_id = 'package-images');

drop policy if exists "staff update package images" on storage.objects;
create policy "staff update package images" on storage.objects
  for update to authenticated using (bucket_id = 'package-images');

drop policy if exists "staff delete package images" on storage.objects;
create policy "staff delete package images" on storage.objects
  for delete to authenticated using (bucket_id = 'package-images');
