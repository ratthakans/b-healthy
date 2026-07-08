-- ============================================================
-- B-Healthy — Supabase setup for website form submissions
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

create table if not exists public.submissions (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  type        text,          -- 'register' | 'booking' | 'contact'
  name        text,
  company     text,
  phone       text,
  email       text,
  subject     text,
  package     text,
  pax         int,
  pref_date   date,
  message     text,
  payload     jsonb          -- full raw form data
);

-- Row Level Security: allow the public site to INSERT only (no read/update/delete)
alter table public.submissions enable row level security;

drop policy if exists "public can insert submissions" on public.submissions;
create policy "public can insert submissions"
  on public.submissions
  for insert
  to anon
  with check (true);

-- Note: reading submissions stays restricted. View them in the Supabase
-- Table Editor, or add a policy for authenticated staff later.
