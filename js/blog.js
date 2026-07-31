// ============================================================
// B-Healthy — render article cards + category filter on blog.html
// ============================================================
(function () {
  const grid = document.getElementById('blogGrid');
  const filtersEl = document.getElementById('blogFilters');
  const emptyEl = document.getElementById('blogEmpty');
  if (!grid || !window.BLOG_POSTS) return;

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function render() {
  const posts = window.BLOG_POSTS || [];

  grid.innerHTML = posts.map((p, i) => {
    const date = window.bhBlogDate(p.date);
    return `
      <a class="bcard" href="/blog/${encodeURIComponent(p.id)}" data-category="${esc(p.category)}">
        <div class="bcard__media">
          <img src="${esc(p.cover)}" alt="${esc(p.coverAlt)}" ${i > 2 ? 'loading="lazy"' : ''} />
          <span class="bcard__cat" data-en="${esc(p.categoryEn)}">${esc(p.category)}</span>
        </div>
        <div class="bcard__body">
          <p class="bcard__meta">
            <span data-en="${esc(date.en)}">${esc(date.th)}</span>
            <span class="bcard__dot"></span>
            <span data-en="${p.readMins} min read">อ่าน ${p.readMins} นาที</span>
          </p>
          <h3 class="bcard__title" data-en="${esc(p.titleEn)}">${esc(p.title)}</h3>
          <p class="bcard__excerpt" data-en="${esc(p.excerptEn)}">${esc(p.excerpt)}</p>
          <span class="bcard__cta" data-en="Read article →">อ่านบทความ →</span>
        </div>
      </a>`;
  }).join('');

  // --- Filter pills, built from the categories actually present ---
  const seen = [];
  posts.forEach(p => { if (!seen.some(c => c.th === p.category)) seen.push({ th: p.category, en: p.categoryEn }); });
  filtersEl.innerHTML =
    `<button class="prog__filter is-active" data-filter="*" data-en="All">ทั้งหมด</button>` +
    seen.map(c => `<button class="prog__filter" data-filter="${esc(c.th)}" data-en="${esc(c.en)}">${esc(c.th)}</button>`).join('');

  if (emptyEl) emptyEl.hidden = posts.length > 0;

  // apply current language to freshly rendered cards/filters
  if (window.bhApplyLang) window.bhApplyLang();
  }

  // Filter clicks — bound once via delegation (cards re-queried live)
  filtersEl.addEventListener('click', e => {
    const btn = e.target.closest('.prog__filter');
    if (!btn) return;
    filtersEl.querySelectorAll('.prog__filter').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const f = btn.dataset.filter;
    let shown = 0;
    grid.querySelectorAll('.bcard').forEach(card => {
      const match = f === '*' || card.dataset.category === f;
      card.classList.toggle('is-hidden', !match);
      if (match) shown++;
    });
    if (emptyEl) emptyEl.hidden = shown > 0;
  });

  render();
  document.addEventListener('bh:posts-ready', render);
})();
