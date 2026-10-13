// ============================================================================
// B-Healthy - run the .sql files against a real Postgres before touching the
// live database.
//
//   mkdir -p /tmp/bh-sqltest && cd /tmp/bh-sqltest
//   npm init -y && npm i @electric-sql/pglite
//   cp "<this repo>/sql-test.mjs" . && SQL_DIR="<this repo>" node sql-test.mjs
//
// (The copy is not optional: node resolves @electric-sql/pglite from wherever
// this file sits, not from the directory you run it in.)
//
// PGlite is Postgres compiled to WebAssembly, so this is the real engine
// rather than a simulation - same grants, same RLS, same pgcrypto. It exists
// because two attempts at supabase-article-gate.sql failed in the Supabase SQL
// editor over things that would have taken a second to catch here: an hmac
// overload that does not exist, and a schema-qualified call to an extension
// that may live somewhere else.
//
// Every check runs AS the anon role, holding the table grants Supabase gives
// out by default, so "anon cannot read this" means what it says.
//
// Optional: ARTICLES=/path/to/posts.json - the output of
//   curl ".../rest/v1/packages?type=eq.post&status=eq.published&select=id,data"
// - runs the teaser rule over the real articles instead of the fixture below.
// ============================================================================

import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import { readFileSync } from 'node:fs';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const DIR = (process.env.SQL_DIR || dirname(fileURLToPath(import.meta.url))).replace(/\/?$/, '/');
const db = await PGlite.create({ extensions: { pgcrypto } });

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? '  -> ' + detail : '')); }
};
const asAnon = async (sql, params) => {
  await db.exec('set role anon;');
  try { return await db.query(sql, params); }
  finally { await db.exec('reset role;'); }
};
const anonThrows = async (sql, params) => {
  try { await asAnon(sql, params); return null; }
  catch (e) { return e.message; }
};

// ---- Supabase-shaped preamble -------------------------------------------
// auth.users and auth.uid() are Supabase's, not Postgres's. Stubbed here so
// is_staff() — and therefore every policy that calls it — can be exercised.
const STAFF_ID = '11111111-1111-1111-1111-111111111111';
const MEMBER_ID = '22222222-2222-2222-2222-222222222222';
const STAFF_EMAIL = 'CHANGE-ME@example.com';   // matches supabase-staff.sql as shipped

