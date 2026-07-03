// ============================================================
// B-Healthy — render package cards on program.html
// ============================================================
(function () {
  const grid = document.getElementById('progGrid');
  if (!grid || !window.PACKAGES) return;

  const cards = window.PACKAGE_ORDER.map(id => {
    const p = window.PACKAGES[id];
    const price = p.priceNow === 'ติดต่อสอบถาม'
      ? `<span class="pcard__price-call">ติดต่อสอบถาม</span>`
      : `${p.priceOld ? `<span class="pcard__price-old">${p.priceOld}</span>` : ''}
         <span class="pcard__price-now">${p.priceNow}</span>
         <span class="pcard__price-unit">${p.priceUnit}</span>`;

    return `
      <a class="pcard" href="package.html?id=${p.id}" style="--pc:${p.theme.primary};--pa:${p.theme.accent}">
        <div class="pcard__media">
          <img src="${p.hero}" alt="${p.name}" loading="lazy" />
          <span class="pcard__badge">${p.duration}</span>
        </div>
        <div class="pcard__body">
          <p class="pcard__kicker">${p.tagline.join(' · ')}</p>
          <h3 class="pcard__name">${p.name}</h3>
          <p class="pcard__loc"><svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg> ${p.location}</p>
          <p class="pcard__group">${p.group}</p>
          <div class="pcard__foot">
            <div class="pcard__price">${price}</div>
            <span class="pcard__cta">ดูรายละเอียด &amp; จอง →</span>
          </div>
        </div>
      </a>`;
  }).join('');

  grid.innerHTML = cards;
})();
