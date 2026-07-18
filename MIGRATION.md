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

## Still-open content items (swap anytime)

- Real photos (replace picsum placeholders — see `images/README.md`)
- Wellness Workshop banner video (the provided YouTube Short has embedding
  disabled — needs embedding enabled, a regular public video, or an mp4)
- Rebalance Retreat price (currently "Contact us")
- Real Line QR code in the footer
- favicon + Open Graph image for nicer link sharing