await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;

  create schema if not exists auth;
  create table auth.users (
    id uuid primary key, email text, encrypted_password text,
    raw_user_meta_data jsonb default '{}'::jsonb,
    created_at timestamptz default now(), updated_at timestamptz,
    last_sign_in_at timestamptz, email_confirmed_at timestamptz, banned_until timestamptz);
  create unique index on auth.users (lower(email));
  create table auth.identities (id uuid primary key default gen_random_uuid(), user_id uuid,
    provider text, identity_data jsonb, updated_at timestamptz);
  create table auth.sessions (id uuid primary key default gen_random_uuid(), user_id uuid);
  create table auth.refresh_tokens (id bigserial primary key, user_id varchar(255), revoked boolean default false);
  insert into auth.users (id, email) values
    ('${STAFF_ID}', '${STAFF_EMAIL}'),
    ('${MEMBER_ID}', 'member@example.com');
  create or replace function auth.uid() returns uuid language sql stable as $fn$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $fn$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`);

// Signed in, but not on the staff list — the account an open sign-up hands out.
const asMember = async (sql, params) => {
  await db.exec(`set role authenticated; set request.jwt.claim.sub = '${MEMBER_ID}';`);
  try { return await db.query(sql, params); }
  finally { await db.exec(`reset role; set request.jwt.claim.sub = '';`); }
};
const memberThrows = async (sql, params) => {
  try { await asMember(sql, params); return null; } catch (e) { return e.message; }
};
const asStaff = async (sql, params) => {
  await db.exec(`set role authenticated; set request.jwt.claim.sub = '${STAFF_ID}';`);
  try { return await db.query(sql, params); }
  finally { await db.exec(`reset role; set request.jwt.claim.sub = '';`); }
};

const files = ['supabase-staff.sql', 'supabase-packages.sql', 'supabase-blog.sql',
               'supabase-submissions.sql', 'supabase-analytics.sql',
               'supabase-article-gate.sql', 'supabase-harden-rls.sql',
               'supabase-members.sql'];
for (const f of files) {
  try {
    await db.exec(readFileSync(DIR + f, 'utf8'));
    // No blanket re-grant here. Supabase's default privileges apply once, when
    // a table is created — `alter default privileges` above does exactly that.
    // Re-granting after every file used to undo any column-level REVOKE a file
    // made, and hid the one test that exists to check it.
    console.log('ran  ' + f);
  } catch (e) {
    console.log('FAILED while running ' + f + '\n  ' + e.message);
    process.exit(1);
  }
}
console.log('');

// ---- the teaser rule, against the real articles --------------------------
const P = (type, th, en) => ({ type, th, en });
const FIXTURE = [
  // one that samples cleanly; one whose opening is a heading over a long list,
  // which is locked from the top; one long enough to need several blocks
  { id: 'samples-cleanly', data: { body: [
      P('p', 'ก'.repeat(220), 'a'.repeat(220)), P('h2', 'หัวข้อ', 'Heading'),
      P('p', 'ข'.repeat(400), 'b'.repeat(400)), P('p', 'ค'.repeat(400), 'c'.repeat(400)) ] } },
  { id: 'locked-from-the-top', data: { body: [
      P('h2', 'หัวข้อ'.repeat(6), 'Heading'.repeat(6)),
      P('p', 'จ'.repeat(600), 'e'.repeat(600)) ] } },
  { id: 'long-read', data: { body: Array.from({ length: 12 },
      () => P('p', 'ฉ'.repeat(200), 'f'.repeat(200))) } },
];
const rows = process.env.ARTICLES
  ? JSON.parse(readFileSync(process.env.ARTICLES, 'utf8'))
  : FIXTURE;
const weigh = b => {
  if (b.type === 'ul') return (b.items || []).reduce((s, i) => s + ((i.th || i.en || '').length), 0);
  if (b.type === 'img') return 200;
  return (b.th || b.en || '').length;
};
const reference = body => {
  const ws = body.map(weigh), T = ws.reduce((a, b) => a + b, 0) || 1;
  const cum = [0];
  ws.forEach(x => cum.push(cum[cum.length - 1] + x));
  let n = 0, best = Infinity;
  cum.forEach((c, i) => { const d = Math.abs(c / T - 0.20); if (d < best - 1e-12) { best = d; n = i; } });
  while (n > 0 && body[n - 1].type === 'h2') n--;
  return body.slice(0, n);
};

// Postgres reorders jsonb keys, so the comparison has to ignore key order or
// every fixture written by hand "fails" while being identical.
const canon = v => Array.isArray(v) ? v.map(canon)
  : (v && typeof v === 'object'
      ? Object.keys(v).sort().reduce((o, k) => (o[k] = canon(v[k]), o), {})
      : v);
const same = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

let teaserMismatch = 0;
const summary = [];
for (const r of rows) {
  const body = r.data.body || [];
  const want = reference(body);
  const got = (await db.query('select public.bh_teaser($1::jsonb) as t', [JSON.stringify(body)])).rows[0].t;
  if (!same(got, want)) {
    teaserMismatch++;
    console.log(`  FAIL teaser ${r.id}: sql=${got.length} blocks, reference=${want.length}`);
  }
  const total = body.map(weigh).reduce((a, b) => a + b, 0) || 1;
  const free = want.map(weigh).reduce((a, b) => a + b, 0);
  summary.push([r.id, body.length, want.length, Math.round(free / total * 100)]);
}
ok(`bh_teaser matches the reference on all ${rows.length} articles`, teaserMismatch === 0);

// ---- load them in, gate two ----------------------------------------------
for (const r of rows) {
  try {
    await db.query(
      `insert into public.packages (id, type, status, sort, name, data, en)
       values ($1, 'post', 'published', 0, $2, $3::jsonb, '{}'::jsonb)`,
      [r.id, r.id, JSON.stringify(r.data)]);
  } catch (e) { console.log('  insert failed for ' + r.id + ': ' + String(e.message).slice(0, 160)); throw e; }
}
await db.query(
  `insert into public.packages (id, type, status, sort, name, data, en)
   values ('test-retreat', 'retreat', 'published', 0, 'Test Retreat', '{}'::jsonb, '{}'::jsonb)`);

// Pick two articles that are NOT already gated upstream. Feeding this a live
// export, some of them are — and a teaser trimmed twice is not a fair test.
const ungated = rows.filter(r => !((r.data || {}).gated));
if (ungated.length < 2) throw new Error('need two ungated articles in the fixture');
const GATED = ungated[0].id, FREE = ungated[ungated.length - 1].id;
await db.query(`update public.packages set data = data || '{"gated":true}'::jsonb where id = $1`, [GATED]);

// ---- what anonymous readers can and cannot reach --------------------------
const pk = await asAnon(`select id from public.packages where type = 'post'`);
ok('anon cannot read article rows in packages', pk.rows.length === 0, `got ${pk.rows.length}`);

const pub = await asAnon(`select id, data from public.posts_public order by id`);
ok('anon can read posts_public', pub.rows.length === rows.length, `got ${pub.rows.length}`);

const gatedRow = pub.rows.find(r => r.id === GATED);
const freeRow = pub.rows.find(r => r.id === FREE);
const fullGated = rows.find(r => r.id === GATED).data.body;
ok('gated article is cut to its teaser',
   gatedRow.data.body.length === reference(fullGated).length && gatedRow.data.body.length < fullGated.length,
   `${gatedRow.data.body.length} of ${fullGated.length}`);
ok('gated article carries the flag', gatedRow.data.gated === true);
ok('free article is whole',
   freeRow.data.body.length === (rows.find(r => r.id === FREE).data.body || []).length,
   `${freeRow.data.body.length} vs ${(rows.find(r => r.id === FREE).data.body || []).length}`);
ok('free article carries no flag', !freeRow.data.gated, JSON.stringify(freeRow.data.gated));

ok('anon cannot read the signing key', (await anonThrows('select * from public.app_secrets')) !== null
   || (await asAnon('select * from public.app_secrets')).rows.length === 0);
ok('anon cannot call bh_sign', (await anonThrows(`select public.bh_sign('x')`)) !== null);

// ---- unlock round trip ----------------------------------------------------
const before = (await db.query(`select count(*)::int c from public.submissions`)).rows[0].c;
const tok = (await asAnon(`select public.bh_unlock($1, $2) as t`, ['  Reader@Example.COM ', GATED])).rows[0].t;
ok('bh_unlock returns a token', typeof tok === 'string' && tok.includes('.'));
const after1 = (await db.query(`select count(*)::int c, min(email) e, min(type) t from public.submissions`)).rows[0];
ok('unlock records exactly one lead', after1.c === before + 1, `${before} -> ${after1.c}`);
ok('email is normalised', after1.e === 'reader@example.com', after1.e);
ok('lead is typed member', after1.t === 'member', after1.t);

await asAnon(`select public.bh_unlock($1, $2)`, ['reader@example.com', FREE]);
const after2 = (await db.query(`select count(*)::int c from public.submissions`)).rows[0].c;
ok('a returning reader does not create a duplicate lead', after2 === after1.c, `${after1.c} -> ${after2}`);

const body1 = (await asAnon(`select public.bh_article_body($1, $2) as b`, [GATED, tok])).rows[0].b;
ok('a valid token returns the whole article', body1 && body1.length === fullGated.length,
   `${body1 ? body1.length : 'null'} of ${fullGated.length}`);

for (const [name, bad] of [
  ['a tampered signature', tok.split('.')[0] + '.' + 'AAAA'],
  ['a tampered payload', 'AAAA.' + tok.split('.')[1]],
  ['a token with no dot', tok.replace('.', '')],
  ['an empty token', ''],
  ['a 600-character token', 'x'.repeat(600)],
]) {
  const r = (await asAnon(`select public.bh_article_body($1, $2) as b`, [GATED, bad])).rows[0].b;
  ok(name + ' returns null', r === null, JSON.stringify(r).slice(0, 40));
}
const rNull = (await asAnon(`select public.bh_article_body($1, null) as b`, [GATED])).rows[0].b;
ok('a missing token returns null', rNull === null);

// expired: sign a payload that ran out yesterday
const expPayload = (await db.query(
  `select replace(encode(convert_to('reader@example.com' || '|' ||
     (extract(epoch from now() - interval '1 day'))::bigint::text, 'UTF8'), 'base64'), E'\\n', '') as p`)).rows[0].p;
const expTok = expPayload + '.' + (await db.query(`select public.bh_sign($1) as s`, [expPayload])).rows[0].s;
ok('an expired token returns null',
   (await asAnon(`select public.bh_article_body($1, $2) as b`, [GATED, expTok])).rows[0].b === null);

const drafted = (await asAnon(`select public.bh_article_body('does-not-exist', $1) as b`, [tok])).rows[0].b;
ok('an unknown slug returns null', drafted === null);

// ---- a member is not staff ------------------------------------------------
// This is the hole the harden file closes: sign-up was open and every "staff"
// policy said `to authenticated`, so any stranger with an account could read
// the customer list and rewrite the site.
ok('is_staff says no to a member', (await asMember('select public.is_staff() as s')).rows[0].s === false);
ok('is_staff says yes to staff', (await asStaff('select public.is_staff() as s')).rows[0].s === true);

const mSubs = await asMember('select id from public.submissions');
ok('a member cannot read customer submissions', mSubs.rows.length === 0, `got ${mSubs.rows.length}`);
ok('staff can read customer submissions', (await asStaff('select id from public.submissions')).rows.length > 0);

const mPkg = await asMember(`select id from public.packages where type = 'post'`);
ok('a member cannot read articles in packages', mPkg.rows.length === 0, `got ${mPkg.rows.length}`);

await asMember(`insert into public.packages (id, type, status, sort, name, data, en)
                values ('member-was-here', 'retreat', 'published', 0, 'x', '{}'::jsonb, '{}'::jsonb)`).catch(() => {});
ok('a member cannot add a package',
   (await db.query(`select id from public.packages where id = 'member-was-here'`)).rows.length === 0);

await asMember(`update public.packages set name = 'defaced' where type = 'retreat'`).catch(() => {});
ok('a member cannot edit a package',
   (await db.query(`select id from public.packages where name = 'defaced'`)).rows.length === 0);

await asMember(`delete from public.submissions`).catch(() => {});
ok('a member cannot delete customer data',
   (await db.query(`select count(*)::int c from public.submissions`)).rows[0].c > 0);

const mViews = await asMember('select id from public.page_views');
ok('a member cannot read the visit log', mViews.rows.length === 0, `got ${mViews.rows.length}`);

ok('a member cannot call the analytics functions',
   (await memberThrows('select * from public.bh_stats_totals(30)')) !== null);
ok('staff can call the analytics functions',
   (await asStaff('select * from public.bh_stats_totals(30)')).rows.length === 1);

// ---- and the public still works -------------------------------------------
ok('anon can still read published packages',
   (await asAnon(`select id from public.packages where type = 'retreat'`)).rows.length > 0);
ok('anon can still read the article teasers',
   (await asAnon('select id from public.posts_public')).rows.length > 0);
const anonIns = await anonThrows(
  `insert into public.submissions (type, email, status) values ('contact', 'x@y.co', 'new')`);
ok('anon can still submit a form', anonIns === null, anonIns || '');
const viewIns = await anonThrows(
  `insert into public.page_views (path, kind, visitor_id, session_id) values ('/', 'page', 'vqqqqqqq', 'sqqqqqqq')`);
ok('anon can still log a page view', viewIns === null, viewIns || '');
// ...and takes it back out, so the counts below stay about the counts below.
await db.query(`delete from public.page_views where visitor_id = 'vqqqqqqq'`);

// ---- member accounts ------------------------------------------------------
// What an open sign-up hands a stranger after supabase-members.sql: their own
// profile, their own submissions, the public catalogue, and nothing else.
const asUser = async (uid, sql, params) => {
  await db.exec(`set role authenticated; set request.jwt.claim.sub = '${uid}';`);
  try { return await db.query(sql, params); }
  finally { await db.exec(`reset role; set request.jwt.claim.sub = '';`); }
};
const userThrows = async (uid, sql, params) => {
  try { await asUser(uid, sql, params); return null; } catch (e) { return e.message; }
};

const NEW_ID = '33333333-3333-3333-3333-333333333333';
await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, 'newbie@example.com',
  '{"full_name":"  คุณสมัครใหม่  ","phone":"0812345678","company":"ACME","consent":"true"}'::jsonb)`, [NEW_ID]);
