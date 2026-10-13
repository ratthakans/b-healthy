-- =============================================================================
-- B-Healthy — member accounts
-- Run AFTER supabase-staff.sql and supabase-harden-rls.sql. Idempotent.
--
-- WHAT THIS ASSUMES ABOUT THE DASHBOARD (Authentication → Sign In / Providers
-- → Email), because Supabase will not deliver mail to anyone outside the
-- project's own team unless a custom SMTP server is configured:
--
--   Confirm email           OFF   otherwise nobody can ever sign in — the
--                                 confirmation mail is refused, not delayed
--   Secure password change  OFF   it sends a code by e-mail before allowing a
--                                 change, so with it on nobody could change one
--   Minimum password length 8     the sign-up form says 8; the server must agree
--
-- Two consequences of an unconfirmed e-mail shape everything below:
--
--   * Anyone can register with somebody else's address. So nothing is ever
--     attached to an account because the e-mail matches — a stranger who
--     signed up as you would otherwise be handed your wellness answers.
--     Ownership is by user_id only: what you do while signed in is yours.
--   * There is no "e-mail me a reset link". Forgotten passwords go through
--     staff, who confirm identity by phone and issue a temporary password
--     (bh_issue_temp_password) that has to be replaced at the next sign-in.
-- =============================================================================

create extension if not exists pgcrypto;
set search_path = public, extensions;

do $$
begin
  if to_regprocedure('public.is_staff()') is null then
    raise exception 'Run supabase-staff.sql and supabase-harden-rls.sql first. Nothing has been changed.';
  end if;
end $$;

-- ------------------------------------------------------------------ profiles
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  full_name            text check (char_length(full_name) <= 120),
  phone                text check (char_length(phone) <= 40),
  company              text check (char_length(company) <= 160),
  must_change_password boolean not null default false,
  consent_at           timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Supabase's default privileges hand every new table to anon and
-- authenticated wholesale. Take that back and grant column by column: a member
-- may edit their name, phone and company, and nothing else. In particular not
-- must_change_password — clearing that is bh_password_changed()'s job — and
-- not consent_at, which records a moment, not a preference.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, company) on public.profiles to authenticated;

drop policy if exists "member reads own profile" on public.profiles;
create policy "member reads own profile" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_staff());

drop policy if exists "member updates own profile" on public.profiles;
create policy "member updates own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- A profile appears the moment an account does, from what the sign-up form sent
-- as metadata. This trigger runs inside Supabase's own sign-up transaction, so
-- if it ever raised, sign-up itself would fail for everyone with "Database
-- error saving new user". Everything is truncated to fit, and any surprise is
-- swallowed into a warning: a missing profile is recoverable, a broken sign-up
-- page is not.
create or replace function public.bh_handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  begin
    insert into public.profiles (id, full_name, phone, company, consent_at)
    values (
      new.id,
      left(nullif(btrim(new.raw_user_meta_data->>'full_name'), ''), 120),
      left(nullif(btrim(new.raw_user_meta_data->>'phone'), ''), 40),
      left(nullif(btrim(new.raw_user_meta_data->>'company'), ''), 160),
      case when (new.raw_user_meta_data->>'consent') = 'true' then now() end
    )
    on conflict (id) do nothing;
  exception when others then
    raise warning 'bh_handle_new_user: no profile for %: %', new.id, sqlerrm;
  end;
  return new;
end $$;

drop trigger if exists bh_on_auth_user_created on auth.users;
create trigger bh_on_auth_user_created
  after insert on auth.users
  for each row execute function public.bh_handle_new_user();

-- Accounts that existed before this file (staff, mostly) get an empty profile
-- so every query below can assume one exists.
insert into public.profiles (id)
select u.id from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- ------------------------------------------------------------- submissions
-- A row made while signed in carries the member's id. Deleting the account
-- deletes those rows with it: wellness answers are health information, and
-- "delete my account" has to mean them too.
alter table public.submissions
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists submissions_user_idx on public.submissions (user_id);

-- Anonymous visitors still submit, but can no longer name an owner. Without
-- this, anyone could pin a fake enquiry onto a member's account by guessing
-- nothing more than a uuid.
drop policy if exists "public can insert submissions" on public.submissions;
create policy "public can insert submissions" on public.submissions
  for insert to anon with check (user_id is null);

-- The anon policy above says `to anon`, so a signed-in member — who arrives as
-- `authenticated` — could not submit a form at all. They may, as themselves.
drop policy if exists "member inserts own submissions" on public.submissions;
create policy "member inserts own submissions" on public.submissions
  for insert to authenticated with check (user_id is null or user_id = auth.uid());

-- And may read back exactly what they submitted while signed in. Combined
-- with the staff policy by OR, as permissive policies are.
drop policy if exists "member reads own submissions" on public.submissions;
create policy "member reads own submissions" on public.submissions
  for select to authenticated using (user_id = auth.uid());

-- ----------------------------------------------------------------- packages
-- Same `to anon` problem: a signed-in member saw no retreats, no workshops and
-- no homepage photos. Same rule as anonymous visitors, nothing more.
drop policy if exists "members read published packages" on public.packages;
create policy "members read published packages" on public.packages
  for select to authenticated using (status = 'published' and type <> 'post');

