// ============================================================
// B-Healthy — homepage topic images (public read)
// Loads admin-managed photos for each topic heading (Stay Wellness,
// Local Route, …) and hands them to js/main.js via window.BH_TOPICS,
// keyed "<group>/<key>" e.g. "tour/local-route".
// Falls back silently to the images on disk when unconfigured/empty.
// ============================================================
(function () {
  const cfg = window.BH_CONFIG || {};
  const url = (cfg.SUPABASE_URL || '').replace(/\/$/, '');
  const key = cfg.SUPABASE_ANON_KEY || '';
  if (!url || !key) return;

  const endpoint = url +
    '/rest/v1/packages?type=eq.topic&status=eq.published&select=id,data';

  fetch(endpoint, { headers: { apikey: key, Authorization: 'Bearer ' + key } })
    .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(rows => {
      if (!Array.isArray(rows) || !rows.length) return;
      const map = {};
      rows.forEach(row => {
        const d = row.data || {};
        if (!d.group || !d.key) return;
        const imgs = (Array.isArray(d.images) ? d.images : []).filter(Boolean);
        if (imgs.length) map[d.group + '/' + d.key] = imgs;
      });
      if (!Object.keys(map).length) return;
      window.BH_TOPICS = map;
      document.dispatchEvent(new CustomEvent('bh:topics-ready'));
    })
    .catch(() => { /* keep the on-disk fallback */ });
})();
