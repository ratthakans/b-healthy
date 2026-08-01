// ============================================================
// B-Healthy — workshop cards on workshops.html
// Same .pcard component as retreats (js/cards.js) so the two grids stay
// visually identical. This file only declares the data source and pills.
// ============================================================
(function () {
  window.bhRenderCards({
    gridId: 'wkGrid',
    filtersId: 'wkFilters',
    emptyId: 'wkEmpty',
    filterAttr: 'category',          // workshops filter by focus: Body / Mind
    source() {
      if (!window.WORKSHOPS || !window.WORKSHOP_ORDER) return null;
      return {
        items: window.WORKSHOP_ORDER.filter(id => window.WORKSHOPS[id]).map(id => window.WORKSHOPS[id]),
        en: window.WORKSHOPS_EN || {}
      };
    },
    pills(items) {
      // Derived from the data — a new focus appears as soon as one is used.
      const cats = [...new Set(items.map(p => p.category).filter(Boolean))];
      return [{ f: '*', th: 'ทั้งหมด', en: 'All' },
        ...cats.map(c => ({ f: c, th: c, en: c }))];
    }
  });
})();
