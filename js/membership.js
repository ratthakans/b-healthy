// ============================================================
// B-Healthy — membership tiers (public read)
// If Supabase is configured AND has published `membership` rows,
// they replace the hard-coded .ctier cards inside #memTiers.
// Otherwise the built-in cards stay (site never breaks).
// ============================================================
(function () {
  const grid = document.getElementById('memTiers');
  if (!grid) return;
  const cfg = window.BH_CONFIG || {};
  const url = (cfg.SUPABASE_URL || '').replace(/\/$/, '');
  const key = cfg.SUPABASE_ANON_KEY || '';
  if (!url || !key) return; // fallback: keep hard-coded cards

  const ICONS = {
    platinum: '<path fill="currentColor" d="M5 3h14l3 6-10 12L2 9z"/>',
    gold: '<path fill="currentColor" d="M12 2l3 6.5 7 .6-5.3 4.6L18.5 21 12 17.3 5.5 21l1.8-7.3L2 9.1l7-.6z"/>',
    silver: '<path fill="currentColor" d="M12 2l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V5z"/>'
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const endpoint = url +
    '/rest/v1/packages?type=eq.membership&status=eq.published&select=id,sort,data&order=sort.asc';

  fetch(endpoint, { headers: { apikey: key, Authorization: 'Bearer ' + key } })
    .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(rows => {
      if (!Array.isArray(rows) || !rows.length) return; // no membership rows → keep fallback
      grid.innerHTML = rows.map(row => {
        const d = row.data || {};
        const style = ['platinum', 'gold', 'silver'].includes(d.style) ? d.style : 'platinum';
        const feats = Array.isArray(d.features) ? d.features : [];
        return `
      <div class="ctier ctier--${style}">
        <div class="ctier__head">
          <div class="ctier__tier">Corporate</div>
          <div class="ctier__name">${esc(d.name)}</div>
          <div class="ctier__ic"><svg viewBox="0 0 24 24" width="22" height="22">${ICONS[style]}</svg></div>
        </div>
        <div class="ctier__body">
          <div class="ctier__price"><b>${esc(d.price)}</b><span data-en="THB">บาท</span></div>
          ${d.credits ? `<div class="ctier__credits">${'ได้รับ '}<em>${esc(d.credits)}</em>${' เครดิต'}</div>` : ''}
          ${d.bonus ? `<span class="ctier__bonus">${esc(d.bonus)}</span>` : ''}
          <ul class="ctier__list">${feats.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
          <a href="contact.html" class="btn btn--primary" data-en="Get started">เริ่มต้นใช้งาน</a>
        </div>
      </div>`;
      }).join('');
      if (window.bhApplyLang) window.bhApplyLang();
    })
    .catch(() => { /* keep hard-coded fallback */ });
})();