-- ------------------------------------------------------- reading as a member
-- A signed-in member reads a gated article in full: the account is the e-mail
-- they would otherwise have typed into the card.
create or replace function public.bh_member_article_body(p_slug text)
returns jsonb
language sql stable security definer set search_path = public as $$
  select case when auth.uid() is null then null else
    (select p.data->'body' from public.packages p
      where p.id = p_slug and p.type = 'post' and p.status = 'published')
  end;
$$;
revoke all on function public.bh_member_article_body(text) from public, anon;
grant execute on function public.bh_member_article_body(text) to authenticated;

-- ------------------------------------------------- after a password change
-- Clears the "you must choose a new password" flag. Only ever about the
-- caller. A member who calls it without changing anything only keeps a
-- password staff have heard, which is why the page calls it straight after a
-- successful change and nowhere else.
create or replace function public.bh_password_changed()
returns void
language sql security definer set search_path = public as $$
  update public.profiles set must_change_password = false, updated_at = now()
   where id = auth.uid();
$$;
revoke all on function public.bh_password_changed() from public, anon;
grant execute on function public.bh_password_changed() to authenticated;

-- ---------------------------------------------------------- delete account
-- PDPA: a member can remove themselves without asking anyone. Cascades to the
-- profile and to every submission made while signed in. Staff accounts are
-- refused — losing the last one would lock everybody out of the admin.
create or replace function public.bh_delete_my_account()
returns void
language plpgsql security definer set search_path = public as $$
declare v uuid := auth.uid();
begin
  if v is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if public.is_staff() then
    raise exception 'staff accounts are removed by an owner, not from the website' using errcode = '42501';
  end if;
  delete from auth.users where id = v;
end $$;
revoke all on function public.bh_delete_my_account() from public, anon;
grant execute on function public.bh_delete_my_account() to authenticated;

-- ======================================================== staff-only tools

-- Who has an account. The e-mail and last sign-in live in auth.users, which no
-- API role can read, so staff get them through here and nowhere else.
create or replace function public.bh_staff_members()
returns table (id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz,
               full_name text, phone text, company text, must_change_password boolean,
               is_staff boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then
    raise exception 'staff only' using errcode = '42501';
  end if;
  return query
  select u.id, u.email::text, u.created_at, u.last_sign_in_at,
         p.full_name, p.phone, p.company, coalesce(p.must_change_password, false),
         exists (select 1 from public.staff s where s.user_id = u.id)
    from auth.users u
    left join public.profiles p on p.id = u.id
   order by u.created_at desc;
end $$;
revoke all on function public.bh_staff_members() from public, anon;
grant execute on function public.bh_staff_members() to authenticated;

-- The forgotten-password path, since nothing can be e-mailed. Staff phone the
-- number ON THE ACCOUNT — not the one typed into the request — confirm who
-- they are speaking to, then issue this. The password is shown to staff once,
-- read out over the phone, and must be replaced at the next sign-in.
--
-- Writing auth.users.encrypted_password directly is widely done but not an
-- interface Supabase documents; it works because Supabase Auth stores bcrypt
-- and pgcrypto writes bcrypt. Cost 10 matches what Supabase itself uses.
create or replace function public.bh_issue_temp_password(p_user uuid)
returns text
language plpgsql security definer set search_path = public, extensions as $$
declare
  -- Read aloud over a phone line: no 0/O, 1/l/I, no symbols.
  alphabet constant text := 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea := gen_random_bytes(10);
  pw text := '';
  i int;
begin
  if not public.is_staff() then
    raise exception 'staff only' using errcode = '42501';
  end if;
  if exists (select 1 from public.staff where user_id = p_user) then
    raise exception 'staff passwords are not reset from here' using errcode = '42501';
  end if;

  for i in 0..9 loop
    pw := pw || substr(alphabet, (get_byte(bytes, i) % length(alphabet)) + 1, 1);
  end loop;

  update auth.users
     set encrypted_password = crypt(pw, gen_salt('bf', 10)),
         updated_at = now()
   where id = p_user;
  if not found then
    raise exception 'no such member' using errcode = '22023';
  end if;

  update public.profiles set must_change_password = true, updated_at = now()
   where id = p_user;

  -- Sign them out everywhere, so whoever was holding the old session — the
  -- person who forgot, or someone who should not have had it — has to come
  -- through the new password. Wrapped because these tables are Supabase Auth's
  -- internals: if their shape ever changes, the password still resets.
  begin
    if to_regclass('auth.sessions') is not null then
      execute 'delete from auth.sessions where user_id = $1' using p_user;
    end if;
    if to_regclass('auth.refresh_tokens') is not null then
      execute 'update auth.refresh_tokens set revoked = true where user_id = $1' using p_user::text;
    end if;
  exception when others then
    raise warning 'bh_issue_temp_password: sessions not revoked for %: %', p_user, sqlerrm;
  end;

  return pw;
end $$;
revoke all on function public.bh_issue_temp_password(uuid) from public, anon;
grant execute on function public.bh_issue_temp_password(uuid) to authenticated;

select 'Member accounts ready.' as result,
       (select count(*) from public.profiles) as profiles;
