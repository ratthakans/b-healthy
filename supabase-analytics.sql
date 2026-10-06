-- =============================================================================
-- B-Healthy — Analytics (page views)
-- Run ONCE in Supabase -> SQL Editor, project gngibdrjcnshyqkomkjs.
--
-- What this stores: one row per page view, tagged with a random id that the
-- visitor's own browser generates. That id is what lets the admin count PEOPLE
-- instead of just hits. Nothing here identifies anyone: no IP address, no
-- cookie, no name, no email.
--
-- Who can read it: nobody holding the publishable key. The website is only
-- allowed to INSERT. Reading happens through the aggregate functions at the
-- bottom, which are restricted to signed-in staff.
-- =============================================================================

create table if not exists public.page_views (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),

  -- Normalised by js/track.js so the same page never splits into several rows:
  -- '/', '/program', '/blog/<slug>', '/package/<id>'
  path       text not null check (char_length(path) between 1 and 300),
  kind       text not null default 'page' check (kind in ('page', 'post', 'package')),
  ref_id     text check (char_length(ref_id) <= 200),   -- article slug / package id

  -- Random, browser-generated. visitor_id persists (localStorage) and answers
  -- "how many people"; session_id lasts one tab. Neither is derived from
  -- anything about the person, so neither can be traced back to one.
  visitor_id text not null check (char_length(visitor_id) between 6 and 64),
  session_id text not null check (char_length(session_id) between 6 and 64),

  referrer   text check (char_length(referrer) <= 180),  -- hostname only, e.g. 'google.com'
  device     text check (device in ('mobile', 'tablet', 'desktop')),
  lang       text check (lang in ('th', 'en'))
);

-- The length checks above are not cosmetic: the insert policy below has to be
-- open to anonymous visitors, so they are what stops a junk request from
-- writing a megabyte into the log.

create index if not exists page_views_created_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx    on public.page_views (path, created_at desc);
create index if not exists page_views_kind_idx    on public.page_views (kind, created_at desc);

-- ----------------------------------------------------------------------- RLS
alter table public.page_views enable row level security;

grant insert on public.page_views to anon, authenticated;
grant select on public.page_views to authenticated;

-- Write-only for the public site: a view can be logged, but the log cannot be
-- read back out with the key that is visible in the browser.
drop policy if exists "log a view" on public.page_views;
create policy "log a view" on public.page_views
  for insert to anon, authenticated with check (true);

-- Staff can inspect raw rows if they ever need to; the admin screen itself
-- only calls the aggregates below.
drop policy if exists "staff read views" on public.page_views;
create policy "staff read views" on public.page_views
  for select to authenticated using (true);

-- =============================================================================
-- Aggregates
--
-- The admin never downloads the raw log — at a few thousand views a day that
-- would be megabytes and PostgREST would cap it at 1000 rows anyway. These
-- functions do the counting in Postgres and return a handful of rows.
--
-- Days are bucketed in Asia/Bangkok, not UTC: otherwise "today" would start at
-- 7am Thai time and every daily number would look wrong to the person reading it.
-- =============================================================================

-- Totals for the window, plus the window before it so the UI can show a trend.
create or replace function public.bh_stats_totals(p_days int default 30)
returns table (views bigint, visitors bigint, prev_views bigint, prev_visitors bigint)
language sql security definer set search_path = public stable as $$
  with cur as (
    select * from public.page_views
    where created_at >= now() - make_interval(days => greatest(p_days, 1))
  ), prev as (
    select * from public.page_views
    where created_at >= now() - make_interval(days => greatest(p_days, 1) * 2)
      and created_at <  now() - make_interval(days => greatest(p_days, 1))
  )
  select (select count(*)                  from cur)::bigint,
         (select count(distinct visitor_id) from cur)::bigint,
         (select count(*)                  from prev)::bigint,
         (select count(distinct visitor_id) from prev)::bigint;
$$;

-- One row per day, including days with no traffic at all — a gap in the chart
-- should read as a quiet day, not as a missing bar.
create or replace function public.bh_stats_daily(p_days int default 30)
returns table (day date, views bigint, visitors bigint)
language sql security definer set search_path = public stable as $$
  select g.d::date,
         count(v.id)::bigint,
         count(distinct v.visitor_id)::bigint
  from generate_series(
         (timezone('Asia/Bangkok', now()) - make_interval(days => greatest(p_days, 1) - 1))::date,
         (timezone('Asia/Bangkok', now()))::date,
         interval '1 day'
       ) as g(d)
  left join public.page_views v
    on v.created_at >= now() - make_interval(days => greatest(p_days, 1) + 1)
   and (timezone('Asia/Bangkok', v.created_at))::date = g.d::date
  group by g.d
  order by g.d;
$$;

-- Most-viewed paths. p_kinds filters to pages / articles / packages; null = all.
create or replace function public.bh_stats_top(
  p_days int default 30, p_kinds text[] default null, p_limit int default 20)
returns table (path text, kind text, ref_id text, views bigint, visitors bigint)
language sql security definer set search_path = public stable as $$
  select v.path,
         min(v.kind)::text,
         min(v.ref_id)::text,
         count(*)::bigint,
         count(distinct v.visitor_id)::bigint
  from public.page_views v
  where v.created_at >= now() - make_interval(days => greatest(p_days, 1))
    and (p_kinds is null or v.kind = any (p_kinds))
  group by v.path
  order by count(*) desc, v.path
  limit greatest(1, least(coalesce(p_limit, 20), 200));
$$;

-- Where people came from, what they read on, which language they chose —
-- returned as one long list so the admin needs a single round trip.
create or replace function public.bh_stats_breakdown(p_days int default 30)
returns table (dim text, label text, views bigint)
language sql security definer set search_path = public stable as $$
  with v as (
    select * from public.page_views
    where created_at >= now() - make_interval(days => greatest(p_days, 1))
  )
  select 'referrer'::text, coalesce(nullif(referrer, ''), 'direct')::text,  count(*)::bigint from v group by 2
  union all
  select 'device'::text,   coalesce(nullif(device, ''),   'unknown')::text, count(*)::bigint from v group by 2
  union all
  select 'lang'::text,     coalesce(nullif(lang, ''),     'unknown')::text, count(*)::bigint from v group by 2
  order by 1, 3 desc;
$$;

-- create function grants EXECUTE to PUBLIC by default, which would hand the
-- whole dashboard to anyone with the publishable key. Take it back.
revoke all on function public.bh_stats_totals(int)                from public, anon;
revoke all on function public.bh_stats_daily(int)                 from public, anon;
revoke all on function public.bh_stats_top(int, text[], int)      from public, anon;
revoke all on function public.bh_stats_breakdown(int)             from public, anon;

grant execute on function public.bh_stats_totals(int)             to authenticated;
grant execute on function public.bh_stats_daily(int)              to authenticated;
grant execute on function public.bh_stats_top(int, text[], int)   to authenticated;
grant execute on function public.bh_stats_breakdown(int)          to authenticated;
