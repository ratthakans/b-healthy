// ============================================================
// B-Healthy — blog store (public read)
// Mirrors js/store.js: if Supabase is configured, published `post`
// rows replace the hard-coded window.BLOG_POSTS from blog-data.js.
// If it's unconfigured / unreachable / empty, the built-in articles
// stay, so the blog NEVER renders blank. blog.js and post.js re-run
// on the `bh:posts-ready` event.
// ============================================================
(function () {
  const cfg = window.BH_CONFIG || {};
  const url = (cfg.SUPABASE_URL || '').replace(/\/$/, '');
  const key = cfg.SUPABASE_ANON_KEY || '';
  if (!url || !key) return; // demo/fallback mode — keep the bundled articles

  const endpoint = url +
    '/rest/v1/packages?type=eq.post&status=eq.published&select=id,sort,data&order=sort.asc';

  fetch(endpoint, { headers: { apikey: key, Authorization: 'Bearer ' + key } })
    .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(rows => {
      if (!Array.isArray(rows) || !rows.length) return; // empty table → keep fallback

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
          cover: d.cover || '',
          coverAlt: d.coverAlt || '',
          coverAltEn: d.coverAltEn || d.coverAlt || '',
          body: Array.isArray(d.body) ? d.body : []
        };
      }).filter(p => p.title && p.cover);

      if (!posts.length) return;

      // Newest first, same as blog-data.js does for the bundled set.
      posts.sort((a, b) => (a.date < b.date ? 1 : -1));
      window.BLOG_POSTS = posts;
      document.dispatchEvent(new CustomEvent('bh:posts-ready'));
    })
    .catch(() => { /* network / DB error — keep the bundled articles silently */ });
})();