const prof = (await db.query('select * from public.profiles where id = $1', [NEW_ID])).rows[0];
ok('sign-up creates a profile from the form', prof && prof.full_name === 'คุณสมัครใหม่' && prof.phone === '0812345678' && prof.company === 'ACME',
   JSON.stringify(prof));
ok('consent is timestamped at sign-up', prof && prof.consent_at !== null);

const HUGE_ID = '44444444-4444-4444-4444-444444444444';
const huge = await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, 'huge@example.com',
  jsonb_build_object('full_name', repeat('ก', 900), 'phone', repeat('9', 300)))`, [HUGE_ID]).then(() => null, e => e.message);
ok('absurd sign-up metadata never blocks sign-up', huge === null, huge || '');
ok('...it is cut to fit instead',
   (await db.query('select char_length(full_name) n from public.profiles where id = $1', [HUGE_ID])).rows[0].n === 120);

ok('existing accounts got a profile too',
   (await db.query('select count(*)::int c from public.profiles where id in ($1, $2)', [STAFF_ID, MEMBER_ID])).rows[0].c === 2);

const ownProf = await asUser(NEW_ID, 'select id from public.profiles');
ok('a member sees only their own profile', ownProf.rows.length === 1 && ownProf.rows[0].id === NEW_ID,
   `${ownProf.rows.length} rows`);
await asUser(NEW_ID, `update public.profiles set full_name = 'ชื่อใหม่' where id = $1`, [NEW_ID]);
ok('a member can edit their own name',
   (await db.query('select full_name from public.profiles where id = $1', [NEW_ID])).rows[0].full_name === 'ชื่อใหม่');
ok('a member cannot clear their own must-change flag directly',
   (await userThrows(NEW_ID, `update public.profiles set must_change_password = false where id = $1`, [NEW_ID])) !== null);
await asUser(NEW_ID, `update public.profiles set full_name = 'hijacked' where id = $1`, [MEMBER_ID]).catch(() => {});
ok("a member cannot edit someone else's profile",
   (await db.query('select full_name from public.profiles where id = $1', [MEMBER_ID])).rows[0].full_name !== 'hijacked');

ok('a member can see the published catalogue',
   (await asUser(NEW_ID, `select id from public.packages where type = 'retreat'`)).rows.length > 0);
ok('a member still cannot read articles out of packages',
   (await asUser(NEW_ID, `select id from public.packages where type = 'post'`)).rows.length === 0);

ok('anon cannot pin a submission onto an account',
   (await anonThrows(`insert into public.submissions (type, email, status, user_id) values ('contact', 'x@y.co', 'new', '${NEW_ID}')`)) !== null);
const ownIns = await userThrows(NEW_ID,
  `insert into public.submissions (type, email, status, user_id) values ('wellness', 'newbie@example.com', 'new', '${NEW_ID}')`);
ok('a member can submit as themselves', ownIns === null, ownIns || '');
ok("a member cannot submit as someone else",
   (await userThrows(NEW_ID, `insert into public.submissions (type, email, status, user_id) values ('wellness', 'z@z.co', 'new', '${MEMBER_ID}')`)) !== null);
// The same e-mail, submitted before signing in: must NOT surface in the account.
await db.query(`insert into public.submissions (type, email, status) values ('wellness', 'newbie@example.com', 'new')`);
const mine = await asUser(NEW_ID, 'select id, user_id from public.submissions');
ok('a member reads back only what they submitted signed in',
   mine.rows.length === 1 && mine.rows[0].user_id === NEW_ID, `${mine.rows.length} rows`);

const memberBody = (await asUser(NEW_ID, 'select public.bh_member_article_body($1) as b', [GATED])).rows[0].b;
ok('a signed-in member reads a gated article in full',
   Array.isArray(memberBody) && memberBody.length === (rows.find(r => r.id === GATED).data.body || []).length);
ok('anon cannot use the member reader', (await anonThrows('select public.bh_member_article_body($1)', [GATED])) !== null);

ok('staff can list members', (await asStaff('select * from public.bh_staff_members()')).rows.length >= 3);
ok('a member cannot list members', (await userThrows(NEW_ID, 'select * from public.bh_staff_members()')) !== null);

// the forgotten-password path
await db.query(`insert into auth.sessions (user_id) values ($1)`, [NEW_ID]);
await db.query(`insert into auth.refresh_tokens (user_id) values ($1)`, [NEW_ID]);
const temp = (await asStaff('select public.bh_issue_temp_password($1) as p', [NEW_ID])).rows[0].p;
ok('staff can issue a temporary password', typeof temp === 'string' && temp.length === 10);
ok('...made of characters you can read over the phone', /^[a-km-np-zA-HJ-NP-Z2-9]{10}$/.test(temp), temp);
ok('...stored as bcrypt that verifies',
   (await db.query(`select encrypted_password = crypt($1, encrypted_password) as ok, left(encrypted_password, 7) as h
                    from auth.users where id = $2`, [temp, NEW_ID])).rows[0].ok === true);
ok('...at cost 10, like Supabase',
   (await db.query(`select left(encrypted_password, 7) h from auth.users where id = $1`, [NEW_ID])).rows[0].h === '$2a$10$');
ok('...and forces a new password at next sign-in',
   (await db.query('select must_change_password m from public.profiles where id = $1', [NEW_ID])).rows[0].m === true);
ok('...and signs them out everywhere',
   (await db.query('select count(*)::int c from auth.sessions where user_id = $1', [NEW_ID])).rows[0].c === 0 &&
   (await db.query('select bool_and(revoked) r from auth.refresh_tokens where user_id = $1', [NEW_ID])).rows[0].r === true);
ok('a member cannot issue temporary passwords',
   (await userThrows(NEW_ID, 'select public.bh_issue_temp_password($1)', [MEMBER_ID])) !== null);
ok('staff passwords cannot be reset from the website',
   (await userThrows(STAFF_ID, 'select public.bh_issue_temp_password($1)', [STAFF_ID])) !== null);

await asUser(NEW_ID, 'select public.bh_password_changed()');
ok('changing the password clears the flag',
   (await db.query('select must_change_password m from public.profiles where id = $1', [NEW_ID])).rows[0].m === false);

// delete account
ok('staff cannot delete themselves from the website',
   (await userThrows(STAFF_ID, 'select public.bh_delete_my_account()')) !== null);
await asUser(NEW_ID, 'select public.bh_delete_my_account()');
ok('a member can delete their own account',
   (await db.query('select count(*)::int c from auth.users where id = $1', [NEW_ID])).rows[0].c === 0);
ok('...which takes their profile and signed-in submissions with it',
   (await db.query('select count(*)::int c from public.profiles where id = $1', [NEW_ID])).rows[0].c === 0 &&
   (await db.query('select count(*)::int c from public.submissions where user_id = $1', [NEW_ID])).rows[0].c === 0);
ok('...but not anything sent before signing in under the same e-mail',
   (await db.query(`select count(*)::int c from public.submissions where email = 'newbie@example.com' and user_id is null`)).rows[0].c === 1);
ok('anon cannot call delete', (await anonThrows('select public.bh_delete_my_account()')) !== null);

// ---- staff managing a member ---------------------------------------------
const M2 = '55555555-5555-5555-5555-555555555555';
await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, 'two@example.com',
  '{"full_name":"สมาชิก สอง","phone":"0811112222"}'::jsonb)`, [M2]);
