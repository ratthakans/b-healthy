// ============================================================
// B-Healthy — reveal sections on scroll (fade + slide up)
// Classes are added by JS, so if this script fails the content
// simply shows normally (nothing is hidden without the observer).
// ============================================================
(function () {
  // Respect users who prefer no motion.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var skip = /(^|\s)(hero|prog-hero|feature-hero)(\s|$)/;
  var items = [];
  document.querySelectorAll('section').forEach(function (s) {
    if (skip.test(s.className)) return;   // don't animate hero-type sections
    s.classList.add('reveal');
    items.push(s);
  });
  if (!items.length) return;

  // No IntersectionObserver → just show everything.
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

  items.forEach(function (el) { io.observe(el); });

  // Safety net: if the observer never fires (broken/zero-size viewport, odd
  // browser), reveal everything so content can never stay hidden.
  setTimeout(function () {
    var anyShown = items.some(function (el) { return el.classList.contains('is-in'); });
    if (!anyShown) items.forEach(function (el) { el.classList.add('is-in'); });
  }, 2500);
})();
