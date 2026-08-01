// ============================================================
// B-Healthy — homepage topic images (public read)
// Loads admin-managed photos for each topic heading (Stay Wellness,
// Local Route, …) and hands them to js/main.js via window.BH_TOPICS,
// keyed "<group>/<key>" e.g. "tour/local-route".
// Falls back silently to the images on disk when unconfigured/empty.
// ============================================================
(function () {
  window.bhFetchRows({ type: 'eq.topic', select: 'id,data' }).then(rows => {
    if (!rows) return;                       // keep the on-disk fallback

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
  });
})();