await db.query(`insert into auth.identities (user_id, provider, identity_data) values ($1, 'email', '{"email":"two@example.com","sub":"x"}'::jsonb)`, [M2]);

ok('the member list reports suspension',
   'banned_until' in (await asStaff('select * from public.bh_staff_members() limit 1')).rows[0]);

await asStaff(`update public.profiles set full_name = 'แก้โดยทีม', phone = '0899990000' where id = $1`, [M2]);
ok('staff can edit a member\'s details',
   (await db.query('select full_name, phone from public.profiles where id = $1', [M2])).rows[0].full_name === 'แก้โดยทีม');
ok('...but not the must-change flag',
   (await userThrows(STAFF_ID, `update public.profiles set must_change_password = true where id = $1`, [M2])) !== null);

const newMail = (await asStaff(`select public.bh_admin_set_email($1, '  Two.New@Example.com ') as e`, [M2])).rows[0].e;
ok('staff can change a member\'s e-mail', newMail === 'two.new@example.com',  newMail);
ok('...in auth.users', (await db.query('select email from auth.users where id = $1', [M2])).rows[0].email === 'two.new@example.com');
ok('...and in the e-mail identity too',
   (await db.query(`select identity_data->>'email' e from auth.identities where user_id = $1`, [M2])).rows[0].e === 'two.new@example.com');
