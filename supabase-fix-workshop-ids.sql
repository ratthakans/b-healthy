-- ============================================================
-- B-Healthy — give three workshops proper slugs, and make the grid order
--             deterministic
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
--
-- Three workshop rows were created with their display name in the slug
-- field, so their public URLs contained spaces:
--     /package?id=Personalized%20Herbal%20Tea
-- The rest of the system already uses the hyphenated form for exactly these
-- workshops — the homepage topic keys (index.html), the photo folders
-- (images/workshop/…) and the admin topic seed all say
-- `personalized-herbal-tea`. This aligns the row ids with that.
--
-- Old links keep working: js/package.js maps the three previous ids to the
-- new slugs and rewrites the URL, so nothing shared before today 404s.
--
-- `sort` was 0 on four of the six rows, which left their order up to
-- Postgres — the grid could reshuffle between page loads. The values below
-- match the workshop list on the homepage.
--
-- Safe to run more than once: the renames match nothing on a second run and
-- the sort update keys off the new ids.
-- ============================================================

begin;

-- ---- 1. Rename the ids (and keep data->>'id' in step) ----
update public.packages
   set id = 'elemental-aroma-oil',
       data = jsonb_set(data, '{id}', '"elemental-aroma-oil"')
 where id = 'Elemental Aroma Oil';

update public.packages
   set id = 'personalized-herbal-tea',
       data = jsonb_set(data, '{id}', '"personalized-herbal-tea"')
 where id = 'Personalized Herbal Tea';

update public.packages
   set id = 'flower-mandala',
       data = jsonb_set(data, '{id}', '"flower-mandala"')
 where id = 'Flower Mandala';

-- ---- 2. Deliberate order, matching the homepage workshop list ----
update public.packages set sort = 0 where id = 'office-syndrome';
update public.packages set sort = 1 where id = 'sound-healing';
update public.packages set sort = 2 where id = 'yoga-meditation';
update public.packages set sort = 3 where id = 'elemental-aroma-oil';
update public.packages set sort = 4 where id = 'personalized-herbal-tea';
update public.packages set sort = 5 where id = 'flower-mandala';

commit;

-- ---- Verify ----
-- Expect six rows, every id hyphenated, sort 0-5 with no duplicates.
select id, sort, name, data ->> 'id' as data_id
  from public.packages
 where type = 'workshop'
 order by sort;
