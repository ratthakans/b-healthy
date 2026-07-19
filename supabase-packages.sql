-- ============================================================
-- B-Healthy — Supabase setup for PACKAGE MANAGEMENT (back-office)
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- Account-agnostic: works in any Supabase project. After running,
-- paste the project's URL + anon key into js/config.js.
-- ============================================================

create table if not exists public.packages (
  id          text primary key,                       -- slug, e.g. 'amphawa'
  type        text not null default 'retreat'
                check (type in ('retreat','workshop','membership')),
  status      text not null default 'draft'
                check (status in ('published','draft')),
  sort        int  not null default 0,                -- display order (low = first)
  name        text,                                   -- shown in the admin list
  data        jsonb not null default '{}'::jsonb,     -- full package object (TH base)
  en          jsonb not null default '{}'::jsonb,     -- English overrides
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists packages_type_sort_idx on public.packages (type, sort);

-- keep updated_at fresh on every edit
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists packages_set_updated_at on public.packages;
create trigger packages_set_updated_at
  before update on public.packages
  for each row execute function public.set_updated_at();

-- ---- Row Level Security ----
alter table public.packages enable row level security;

-- Public website: can read ONLY published packages
drop policy if exists "public read published packages" on public.packages;
create policy "public read published packages" on public.packages
  for select to anon using (status = 'published');

-- Logged-in staff: can read everything (incl. drafts)
drop policy if exists "staff read all packages" on public.packages;
create policy "staff read all packages" on public.packages
  for select to authenticated using (true);

-- Logged-in staff: full write access
drop policy if exists "staff insert packages" on public.packages;
create policy "staff insert packages" on public.packages
  for insert to authenticated with check (true);

drop policy if exists "staff update packages" on public.packages;
create policy "staff update packages" on public.packages
  for update to authenticated using (true) with check (true);

drop policy if exists "staff delete packages" on public.packages;
create policy "staff delete packages" on public.packages
  for delete to authenticated using (true);

-- ============================================================
-- Create a staff login (so someone can sign in to /admin.html):
--   Supabase Dashboard → Authentication → Users → Add user
--   (enter email + password, tick "Auto Confirm User").
-- Then open  <your-site>/admin.html  and sign in.
--
-- Seeding: you don't need to write INSERTs by hand — open
-- /admin.html, sign in, and click "Import current packages"
-- to load everything currently on the site into this table.
-- ============================================================
