// ============================================================
// B-Healthy — package store (public read)
// If Supabase is configured (js/config.js), packages are loaded
// live from the DB and replace the hard-coded fallback data.
// If not configured / unreachable / empty, the hard-coded
// window.PACKAGES from packages.js + workshops-data.js is kept,
// so the site NEVER breaks. Render scripts re-run on the
// `bh:packages-ready` event.
// ============================================================
(function () {
  const cfg = window.BH_CONFIG || {};
  const url = (cfg.SUPABASE_URL || '').replace(/\/$/, '');
  const key = cfg.SUPABASE_ANON_KEY || '';
  if (!url || !key) return; // demo/fallback mode — keep hard-coded data

  const endpoint = url +
    '/rest/v1/packages?status=eq.published&select=id,type,sort,data,en&order=type.asc,sort.asc';

  fetch(endpoint, { headers: { apikey: key, Authorization: 'Bearer ' + key } })
    .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(rows => {
      if (!Array.isArray(rows) || !rows.length) return; // empty table → keep fallback
      const PACKAGES = {}, EN = {}, WORKSHOPS = {}, retreats = [], workshops = [];
      rows.forEach(row => {
        const obj = Object.assign({}, row.data || {});
        obj.id = row.id;
        obj.type = row.type;
        if (row.en && Object.keys(row.en).length) EN[row.id] = row.en;
        // Bucket by explicit type. Membership tiers live in the same table but
        // have a different shape (no theme/tagline) and are rendered by
        // membership.js — they must never leak into the retreat/workshop grids.
        if (row.type === 'workshop') { PACKAGES[row.id] = obj; workshops.push(row.id); WORKSHOPS[row.id] = obj; }
        else if (row.type === 'retreat') { PACKAGES[row.id] = obj; retreats.push(row.id); }
      });
      window.PACKAGES = PACKAGES;
      window.PACKAGES_EN = EN;
      window.PACKAGE_ORDER = retreats;
      window.WORKSHOP_ORDER = workshops;
      window.WORKSHOPS = WORKSHOPS;
      document.dispatchEvent(new CustomEvent('bh:packages-ready'));
    })
    .catch(() => { /* network / DB error — keep hard-coded fallback silently */ });
})();
