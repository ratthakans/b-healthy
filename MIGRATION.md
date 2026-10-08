# B-Healthy — Deploy & Migration Guide

The whole site is **account-agnostic**: nothing is hard-coded to a specific
Vercel/Supabase account. Building in our account now and migrating to the
client later means **swapping keys, not rewriting code**.

---

## Current setup (our account)

| Piece    | Where                                   |
|----------|-----------------------------------------|
| GitHub   | `ratthakans/b-healthy`                  |
| Vercel   | team `ratthakans` → https://b-healthy-ten.vercel.app (auto-deploys on every `git push`) |
| Forms    | `js/config.js` empty ⇒ front-end demo mode (still shows the thank-you) |

Nothing to do for Vercel — it's already live and auto-deploying.

---

## Turn ON the forms (Supabase) — 3 steps

Works the same in **our** account now or the **client's** account later.

1. **Create the table** — Supabase → SQL Editor → paste [`supabase-setup.sql`](supabase-setup.sql) → **Run**
2. **Copy 2 values** — Supabase → Project Settings → API → **Project URL** + **anon public** key
3. **Paste + push** — put them in `js/config.js`, then `git commit && git push`

```js
window.BH_CONFIG = {
  SUPABASE_URL: "https://xxxx.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOi..."
};
```

Submissions appear in Supabase → **Table Editor → submissions**.

---

## Lead emails (Resend) — email the sales team on every submission

