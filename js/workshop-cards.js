// ============================================================
// B-Healthy — render workshop cards + track filter on workshops.html
// Uses the SAME .pcard component as retreats (program.js) so the
// two look identical → marketplace consistency.
// ============================================================
(function () {
  const grid = document.getElementById('wkGrid');
  const filtersEl = document.getElementById('wkFilters');
  const emptyEl = document.getElementById('wkEmpty');
  if (!grid) return;

  function render() {
  if (!window.WORKSHOPS || !window.WORKSHOP_ORDER) return;
  const EN = window.WORKSHOPS_EN || {};

  // --- Cards (identical markup to retreat .pcard) ---
  grid.innerHTML = window.WORKSHOP_ORDER.map(id => {
    const p = window.WORKSHOPS[id];
    const en = EN[id] || {};
    const price = p.priceNow === 'ติดต่อสอบถาม'
      ? `<span class="pcard__price-call" data-en="${en.priceNow || 'Contact us'}">ติดต่อสอบถาม</span>`
      : `${p.priceOld ? `<span class="pcard__price-old">${p.priceOld}</span>` : ''}
         <span class="pcard__price-now">${p.priceNow}</span>
         <span class="pcard__price-unit" data-en="${en.priceUnit || p.priceUnit}">${p.priceUnit}</span>`;

    return `
      <a class="pcard" href="package.html?id=${p.id}" data-category="${p.category || ''}" style="--pc:${p.theme.primary};--pa:${p.theme.accent}">
        <div class="pcard__media">
          <img src="${p.hero}" alt="${p.name}" loading="lazy" />
          <span class="pcard__badge" data-en="${en.duration || p.duration}">${p.duration}</span>
        </div>
        <div class="pcard__body">
          <p class="pcard__kicker">${p.tagline.join(' · ')}</p>
          <h3 class="pcard__name">${p.name}</h3>
          <p class="pcard__loc"><svg viewBox="0 0 24 24" width="13" height="13"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg> <span data-en="${en.location || p.location}">${p.location}</span></p>
          <p class="pcard__group" data-en="${en.group || p.group}">${p.group}</p>
          <div class="pcard__foot">
            <div class="pcard__price">${price}</div>
            <span class="pcard__cta" data-en="View details &amp; book →">ดูรายละเอียด &amp; จอง →</span>
          </div>
        </div>
      </a>`;
  }).join('');

  // --- Filter pills (by focus: Body / Mind) ---
  if (filtersEl) {
    const cats = [...new Set(window.WORKSHOP_ORDER.map(id => window.WORKSHOPS[id].category))];
    const labelEn = { 'Body': 'Body', 'Mind': 'Mind' };
    const pills = [{ f: '*', th: 'ทั้งหมด', en: 'All' }, ...cats.map(c => ({ f: c, th: c, en: labelEn[c] || c }))];
    filtersEl.innerHTML = pills.map((p, i) =>
      `<button class="prog__filter${i === 0 ? ' is-active' : ''}" data-filter="${p.f}" data-en="${p.en}">${p.th}</button>`
    ).join('');
  }

  if (window.bhApplyLang) window.bhApplyLang();
  }

  // Filter clicks — bound once via delegation (cards re-queried live)
  if (filtersEl) {
    filtersEl.addEventListener('click', e => {
      const btn = e.target.closest('.prog__filter');
      if (!btn) return;
      filtersEl.querySelectorAll('.prog__filter').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const f = btn.dataset.filter;
      let shown = 0;
      grid.querySelectorAll('.pcard').forEach(card => {
        const match = f === '*' || card.dataset.category === f;
        card.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });
      if (emptyEl) emptyEl.hidden = shown > 0;
    });
  }

  render();
  document.addEventListener('bh:packages-ready', render);
})();
