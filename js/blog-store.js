// ============================================================
// B-Healthy — blog store (public read)
// Published `post` rows replace the bundled window.BLOG_POSTS from
// blog-index.js. On an unconfigured / unreachable / empty database the
// bundled articles stay, so the blog NEVER renders blank. blog.js and
// post.js re-run on the `bh:posts-ready` event.
// ============================================================
(function () {
  // id.asc breaks ties — rows sharing a sort value would otherwise come back
  // in an arbitrary order and the list could reshuffle between loads.
  // posts_public, not packages: the view is what cuts a gated article down to
  // its teaser, and once supabase-article-gate.sql has run anonymous readers
  // are no longer allowed at the table at all.
  //
  // The fallback is for the window before that SQL exists — without it, deploy
  // order would decide whether the blog works. It is not a way around the gate:
  // the same SQL that creates the view also closes `packages` to anonymous
  // reads of articles, so once the gate is real this second attempt comes back
  // empty. Until then the blog behaves exactly as it does today.
  const fetchPosts = () =>
    window.bhFetchRows({ from: 'posts_public', select: 'id,sort,data', order: 'sort.asc,id.asc' })
      .then(rows => rows ||
        window.bhFetchRows({ type: 'eq.post', select: 'id,sort,data', order: 'sort.asc,id.asc' }));

  fetchPosts()
    .then(rows => {
      if (!rows) return;                     // keep the bundled articles

      // Articles are admin-editable, so tolerate missing fields — one bad
      // record must never blank the whole blog.
      const posts = rows.map(row => {
        const d = row.data || {};
        return {
          id: row.id,
          category: d.category || 'บทความ',
          categoryEn: d.categoryEn || d.category || 'Articles',
          date: d.date || '',
          readMins: Number(d.readMins) || 5,
          author: d.author || 'ทีม B-Healthy',
          authorEn: d.authorEn || 'B-Healthy Team',
          title: d.title || row.id,
          titleEn: d.titleEn || d.title || row.id,
          excerpt: d.excerpt || '',
          excerptEn: d.excerptEn || d.excerpt || '',
          gated: !!d.gated,                 // set by the view, never by the browser
          cover: d.cover || '',
          coverAlt: d.coverAlt || '',
          coverAltEn: d.coverAltEn || d.coverAlt || '',
          body: Array.isArray(d.body) ? d.body : []
        };
      }).filter(p => p.title && p.cover);

      if (!posts.length) return;

      posts.sort((a, b) => (a.date < b.date ? 1 : -1));   // newest first
      window.BLOG_POSTS = posts;
    })
    .catch(() => {})
    .then(() => {
      // Fires whatever the database said, including nothing. Article text no
      // longer ships in the bundle, so post.js needs to tell "still loading"
      // apart from "there is genuinely no body" — otherwise every reader sees
      // an empty article for a moment and a broken one for good on an outage.
      window.BH_POSTS_READY = true;
      document.dispatchEvent(new CustomEvent('bh:posts-ready'));
    });
})();