Every "จองแพ็กเกจ / Book package" and contact-form submission is emailed to the
team by the serverless function [`api/lead.js`](api/lead.js) via
[Resend](https://resend.com). No build step, no npm install — it calls Resend's
REST API with the built-in `fetch`.

**Recipients (already hard-wired as defaults, override with env vars anytime):**

| To  | `b-healthy@pzentsmart.com` |
| CC  | `kalyarak@pzentsmart.com`, `marketing@pzentsmart.com` |

The customer's own email is set as **Reply-To**, so the team can reply directly.

**One-time setup (3 steps):**

1. **Verify the sending domain** — Resend → **Domains** → Add `pzentsmart.com`,
   then add the DNS records it shows (SPF/DKIM) at your domain registrar. Wait
   for "Verified".
2. **Create an API key** — Resend → **API Keys** → Create → copy it (`re_...`).
3. **Add it to Vercel** — Vercel → Project → **Settings → Environment
   Variables** → add `RESEND_API_KEY` = the key → **Redeploy**.

That's it. Optional env-var overrides (Vercel → Environment Variables):

```
LEAD_TO     b-healthy@pzentsmart.com
LEAD_CC     kalyarak@pzentsmart.com, marketing@pzentsmart.com
LEAD_FROM   B-Healthy <no-reply@pzentsmart.com>   # domain must be verified in Resend
```

Until `RESEND_API_KEY` is set, the site still works (the thank-you still shows)
— it just doesn't send the email yet. Supabase storage (below) is independent
and optional; both run if configured.

---

## Package management (back-office) — add / edit / publish packages

By default the retreats & workshops are read from the built-in files
(`js/packages.js`, `js/workshops-data.js`). To manage them from a **web
admin** instead — no code edits — turn on the Supabase package store:

1. **Create the table** — Supabase → SQL Editor → paste
   [`supabase-packages.sql`](supabase-packages.sql) → **Run**.
2. **Add the keys** — put the project **URL** + **anon public** key in
   [`js/config.js`](js/config.js) (same 2 values as the forms — one config
   powers both), then `git commit && git push`.
3. **Create a staff login** — Supabase → **Authentication → Users → Add user**
   → enter the team's email + password (tick *Auto Confirm User*).
4. **Open the admin** — go to `/admin.html`, sign in, and click
   **"Import current packages"** once to load everything currently on the site
   into the database. From then on, edit/add/publish there.

How it behaves:

- The public site reads **published** packages live from the DB. Drafts stay
  hidden. Reorder with the **sort** field (low number = shown first).
- If Supabase is **not** configured, or the table is empty, or unreachable, the
  site silently falls back to the built-in files — **it never breaks**.
- Security: the anon key is safe in the browser (Row Level Security lets the
  public *read published only*; all writes require a signed-in staff user).
  `/admin.html` is `noindex` + disallowed in `robots.txt`.

---

## Blog — add / edit an article

Articles are managed in `/admin.html` like everything else — **Type → Blog
article**. The editor has a block-based body (paragraph, heading, bullet list,
pull quote, image), reorder arrows, image upload, and a **Preview** that renders
the draft through the real article page before you publish it.

Sorting is automatic (newest `date` first), the "keep reading" strip fills itself
from the same category, and `/sitemap.xml` picks up new articles on its own.

**Photos** — upload straight from the editor, or drop files in `images/blog/`
named `<slug>-1.jpg`, `-2.jpg`, `-3.jpg` and record the source in
`images/blog/CREDITS.md`.

**English fields are optional.** Leave one blank and the site falls back to the
Thai text rather than showing an empty string.

### The bundled fallback

`js/blog-index.js` (listing fields) and `js/blog-bodies.js` (article text) ship
with the code and are used only when Supabase is unconfigured, unreachable or
has no articles — the blog can never render blank. They are split so the listing
page loads ~7KB instead of ~60KB; it has no reason to download article prose it
will not render.

Editing them by hand is only needed to change what shows during an outage.

---

## Migrate to the client (Vercel `bh-ealthy` + client Supabase)

1. **GitHub** — transfer the repo to the client's/agency's org (Settings →
   Transfer ownership), or invite them as a collaborator.
2. **Vercel (bh-ealthy)** — Add New → **Import Git Repository** → pick the repo
   → **Deploy**. (Static site, no build settings.) Auto-deploy from then on.
3. **Supabase (client)** — in the client's Supabase project, run both
   `supabase-setup.sql` (forms) and `supabase-packages.sql` (package manager),
   then swap the 2 keys in `js/config.js`. Add a staff user for `/admin.html`.
4. **Domain** — add `b-healthy.co` under the client's Vercel project → Domains.

No code changes are required for any of the above.

---

## SQL to run in Supabase (in order)

All five are idempotent — safe to re-run.

1. `supabase-blog.sql` — widens the `packages.type` check constraint to allow
   `topic` and `post`. Until this runs, **the blog cannot be saved from
   /admin.html at all**, and "Import current packages" silently drops the
   homepage topic photos (which is why no `topic` rows exist today).
2. `supabase-fix-placeholder-images.sql` — replaces the picsum placeholders
   still stored in the `packages` rows with the real photo paths.
3. `supabase-fix-workshop-ids.sql` — three workshops were saved with their
   display name in the slug field, so their URLs contained spaces
   (`/package?id=Personalized%20Herbal%20Tea`). Renames them to the hyphenated
   form the rest of the system already uses, and gives all six an intentional
   `sort` so the grid stops reshuffling between page loads. Links shared before
   the rename keep working — `js/package.js` maps the old ids and rewrites the
   address bar.

4. `supabase-analytics.sql` — creates the `page_views` table and the four
   aggregate functions behind the **Analytics** tab. Independent of 1–3; until
   it runs, that tab says so and nothing is counted.

5. `supabase-article-gate.sql` — the article gate: the `posts_public` view,
   the two token functions, and the RLS change that stops anonymous readers
   seeing `post` rows in `packages` at all. Needs (1) and
   `supabase-analytics.sql` to have run first.

After (1), open `/admin.html` → **↧ Import current packages** to load the ten
bundled articles into the database. From then on the site reads articles from
Supabase and the bundled `js/blog-index.js` + `js/blog-bodies.js` are only the
offline fallback. The listing page loads the index alone, so it never ships
article text it will not render.

## Blog URLs and sitemap

Articles live at `/blog/<slug>`; `vercel.json` rewrites that to `post.html`,
which reads the slug from the path. Older `post.html?id=<slug>` links still
resolve, and `<link rel="canonical">` always points at the `/blog/` form so the
two don't split ranking. `post.html` carries `<base href="/">` — without it the
relative asset paths would resolve against `/blog/` and 404.

`/sitemap.xml` is generated by `api/sitemap.js` from the published `post` rows,
so articles added in the admin are listed automatically. It falls back to the
bundled articles if Supabase is unreachable, and derives the host from the
request — no edit needed when the domain moves to b-healthy.co. The old static
`sitemap.xml` was deleted because a real file would shadow the rewrite.

`server.js` mirrors both rewrites so local preview matches production.

Two `vercel.json` gotchas, both of which cost a broken deploy once:

- Rewrite destinations must use the **clean** path (`/post`, not
  `/post.html`). With `cleanUrls: true` a `.html` destination 308-redirects
  and the rewrite 404s. Local preview doesn't reproduce this — `server.js`
  serves the file directly.
- `vercel.json` is schema-validated and **rejects unknown keys**. Adding a
  `_comment` field fails the deployment *before the build starts*, so it
  shows up as an error with no build logs at all. Keep notes here instead.

## Analytics — who is reading what

`supabase-analytics.sql` + `js/track.js` + the **Analytics** tab in
`/admin.html`. Self-hosted: the numbers live in the same Supabase project as
everything else, so there is no third-party account to keep and no cookie
banner to add.

What a view record holds: the page, a random id the browser generated for
itself, the referring **hostname** (not the full URL), device class and chosen
language. No IP address, no cookie, nothing that identifies a person. The
"People" figure counts those random browser ids, so one person on a phone and a
laptop counts twice, and clearing site data makes someone new.

Three things worth knowing before reading the numbers:

- **Localhost is not counted.** `js/track.js` skips local hostnames and
  headless browsers, so a day of development never lands in the report. Set
  `window.BH_TRACK_LOCAL = true` in the console to log a deliberate test view.
- **The site can write but not read.** RLS gives the publishable key INSERT
  only; the four `bh_stats_*` functions do the counting in Postgres and are
  granted to signed-in staff alone. That also means a determined person could
  post junk views — it is a counter, not an audited ledger.
- **Days are bucketed in Asia/Bangkok**, not UTC, so "today" matches the
  person reading the screen.

Detail pages log themselves: `post.html` and `package.html` carry
`data-track="manual"` and call `bhTrackView()` once the article or package is
resolved, so a legacy slug counts towards the record it redirects to and the
`?preview=1` draft view is never counted.

Vercel Web Analytics is off for this project and is a reasonable thing to turn
on alongside this (Project → Analytics), but it reports into the Vercel
dashboard rather than into /admin, and it cannot name an article the way this
can.

## The article gate — teaser now, email to read on

`supabase-article-gate.sql` + `js/gate.js` + the checkbox on each article in
the Blog tab. Off by default: an article is only gated when someone ticks
**"ต้องกรอกอีเมลก่อนอ่าน"** in the editor.

**Why it lives in the database.** Until this went in, one anonymous REST call
returned the full text of every article, and the bundled `js/blog-bodies.js`
served the same text as a static file. A gate written in JavaScript would have
been a curtain: View Source, and the article is there. So the cut happens in
Postgres instead. `posts_public` is a view that hands a gated article roughly
its **first 20%** and a `gated` flag; the rest is never sent. The anon policy
on `packages` now excludes `type = 'post'`, so there is no way around the view.

`bh_teaser()` decides where to cut. It measures length in characters of Thai
body text (a photo counts as 200, so an article opening on images does not give
them away for nothing), then takes whichever block boundary is **nearest** 20%,
above or below. Both simpler rules were wrong against the real articles:
stopping at the last boundary under 20% starved the long pieces down to 8%, and
taking the first one over it handed out as much as 52%.

A teaser never ends on a heading — a headline with nothing beneath it is not a
sample — so the cut walks back past one. An article that opens with a heading
and one long list therefore shows nothing at all and is locked from the top,
which is the right answer for a piece too short to sample. Across the 21
articles live today that averages 18% free, at most 36%, with two locked from
the top.

Change the share by editing `0.20` in `bh_teaser` — it appears once.

**The token.** `bh_unlock(email, slug)` records the reader in `submissions` as
`type = 'member'` and returns a string signed with HMAC-SHA256.
`bh_article_body(slug, token)` checks that signature before returning anything,
and returns null — never a partial article — for a token that is missing,
edited or past its 180 days. The signing key is generated by
`gen_random_bytes()` into `app_secrets`, a table with RLS on and no policies,
so neither the publishable key nor a staff login can read it. **There is no new
environment variable and no service-role key anywhere in this.**

`bh_sign` is revoked from `anon` and `authenticated` on purpose: being able to
call it is being able to forge an unlock.

**The email is not verified, by design.** Someone can type `a@a.com` and read
the article. That is the same deal every online magazine makes — what makes the
gate real is that the server decides, not the browser.

**Deploy order does not matter.** `js/blog-store.js` asks for the view and
falls back to the table when it is not there, so the site can ship before the
SQL runs — it simply behaves as it does today, every article open. That is not
a way around the gate: the same SQL that creates the view also closes
`packages` to anonymous reads of articles, so once the gate is real the
fallback comes back empty.

**What it costs in SEO.** Google sees exactly what a signed-out reader sees:
cover, headline, excerpt and the teaser. The page carries
`isAccessibleForFree: false` so this reads as a declared paywall rather than
cloaking, but a gated article will not rank on text it no longer shows. Gate
the few articles worth an email; leave the rest open.

**`js/blog-bodies.js` is gone.** A static file with every article in it would
have handed the gated ones out for free. Two consequences:

- If Supabase is unreachable, articles show their header and "ยังโหลดบทความนี้
  ไม่ได้" instead of bundled text. The listing page still works from
  `js/blog-index.js`, which only ever held metadata.
- **↧ Import from site skips articles now.** It would otherwise overwrite every
  live article with an empty body. Articles live in the database; the import
  button is for packages, membership tiers and topic photos.

**Where the numbers show up.** The Analytics tab logs two extra kinds,
`gate` (the card was shown) and `unlock` (an email was given), and puts them
side by side per article as a conversion rate. They are excluded from "Page
views" and the daily chart — they are events, not visits. Signups appear in
Customers under **Article signups**, separate from sales enquiries.

**Still outstanding:** nobody who signs up receives anything, because
`RESEND_API_KEY` is still unset (`/api/lead` answers
`{"ok":false,"error":"Email service not configured"}`). The addresses collect
in Customers in the meantime. Sending to them needs the Wix → Resend domain
verification finished first — and a list of people who gave you an email to
receive articles is a list that expects articles.

## Testing the SQL before it touches the live database

`sql-test.mjs` runs every `.sql` file in this folder against a real Postgres —
PGlite, the engine compiled to WebAssembly — with the `anon` and
`authenticated` roles created and holding the table grants Supabase hands out
by default. Every assertion runs *as anon*, so "anon cannot read this" is
tested rather than assumed.

```
mkdir -p /tmp/bh-sqltest && cd /tmp/bh-sqltest
npm init -y && npm i @electric-sql/pglite
cp ~/Desktop/website/B-Healthy/sql-test.mjs .
SQL_DIR=~/Desktop/website/B-Healthy node sql-test.mjs
```

The copy matters: node resolves the dependency from wherever the file sits.
Point `ARTICLES=` at a dump of the live `post` rows to check the teaser rule
against the real articles instead of the built-in fixture.

It exists because two attempts at `supabase-article-gate.sql` failed in the
Supabase SQL editor over things that cost a second to catch here — an `hmac`
overload that does not exist, and a schema-qualified call to an extension that
may live elsewhere. Run it before handing any new SQL over.

## Still-open content items (swap anytime)

- Venue photos for the four retreat properties — Amphawa Hideaway Homestay,
  Makham Villa Kanchanaburi, Anantara Hua Hin. The venue block renders
  text-only until these exist (see `images/README.md`)
- Golf Recovery Retreat photos — one golf shot covers a six-activity programme
- Wellness Workshop banner video (the provided YouTube Short has embedding
  disabled — needs embedding enabled, a regular public video, or an mp4)
- Rebalance Retreat price (currently "Contact us")
- favicon + Open Graph image for nicer link sharing
