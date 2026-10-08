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
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
`);

const files = ['supabase-packages.sql', 'supabase-blog.sql', 'supabase-submissions.sql',
               'supabase-analytics.sql', 'supabase-article-gate.sql'];
for (const f of files) {
  try {
    await db.exec(readFileSync(DIR + f, 'utf8'));
    // mirror Supabase's default grants onto whatever that file just created
    await db.exec('grant all on all tables in schema public to anon, authenticated;');
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
const GATED = rows[0].id, FREE = rows[rows.length - 1].id;
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
   freeRow.data.body.length === rows.find(r => r.id === FREE).data.body.length);
ok('free article carries no flag', freeRow.data.gated === undefined);

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

// ---- analytics still adds up ---------------------------------------------
await db.exec(`insert into public.page_views (path, kind, visitor_id, session_id)
  values ('/blog/a','post','v1111111','s1111111'),
         ('/blog/a','gate','v1111111','s1111111'),
         ('/blog/a','unlock','v1111111','s1111111'),
         ('/','page','v2222222','s2222222');`);
const tot = (await db.query(`select * from public.bh_stats_totals(30)`)).rows[0];
ok('gate and unlock are not counted as page views', Number(tot.views) === 2, `views=${tot.views}`);
const daily = (await db.query(`select sum(views)::int s from public.bh_stats_daily(30)`)).rows[0].s;
ok('nor in the daily chart', daily === 2, `daily=${daily}`);
const g = (await db.query(`select * from public.bh_stats_top(30, array['gate'], 10)`)).rows;
ok('but they are countable on their own', g.length === 1 && Number(g[0].views) === 1);

// Re-running one file must not undo another. bh_stats_totals and
// bh_stats_daily were defined in two files at once, so running the analytics
// one a second time quietly restored counters that count gate and unlock
// events as page views.
for (const f of files) await db.exec(readFileSync(DIR + f, 'utf8'));
const again = (await db.query(`select * from public.bh_stats_totals(30)`)).rows[0];
ok('re-running every .sql file changes nothing', Number(again.views) === 2, `views=${again.views}`);

console.log(`\n${pass} passed / ${fail} failed\n`);
console.log('what the view would show:');
summary.sort((a, b) => a[3] - b[3]).forEach(([id, n, t, p]) =>
  console.log(`  ${id.slice(0, 32).padEnd(34)} ${String(n).padStart(2)} บล็อก -> ฟรี ${String(t).padStart(2)} = ${String(p).padStart(3)}%`));
process.exit(fail ? 1 : 0);
