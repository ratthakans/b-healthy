// ============================================================
// B-Healthy — retreat cards on program.html
// The card markup and filter behaviour live in js/cards.js, shared with
// workshops.html. This file only declares where the data comes from and
// what the filter pills are.
// ============================================================
(function () {
  // Fixed destination list — deliberately not derived from the data, so a
  // province we are opening can appear before a package exists for it.
  const PROVINCES = ['Hua Hin', 'Amphawa', 'Kanchanaburi', 'Krabi', 'Phuket', 'Chiang Mai'];

  window.bhRenderCards({
    gridId: 'progGrid',
    filtersId: 'progFilters',
    emptyId: 'progEmpty',
    filterAttr: 'province',
    source() {
      if (!window.PACKAGES || !window.PACKAGE_ORDER) return null;
      return {
        items: window.PACKAGE_ORDER.filter(id => window.PACKAGES[id]).map(id => window.PACKAGES[id]),
        en: window.PACKAGES_EN || {}
      };
    },
    pills() {
      return [{ f: '*', th: 'ทั้งหมด', en: 'All' },
        ...PROVINCES.map(p => ({ f: p, th: p, en: p }))];
    }
  });
})();
