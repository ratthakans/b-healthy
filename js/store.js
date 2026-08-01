// ============================================================
// B-Healthy — package store (public read)
// Published rows replace the hard-coded window.PACKAGES from packages.js +
// workshops-data.js. On an unconfigured / unreachable / empty database the
// bundled data is kept, so the site NEVER renders blank. Render scripts
// re-run on the `bh:packages-ready` event.
// ============================================================
(function () {
  // Articles and topic photos share this table, so the type filter goes to the
  // server — otherwise every package page downloads the whole blog as well.
  window.bhFetchRows({
    type: 'in.(retreat,workshop,membership)',
    select: 'id,type,sort,data,en',
    // id.asc is a tiebreaker, not decoration: several rows share sort:0 and
    // Postgres is free to return ties in any order, so the grid reshuffled
    // between page loads.
    order: 'type.asc,sort.asc,id.asc'
  }).then(rows => {
    if (!rows) return;                       // keep the bundled fallback

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
  });
})();
