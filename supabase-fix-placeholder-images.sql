-- ============================================================
-- B-Healthy — replace picsum.photos placeholders with real photos
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
--
-- js/packages.js (the fallback data) no longer contains any picsum
-- URLs, but the live site reads from this table via js/store.js, so
-- the rows need the same treatment. Mapping is identical to the one
-- applied to js/packages.js — keep the two in step.
--
-- Safe to run more than once: replace() on an already-fixed row is a
-- no-op, and the venue update just re-writes an empty array.
-- ============================================================

begin;

-- ---- Activity photos: real B-Healthy shots that match each experience ----
update public.packages
set data = replace(replace(replace(replace(replace(replace(replace(replace(replace(
           replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(
             data::text,
    'https://picsum.photos/seed/bh-amp-1/500/400',  'images/workshop/elemental-aroma-oil/elemental-aroma-oil-1.jpg'),
    'https://picsum.photos/seed/bh-amp-2/500/400',  'images/workshop/yoga-meditation/yoga-meditation-1.jpg'),
    'https://picsum.photos/seed/bh-amp-3/500/400',  'images/tourism/food-as-medicine/food-as-medicine-1.jpg'),
    'https://picsum.photos/seed/bh-amp-4/500/400',  'images/tourism/local-route/local-route-1.jpg'),

    'https://picsum.photos/seed/bh-gl-1/500/400',   'images/tourism/health-assessment/health-assessment-1.jpg'),
    'https://picsum.photos/seed/bh-gl-2/500/400',   'images/tourism/workshop-activities/workshop-activities-1.jpg'),
    'https://picsum.photos/seed/bh-gl-3/500/400',   'images/workshop/yoga-meditation/yoga-meditation-2.jpg'),
    'https://picsum.photos/seed/bh-gl-4/500/400',   'images/tourism/therapeutic-treatment/therapeutic-treatment-1.jpg'),
    'https://picsum.photos/seed/bh-gl-5/500/400',   'images/tourism/food-as-medicine/food-as-medicine-2.jpg'),

    'https://picsum.photos/seed/bh-rb-1/500/400',   'images/workshop/yoga-meditation/yoga-meditation-3.jpg'),
    'https://picsum.photos/seed/bh-rb-2/500/400',   'images/tourism/food-as-medicine/food-as-medicine-3.jpg'),
    'https://picsum.photos/seed/bh-rb-3/500/400',   'images/workshop/sound-healing/sound-healing-1.jpg'),
    'https://picsum.photos/seed/bh-rb-4/500/400',   'images/workshop/office-syndrome/office-syndrome-1.jpg'),

    'https://picsum.photos/seed/bh-golf-1/500/400', 'images/workshop/yoga-meditation/yoga-meditation-5.jpg'),
    'https://picsum.photos/seed/bh-golf-2/500/400', 'images/tourism/therapeutic-treatment/therapeutic-treatment-2.jpg'),
    'https://picsum.photos/seed/bh-golf-3/500/400', 'images/tourism/health-assessment/health-assessment-2.jpg'),
    'https://picsum.photos/seed/bh-golf-4/500/400', 'images/photos/golf.jpg'),
    'https://picsum.photos/seed/bh-golf-5/500/400', 'images/tourism/food-as-medicine/food-as-medicine-4.jpg'),
    'https://picsum.photos/seed/bh-golf-6/500/400', 'images/workshop/sound-healing/sound-healing-2.jpg'
           )::jsonb
where data::text like '%picsum.photos%';

-- ---- Venue galleries: emptied until real photos of each property exist ----
-- These are named third-party properties (Amphawa Hideaway Homestay, Makham
-- Villa Kanchanaburi, Anantara Hua Hin). A generic stock shot under a named
-- hotel misrepresents what the customer is booking, so the venue block renders
-- text-only until someone uploads real photos via /admin.html.
update public.packages
set data = jsonb_set(data, '{venue,images}', '[]'::jsonb)
where data ? 'venue'
  and data -> 'venue' ? 'images'
  and data -> 'venue' ->> 'images' like '%picsum.photos%';

commit;

-- ---- Verify: should return zero rows ----
select id, type, status
from public.packages
where data::text like '%picsum%';
