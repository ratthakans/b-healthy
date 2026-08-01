// ============================================================
// B-Healthy — sitemap.xml (Vercel Serverless Function)
//
// Serves /sitemap.xml (see the rewrite in vercel.json) so articles added
// from /admin.html appear without anyone hand-editing a file.
//
// Source order:
//   1. published `post` rows in Supabase — the live source once
//      supabase-blog.sql has run and the articles are imported
//   2. js/blog-index.js — the bundled fallback, used if the DB is
//      unreachable or still empty, so the sitemap is never blank
//
// The host is taken from the request, so this keeps working when the
// site moves to b-healthy.co without any edit here.
//
// Optional env vars (defaults are the same publishable values shipped in
// js/config.js — the anon key is safe to expose, it is RLS-protected):
//   SUPABASE_URL
//   SUPABASE_ANON_KEY
// ============================================================

const SUPABASE_URL = process.env.SUPABASE_URL || "https://gngibdrjcnshyqkomkjs.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_8JnUdebfbaiZmmBEKu2LkQ_4U_x3OKk";

// Static pages, in the priority order we want crawlers to see.
const PAGES = [
  ["/", "1.0"],
  ["/program", "0.9"],
  ["/workshops", "0.9"],
  ["/membership", "0.9"],
  ["/blog", "0.8"],
  ["/about", "0.7"],
  ["/contact", "0.7"],
];

const xmlEsc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

// The bundled articles, so a DB outage still yields a complete sitemap.
// Only the index is needed here — a sitemap entry is an id and a date, so the
// article bodies (js/blog-bodies.js) are deliberately not loaded.
function bundledPosts() {
  try {
    global.window = global.window || {};
    require("../js/blog-index.js");
    return (global.window.BLOG_POSTS || []).map(p => ({ id: p.id, date: p.date }));
  } catch (e) {
    console.error("sitemap: bundled fallback failed", e);
    return [];
  }
}

async function livePosts() {
  const url = SUPABASE_URL.replace(/\/$/, "") +
    "/rest/v1/packages?type=eq.post&status=eq.published&select=id,data,updated_at";
  const r = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
  });
  if (!r.ok) throw new Error("supabase " + r.status);
  const rows = await r.json();
  if (!Array.isArray(rows)) throw new Error("unexpected payload");
  return rows
    .map(row => ({ id: row.id, date: (row.data || {}).date || (row.updated_at || "").slice(0, 10) }))
    .filter(p => p.id);
}

// The site also answers on b-healthy-ten.vercel.app. Deriving the origin from
// the request would make that copy advertise its own URLs to crawlers and split
// ranking across two hosts, so the sitemap always names the canonical one.
// Override with SITE_ORIGIN if the domain ever changes.
const CANONICAL_ORIGIN = (process.env.SITE_ORIGIN || "https://www.b-healthy.co").replace(/\/$/, "");

module.exports = async (req, res) => {
  const origin = CANONICAL_ORIGIN;

  let posts = [];
  try {
    posts = await livePosts();
  } catch (e) {
    console.error("sitemap: falling back to bundled articles —", e.message);
  }
  if (!posts.length) posts = bundledPosts();

  const urls = [
    ...PAGES.map(([path, priority]) =>
      `  <url><loc>${xmlEsc(origin + path)}</loc><priority>${priority}</priority></url>`),
    ...posts.map(p => {
      const loc = xmlEsc(`${origin}/blog/${encodeURIComponent(p.id)}`);
      const lastmod = /^\d{4}-\d{2}-\d{2}$/.test(p.date || "")
        ? `<lastmod>${p.date}</lastmod>` : "";
      return `  <url><loc>${loc}</loc>${lastmod}<priority>0.6</priority></url>`;
    }),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  // Crawlers re-check often; an hour of CDN cache keeps this cheap while
  // still picking up a newly published article quickly.
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(xml);
};