ok('an e-mail another account uses is refused',
   (await userThrows(STAFF_ID, `select public.bh_admin_set_email($1, 'member@example.com')`, [M2])) !== null);
ok('a malformed e-mail is refused',
   (await userThrows(STAFF_ID, `select public.bh_admin_set_email($1, 'not-an-email')`, [M2])) !== null);
ok("a staff account's e-mail is not changed from here",
   (await userThrows(STAFF_ID, `select public.bh_admin_set_email($1, 'x@y.co')`, [STAFF_ID])) !== null);
ok('a member cannot change e-mails',
   (await userThrows(MEMBER_ID, `select public.bh_admin_set_email($1, 'z@y.co')`, [M2])) !== null);

// attach: only ownerless rows with the member's own address, only the ids picked
const pre = await db.query(`insert into public.submissions (type, email, status) values
  ('wellness', 'two.new@example.com', 'new'),
  ('contact',  'TWO.NEW@example.com', 'new'),
  ('wellness', 'someone.else@example.com', 'new') returning id`);
const [a1, a2, a3] = pre.rows.map(r => Number(r.id));
const n = (await asStaff('select public.bh_admin_attach_submissions($1, $2::bigint[]) n', [M2, [a1, a3]])).rows[0].n;
ok('staff attach only what matches the member\'s e-mail', n === 1, `attached ${n}`);
ok('...the matching row is now theirs',
   (await db.query('select user_id from public.submissions where id = $1', [a1])).rows[0].user_id === M2);
