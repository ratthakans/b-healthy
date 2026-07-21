-- ============================================================
-- B-Healthy — Customer leads (form submissions)
-- Run once in: Supabase → SQL Editor → New query → Run
-- Stores every booking / contact form submission and lets staff
-- manage them in /admin.html → Customers tab.
-- Safe to re-run.
-- ============================================================

create table if not exists public.submissions (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  type        text,          -- 'booking' | 'contact' | 'register'
  name        text,
  company     text,
  phone       text,
  email       text,
  subject     text,
  package     text,
  pax         int,
  pref_date   date,
  message     text,
  payload     jsonb,         -- full raw form data
  status      text not null default 'new'
);

-- if the table already existed from the older setup, add the status column
alter table public.submissions add column if not exists status text not null default 'new';

alter table public.submissions drop constraint if exists submissions_status_check;
alter table public.submissions add constraint submissions_status_check
  check (status in ('new','contacted','won','lost'));

create index if not exists submissions_created_idx on public.submissions (created_at desc);

-- ---- Row Level Security ----
alter table public.submissions enable row level security;

-- The public website can ONLY insert (never read other people's leads)
drop policy if exists "public can insert submissions" on public.submissions;
create policy "public can insert submissions" on public.submissions
  for insert to anon with check (true);

-- Logged-in staff can read and manage them
drop policy if exists "staff read submissions" on public.submissions;
create policy "staff read submissions" on public.submissions
  for select to authenticated using (true);

drop policy if exists "staff update submissions" on public.submissions;
create policy "staff update submissions" on public.submissions
  for update to authenticated using (true) with check (true);

drop policy if exists "staff delete submissions" on public.submissions;
create policy "staff delete submissions" on public.submissions
  for delete to authenticated using (true);
