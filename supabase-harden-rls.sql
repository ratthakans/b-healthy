-- =============================================================================
-- B-Healthy — stop "logged in" from meaning "staff"
-- RUN supabase-staff.sql FIRST. Idempotent: safe to re-run.
--
-- WHAT WAS WRONG, concretely, as of 2026-10-13:
--
--   Authentication → disable_signup = false   (anyone could register)
--   public.is_staff()                          did not exist
--   public.staff                               did not exist
--
-- and every policy written by supabase-packages.sql and
-- supabase-submissions.sql said `to authenticated using (true)`. Put together,
-- anyone on the internet could sign up against this project and then read every
-- customer lead — names, phones, e-mails, and since the wellness check, what
-- people said about their own health — and edit or delete every package and
-- article. The publishable key is in the page source; that was the whole lock.
--
-- This file replaces `authenticated` with `public.is_staff()` everywhere it was
-- standing in for staff. After it runs, an open sign-up is harmless: a new
-- account can do exactly what an anonymous visitor can do, and nothing more —
-- which is also what makes member accounts possible later.
--
-- It does NOT touch the policies that are meant to be public: reading
-- published packages, inserting a form submission, logging a page view, or the
-- posts_public view behind the article gate.
-- =============================================================================

-- Refuse to run at all rather than lock the owner out of their own admin.
do $$
begin
  if to_regclass('public.staff') is null or to_regprocedure('public.is_staff()') is null then
    raise exception 'Run supabase-staff.sql first — it creates the staff list this file depends on. Nothing has been changed.';
  end if;
  if not exists (select 1 from public.staff) then
    raise exception 'The staff list is empty. Add your admin e-mail in supabase-staff.sql and run that first, or this would remove your own access. Nothing has been changed.';
  end if;
end $$;

-- ------------------------------------------------------------ packages
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

-- ----------------------------------------------------- customer submissions
-- Enquiries, article sign-ups, wellness answers and workshop claims all live
-- here. This is the table that mattered most.
drop policy if exists "staff read submissions" on public.submissions;
create policy "staff read submissions" on public.submissions
  for select to authenticated using (public.is_staff());

drop policy if exists "staff update submissions" on public.submissions;
create policy "staff update submissions" on public.submissions
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "staff delete submissions" on public.submissions;
create policy "staff delete submissions" on public.submissions
  for delete to authenticated using (public.is_staff());

-- ---------------------------------------------------------------- page views
-- The raw visit log: a row per view with a browser id. Aggregates are one
-- thing, handing someone the log is another.
drop policy if exists "staff read views" on public.page_views;
create policy "staff read views" on public.page_views
  for select to authenticated using (public.is_staff());

-- ------------------------------------------------------------ image uploads
-- storage.objects only exists on a real Supabase project, so this is wrapped:
-- the same file still runs against a plain Postgres for testing.
do $$
begin
  if to_regclass('storage.objects') is null then
    raise notice 'storage.objects not present — skipping upload policies';
    return;
  end if;

  execute $p$ drop policy if exists "staff upload package images" on storage.objects $p$;
  execute $p$ create policy "staff upload package images" on storage.objects
    for insert to authenticated with check (bucket_id = 'package-images' and public.is_staff()) $p$;

  execute $p$ drop policy if exists "staff update package images" on storage.objects $p$;
  execute $p$ create policy "staff update package images" on storage.objects
    for update to authenticated using (bucket_id = 'package-images' and public.is_staff()) $p$;

  execute $p$ drop policy if exists "staff delete package images" on storage.objects $p$;
  execute $p$ create policy "staff delete package images" on storage.objects
    for delete to authenticated using (bucket_id = 'package-images' and public.is_staff()) $p$;
end $$;

-- =============================================================================
-- The analytics functions are NOT redefined here.
--
-- They carry their own staff check, inside supabase-analytics.sql, where they
-- are defined. Two files defining one function is how a previous fix got
-- silently undone by re-running the other one.
-- =============================================================================

select 'Done. `authenticated` no longer means staff.' as result,
       (select count(*) from public.staff) as "staff accounts";
