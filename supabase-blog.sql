-- ============================================================
-- B-Healthy — allow blog articles (and topic images) in the CMS
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
--
-- The packages table was created with
--     check (type in ('retreat','workshop','membership'))
-- which silently rejects every other type. That is why "Import current
-- packages" never actually saved the homepage topic photos, and why the
-- blog could not be stored at all.
--
-- This widens the constraint to cover both. Safe to run more than once.
-- ============================================================

alter table public.packages drop constraint if exists packages_type_check;

alter table public.packages add constraint packages_type_check
  check (type in ('retreat', 'workshop', 'membership', 'topic', 'post'));

-- ---- Verify ----
-- Should list the four existing types plus, once you've imported from
-- /admin.html, 'topic' and 'post'.
select type, count(*) as rows
from public.packages
group by type
order by type;