ok("...someone else's row was left alone",
   (await db.query('select user_id from public.submissions where id = $1', [a3])).rows[0].user_id === null);
ok('...and a row nobody picked was left alone too',
   (await db.query('select user_id from public.submissions where id = $1', [a2])).rows[0].user_id === null);
ok('the member now sees it on their account',
   (await asUser(M2, 'select id from public.submissions')).rows.some(r => Number(r.id) === a1));
ok('a member cannot attach rows',
   (await userThrows(MEMBER_ID, 'select public.bh_admin_attach_submissions($1, $2::bigint[])', [MEMBER_ID, [a2]])) !== null);

// suspend
await db.query(`insert into auth.sessions (user_id) values ($1)`, [M2]);
await asStaff('select public.bh_admin_set_suspended($1, true)', [M2]);
const ban = (await db.query('select banned_until from auth.users where id = $1', [M2])).rows[0].banned_until;
ok('staff can suspend a member', ban && new Date(ban).getFullYear() === 2999, String(ban));
ok('...which signs them out now, not in an hour',
   (await db.query('select count(*)::int c from auth.sessions where user_id = $1', [M2])).rows[0].c === 0);
await asStaff('select public.bh_admin_set_suspended($1, false)', [M2]);
ok('...and lift it', (await db.query('select banned_until from auth.users where id = $1', [M2])).rows[0].banned_until === null);
ok('staff cannot be suspended from here',
   (await userThrows(STAFF_ID, 'select public.bh_admin_set_suspended($1, true)', [STAFF_ID])) !== null);
