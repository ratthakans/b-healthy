// ============================================================
// B-Healthy — lightweight TH/EN i18n
// Any element carrying data-en shows Thai by default and English
// when EN is active. data-en-ph does the same for input placeholders.
// Dynamic renderers call window.bhApplyLang() after they inject markup.
// ============================================================
(function () {
  const KEY = 'bh-lang';
  // English-only for now (TH/EN toggle disabled). Flip back to
  // `localStorage.getItem(KEY) || 'th'` to re-enable bilingual switching.
  const get = () => 'en';

  function apply(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-en]').forEach(el => {
      if (el.__th === undefined) el.__th = el.innerHTML;      // remember Thai once
      el.innerHTML = (lang === 'en') ? el.getAttribute('data-en') : el.__th;
    });

    document.querySelectorAll('[data-en-ph]').forEach(el => {
      if (el.__thph === undefined) el.__thph = el.getAttribute('placeholder') || '';
      el.setAttribute('placeholder', (lang === 'en') ? el.getAttribute('data-en-ph') : el.__thph);
    });

    document.querySelectorAll('#navLang').forEach(btn => {
      const s = btn.querySelectorAll('span:not(.sep)');
      if (s.length >= 2) {
        s[0].classList.toggle('on', lang !== 'en');
        s[1].classList.toggle('on', lang === 'en');
      }
    });
  }

  window.bhApplyLang = () => apply(get());
  window.bhSetLang = (l) => { localStorage.setItem(KEY, l); apply(l); };
  window.bhToggleLang = () => window.bhSetLang(get() === 'th' ? 'en' : 'th');

  document.addEventListener('click', e => {
    if (e.target.closest('#navLang')) { e.preventDefault(); window.bhToggleLang(); }
  });

  const run = () => apply(get());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
