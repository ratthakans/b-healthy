// ============================================================
// B-Healthy — the .pcard grid, shared by retreats and workshops
//
// Both pages render the identical card; only the data source and the
// filter dimension differ (retreats filter by province, workshops by
// focus). Keeping one renderer means a fix to the card — escaping, an
// attribute, a layout tweak — lands on both pages at once.
//
//   bhRenderCards({
//     gridId, filtersId, emptyId,
//     source()       -> { items:[pkg], en:{id:overrides} }
//     filterAttr     -> 'province' | 'category'
//     pills(items)   -> [{ f, th, en }]   ('*' = show everything)
//   })
// ============================================================
(function () {
  const esc = window.bhEsc, escAttr = window.bhEscAttr;

  function card(p, en) {
    const theme = p.theme || {};
    const tagline = Array.isArray(p.tagline) ? p.tagline : [];
    const price = p.priceNow === 'ติดต่อสอบถาม'
      ? `<span class="pcard__price-call" data-en="${escAttr(en.priceNow || 'Contact us')}">ติดต่อสอบถาม</span>`
      : `${p.priceOld ? `<span class="pcard__price-old">${esc(p.priceOld)}</span>` : ''}
         <span class="pcard__price-now">${esc(p.priceNow)}</span>
         <span class="pcard__price-unit" data-en="${escAttr(en.priceUnit || p.priceUnit)}">${esc(p.priceUnit)}</span>`;

    return `
      <a class="pcard" href="package.html?id=${encodeURIComponent(p.id)}"
         data-province="${esc(p.province || '')}" data-category="${esc(p.category || '')}"
         style="--pc:${esc(theme.primary || '#1ECAD3')};--pa:${esc(theme.accent || '#425CC7')}">
        <div class="pcard__media">
          <img src="${esc(p.hero)}" alt="${esc(p.name)}" loading="lazy" />
          <span class="pcard__badge" data-en="${escAttr(en.duration || p.duration)}">${esc(p.duration)}</span>
        </div>
        <div class="pcard__body">
          <p class="pcard__kicker">${esc(tagline.join(' · '))}</p>
          <h3 class="pcard__name">${esc(p.name)}</h3>
          <p class="pcard__loc"><svg viewBox="0 0 24 24" width="13" height="13"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg> <span data-en="${escAttr(en.location || p.location)}">${esc(p.location)}</span></p>
          <p class="pcard__group" data-en="${escAttr(en.group || p.group)}">${esc(p.group)}</p>
          <div class="pcard__foot">
            <div class="pcard__price">${price}</div>
            <span class="pcard__cta" data-en="View details &amp; book →">ดูรายละเอียด &amp; จอง →</span>
          </div>
        </div>
      </a>`;
  }

  window.bhRenderCards = function (opts) {
    const grid = document.getElementById(opts.gridId);
    const filtersEl = opts.filtersId ? document.getElementById(opts.filtersId) : null;
    const emptyEl = opts.emptyId ? document.getElementById(opts.emptyId) : null;
    if (!grid) return;

    function render() {
      const src = opts.source();
      if (!src) return;                       // data not loaded yet
      const { items, en: ALL_EN } = src;

      // Records are admin-editable, so tolerate missing fields — one bad row
      // must never blank the whole grid.
      grid.innerHTML = items.map(p => card(p, (ALL_EN || {})[p.id] || {})).join('');

      if (filtersEl) {
        filtersEl.innerHTML = opts.pills(items).map((p, i) =>
          `<button class="prog__filter${i === 0 ? ' is-active' : ''}" data-filter="${esc(p.f)}" data-en="${escAttr(p.en)}">${esc(p.th)}</button>`
        ).join('');
      }

      if (window.bhApplyLang) window.bhApplyLang();
    }

    // Bound once via delegation — cards are re-queried on each click.
    if (filtersEl) {
      filtersEl.addEventListener('click', e => {
        const btn = e.target.closest('.prog__filter');
        if (!btn) return;
        filtersEl.querySelectorAll('.prog__filter').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const f = btn.dataset.filter;
        let shown = 0;
        grid.querySelectorAll('.pcard').forEach(el => {
          const match = f === '*' || el.dataset[opts.filterAttr] === f;
          el.classList.toggle('is-hidden', !match);
          if (match) shown++;
        });
        if (emptyEl) emptyEl.hidden = shown > 0;
      });
    }

    render();
    document.addEventListener('bh:packages-ready', render);
  };
})();