ok('a member cannot suspend anyone',
   (await userThrows(MEMBER_ID, 'select public.bh_admin_set_suspended($1, true)', [M2])) !== null);

// delete
ok('a member cannot delete someone else',
   (await userThrows(MEMBER_ID, 'select public.bh_admin_delete_member($1)', [M2])) !== null);
ok('staff cannot be deleted from here',
   (await userThrows(STAFF_ID, 'select public.bh_admin_delete_member($1)', [STAFF_ID])) !== null);
await asStaff('select public.bh_admin_delete_member($1)', [M2]);
ok('staff can delete a member',
   (await db.query('select count(*)::int c from auth.users where id = $1', [M2])).rows[0].c === 0);
ok('...with their profile and their submissions',
   (await db.query('select count(*)::int c from public.profiles where id = $1', [M2])).rows[0].c === 0 &&
   (await db.query('select count(*)::int c from public.submissions where id = $1', [a1])).rows[0].c === 0);
ok('...leaving rows that were never attached',
   (await db.query('select count(*)::int c from public.submissions where id = $1', [a2])).rows[0].c === 1);
ok('the internal guard is not callable by anyone directly',
   (await userThrows(STAFF_ID, 'select public.bh_assert_member_target($1)', [MEMBER_ID])) !== null);

// ---- analytics still adds up ---------------------------------------------
await db.exec(`insert into public.page_views (path, kind, visitor_id, session_id)
  values ('/blog/a','post','v1111111','s1111111'),
         ('/blog/a','gate','v1111111','s1111111'),
         ('/blog/a','unlock','v1111111','s1111111'),
         ('/','page','v2222222','s2222222');`);
