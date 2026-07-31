# Images — B-Healthy

Every image on the site is a real file in this folder. There are no remote
placeholders (picsum.photos and friends are gone).

## Layout

| Folder | What lives there |
|---|---|
| `images/` | Brand + one-off assets — `logo.svg`, `hero-beach.jpg`, `line-qr.jpg` |
| `images/photos/` | Section and card photos referenced directly from HTML |
| `images/experts/` | Expert portraits (`expert-<firstname>.jpg`) |
| `images/membership/` | Membership ecosystem screens — `eco-portal`, `eco-app`, `eco-experiences` |
| `images/tourism/<topic>/` | Retreat topic galleries — `<topic>-1.jpg`, `-2.jpg`, … |
| `images/workshop/<topic>/` | Workshop topic galleries — same numbering |
| `images/blog/` | Article photos, `<article-slug>-1..3.jpg` — sources in `CREDITS.md` |

## Topic galleries

`images/tourism/*` and `images/workshop/*` feed the hover galleries on the
homepage. The topic keys match the `data-topic` attributes in `index.html`, and
the file counts are declared in `js/main.js` (`counts:`). **Add a file → bump
the matching count**, or it will never be shown.

Only the first 3 photos of a topic are displayed. Admin-uploaded photos
(`type=topic` rows in Supabase) override the on-disk files — see `js/topics.js`.

## Adding photos

1. Drop the file in the right folder using the existing naming pattern.
2. Point the `src` at it — HTML for static images, `js/packages.js` /
   `js/workshops-data.js` for package and workshop data.
3. Give every content image a real `alt`. Leave `alt=""` only for decoration.
4. Add `width`/`height` so the layout doesn't jump while loading, and
   `loading="lazy"` for anything below the fold.

## Still missing

Venue galleries in `js/packages.js` are empty (`images: []`) for all four
retreat packages. These are real, named third-party properties — Amphawa
Hideaway Homestay, Makham Villa Kanchanaburi, Anantara Hua Hin — so they need
actual photos of those places, not stand-ins. The venue section renders
text-only until they arrive.

The Golf Recovery Retreat has one golf photo (`photos/golf.jpg`) covering a
six-activity programme; the rest borrow generic wellness shots.
