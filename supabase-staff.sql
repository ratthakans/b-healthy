-- =============================================================================
-- B-Healthy — who counts as staff
-- RUN THIS FIRST, before supabase-harden-rls.sql.
-- Idempotent: safe to re-run.
--
-- Until now every policy on this project said `to authenticated`, which reads
-- as "staff" but means "anyone holding a login". With sign-up open, those are
-- not the same sentence at all. This file introduces the difference; the
-- harden file then spends it.
--
-- Keeping the table and the function here, on their own, is deliberate: the
-- moment members can sign up, `authenticated` stops being a synonym for staff
-- EVERYWHERE, and every new policy or security-definer function has to be able
-- to ask the question. One definition, one place to look.
-- =============================================================================

create table if not exists public.staff (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

alter table public.staff enable row level security;
-- No policies on purpose. RLS on with nothing granted means neither the
-- publishable key nor a signed-in account can read this list from a browser;
-- it is managed here, in SQL, by someone with the dashboard.

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

-- Callable by anyone logged in, because every policy below has to call it.
-- It leaks nothing: it answers only "is the caller staff", about the caller.
revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated, anon;

-- =============================================================================
-- >>> PUT YOUR STAFF ACCOUNTS HERE <<<
--
-- Use the e-mail of the account you sign in to /admin.html with. Add a line
-- per person. Anyone not on this list is a member of the public, whatever
-- they signed up as.
-- =============================================================================

insert into public.staff (user_id, email)
select u.id, u.email
from auth.users u
where u.email in (
  'CHANGE-ME@example.com'          -- <<< your admin e-mail
  -- , 'second.person@example.com'
)
on conflict (user_id) do nothing;

-- Refuses to leave you with an empty list. supabase-harden-rls.sql checks the
-- same thing before it touches a single policy, so getting this wrong costs
-- you an error message rather than your own access to the admin.
do $$
begin
  if not exists (select 1 from public.staff) then
    raise exception
      'No staff accounts recorded. Edit the e-mail list above to the account you sign in to /admin.html with, then run this file again. Nothing has been changed.';
  end if;
end $$;

select email as "staff who will keep access" from public.staff order by email;