const tot = (await asStaff(`select * from public.bh_stats_totals(30)`)).rows[0];
ok('gate and unlock are not counted as page views', Number(tot.views) === 2, `views=${tot.views}`);
const daily = (await asStaff(`select sum(views)::int s from public.bh_stats_daily(30)`)).rows[0].s;
ok('nor in the daily chart', daily === 2, `daily=${daily}`);
const g = (await asStaff(`select * from public.bh_stats_top(30, array['gate'], 10)`)).rows;
ok('but they are countable on their own', g.length === 1 && Number(g[0].views) === 1);

// Re-running one file must not undo another. bh_stats_totals and
// bh_stats_daily were defined in two files at once, so running the analytics
// one a second time quietly restored counters that count gate and unlock
// events as page views.
for (const f of files) await db.exec(readFileSync(DIR + f, 'utf8'));
const again = (await asStaff(`select * from public.bh_stats_totals(30)`)).rows[0];
ok('re-running every .sql file changes nothing', Number(again.views) === 2, `views=${again.views}`);

console.log(`\n${pass} passed / ${fail} failed\n`);
console.log('what the view would show:');
summary.sort((a, b) => a[3] - b[3]).forEach(([id, n, t, p]) =>
  console.log(`  ${id.slice(0, 32).padEnd(34)} ${String(n).padStart(2)} บล็อก -> ฟรี ${String(t).padStart(2)} = ${String(p).padStart(3)}%`));
process.exit(fail ? 1 : 0);
