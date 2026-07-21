-- ============================================================
-- B-Healthy — SECURITY HARDENING (run after the other SQL files)
--
-- WHY: the current policies grant access to ANY logged-in user
-- ("to authenticated using (true)"). Supabase e-mail sign-up is
-- open by default, so anyone could register an account and then
-- read every customer lead and edit every package.
--
-- This locks everything to an explicit staff allow-list.
-- Run in: Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Allow-list table -----------------------------------------------------
create table if not exists public.staff (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);
alter table public.staff enable row level security;
-- (no policies = nobody can read/write it from the browser; manage it here in SQL)

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

-- 2) >>> ADD YOUR STAFF ACCOUNT HERE <<< ----------------------------------
--     Change the e-mail to the one you created in Authentication → Users.
insert into public.staff (user_id, email)
select id, email from auth.users where email = 'CHANGE-ME@example.com'
on conflict (user_id) do nothing;

-- 3) Packages: staff only -------------------------------------------------
drop policy if exists "staff read all packages" on public.packages;
create policy "staff read all packages" on public.packages
  for select to authenticated using (public.is_staff());

drop policy if exists "staff insert packages" on public.packages;
create policy "staff insert packages" on public.packages
  for insert to authenticated with check (public.is_staff());

drop policy if exists "staff update packages" on public.packages;
create policy "staff update packages" on public.packages
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "staff delete packages" on public.packages;
create policy "staff delete packages" on public.packages
  for delete to authenticated using (public.is_staff());

-- 4) Customer leads: staff only ------------------------------------------
--    (run supabase-submissions.sql first, or this block will error)
drop policy if exists "staff read submissions" on public.submissions;
create policy "staff read submissions" on public.submissions
  for select to authenticated using (public.is_staff());

drop policy if exists "staff update submissions" on public.submissions;
create policy "staff update submissions" on public.submissions
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "staff delete submissions" on public.submissions;
create policy "staff delete submissions" on public.submissions
  for delete to authenticated using (public.is_staff());

-- 5) Image uploads: staff only -------------------------------------------
drop policy if exists "staff upload package images" on storage.objects;
create policy "staff upload package images" on storage.objects
  for insert to authenticated with check (bucket_id = 'package-images' and public.is_staff());

drop policy if exists "staff update package images" on storage.objects;
create policy "staff update package images" on storage.objects
  for update to authenticated using (bucket_id = 'package-images' and public.is_staff());

drop policy if exists "staff delete package images" on storage.objects;
create policy "staff delete package images" on storage.objects
  for delete to authenticated using (bucket_id = 'package-images' and public.is_staff());

-- ============================================================
-- ALSO DO THIS IN THE DASHBOARD (defence in depth):
--   Authentication → Sign In / Providers → Email → turn OFF "Allow new users to sign up"
-- Then new staff are added by you in Authentication → Users,
-- plus one INSERT into public.staff (step 2 above).
-- ============================================================
