// ============================================================
// B-Healthy — render package cards + category filter on program.html
// ============================================================
(function () {
  const grid = document.getElementById('progGrid');
  const filtersEl = document.getElementById('progFilters');
  const emptyEl = document.getElementById('progEmpty');
  if (!grid || !window.PACKAGES) return;

  const EN = window.PACKAGES_EN || {};

  // --- Cards ---
  grid.innerHTML = window.PACKAGE_ORDER.map(id => {
    const p = window.PACKAGES[id];
    const en = EN[id] || {};
    const price = p.priceNow === 'ติดต่อสอบถาม'
      ? `<span class="pcard__price-call" data-en="${en.priceNow || 'Contact us'}">ติดต่อสอบถาม</span>`
      : `${p.priceOld ? `<span class="pcard__price-old">${p.priceOld}</span>` : ''}
         <span class="pcard__price-now">${p.priceNow}</span>
         <span class="pcard__price-unit" data-en="${en.priceUnit || p.priceUnit}">${p.priceUnit}</span>`;

    return `
      <a class="pcard" href="package.html?id=${p.id}" data-province="${p.province || ''}" data-category="${p.category || ''}" style="--pc:${p.theme.primary};--pa:${p.theme.accent}">
        <div class="pcard__media">
          <img src="${p.hero}" alt="${p.name}" loading="lazy" />
          <span class="pcard__badge" data-en="${en.duration || p.duration}">${p.duration}</span>
          ${p.category ? `<span class="pcard__cat">${p.category}</span>` : ''}
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

  const cards = [...grid.querySelectorAll('.pcard')];

  // --- Filter pills (by location / province — fixed destination list) ---
  const provinces = ['Hua Hin', 'Amphawa', 'Kanchanaburi', 'Krabi', 'Phuket', 'Chiang Mai'];
  const pills = ['ทั้งหมด', ...provinces];
  filtersEl.innerHTML = pills.map((label, i) =>
    `<button class="prog__filter${i === 0 ? ' is-active' : ''}" data-filter="${i === 0 ? '*' : label}"${i === 0 ? ' data-en="All"' : ''}>${label}</button>`
  ).join('');

  filtersEl.addEventListener('click', e => {
    const btn = e.target.closest('.prog__filter');
    if (!btn) return;
    filtersEl.querySelectorAll('.prog__filter').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    const f = btn.dataset.filter;
    let shown = 0;
    cards.forEach(card => {
      const match = f === '*' || card.dataset.province === f;
      card.classList.toggle('is-hidden', !match);
      if (match) shown++;
    });
    if (emptyEl) emptyEl.hidden = shown > 0;
  });

  // apply current language to freshly rendered cards/filters
  if (window.bhApplyLang) window.bhApplyLang();
})();
