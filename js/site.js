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


// --- Shared footer ---
const footer = document.getElementById('footer');
if (footer) {
  footer.innerHTML = `
    <div class="container footer__inner">
      <div class="footer__brand">
        <span class="brand__mark" aria-hidden="true"><img src="images/logo.svg" alt="B-Healthy" /></span>
        <span class="footer__brandname">B-Healthy</span>
      </div>
      <div class="footer__slogan">YOUR HOLISTIC<br /><strong>WELLNESS COMPANION</strong></div>
      <div class="footer__contact">
        <p><span>Web</span> www.b-healthy.co</p>
        <p><span>Facebook</span> B-Healthy</p>
        <p><span>Line</span> @bhealthyme</p>
        <p><span>Tel</span> +66 (0) 62 225 6692</p>
      </div>
      <div class="footer__qr">
        <a href="https://line.me/R/ti/p/@bhealthyme" target="_blank" rel="noopener">
          <img src="images/line-qr.jpg?v=20260718a" alt="LINE @bhealthyme QR code" width="120" height="169" loading="lazy" />
        </a>
        <span>Scan for Line</span>
      </div>
    </div>
    <div class="footer__bottom container">© 2026 B-Healthy. All rights reserved.</div>`;
}

// Re-apply language to freshly injected footer
if (window.bhApplyLang) window.bhApplyLang();
