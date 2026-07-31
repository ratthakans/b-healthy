// ============================================================
// B-Healthy — shared site chrome (nav + footer) for sub-pages
// ============================================================

// --- Sticky nav shadow on scroll ---
const nav = document.getElementById('nav');
if (nav && !nav.classList.contains('nav--solid')) {
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// --- Mobile menu ---
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
if (toggle && links) {
  toggle.addEventListener('click', () => links.classList.toggle('is-open'));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('is-open')));
}


// The shared footer lives in js/footer.js — every page loads it, homepage included.
