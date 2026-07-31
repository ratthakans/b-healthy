// ============================================================
// B-Healthy — shared footer (every page)
// One source of truth so the LINE QR, contact block and DBD badge
// can never drift apart between the homepage and the sub-pages.
// Needs an empty <footer class="footer" id="footer"></footer> and
// must load after js/i18n.js.
// ============================================================
(function () {
  const footer = document.getElementById('footer');
  if (!footer) return;

  footer.innerHTML = `
    <div class="container footer__inner">
      <div class="footer__brand">
        <span class="brand__mark" aria-hidden="true"><img src="images/logo.svg" alt="B-Healthy" width="34" height="34" /></span>
        <span class="footer__brandname">B-Healthy</span>
      </div>
      <div class="footer__slogan">YOUR HOLISTIC<br /><strong>WELLNESS COMPANION</strong></div>
      <div class="footer__contact">
        <p><span>Web</span> www.b-healthy.co</p>
        <p><span>Facebook</span> <a href="https://www.facebook.com/BhealthyAsia" target="_blank" rel="noopener">B-Healthy</a></p>
        <p><span>Line</span> @bhealthyme</p>
        <p><span>Tel</span> +66 (0) 62 225 6692</p>
      </div>
      <div class="footer__qr">
        <a href="https://line.me/R/ti/p/@bhealthyme" target="_blank" rel="noopener">
          <img src="images/line-qr.jpg?v=20260728a" alt="LINE @bhealthyme QR code" width="120" height="169" loading="lazy" />
        </a>
        <span>Scan for Line</span>
      </div>
    </div>
    <div class="footer__bottom container">
      <span>© 2026 B-Healthy. All rights reserved.</span>
      <a class="footer__dbd" href="https://dbdregistered.dbd.go.th/api/public/shopinfoReg?param=93CB3A4DF3CAABF5C037A6D49FFEE0C87B50E2B560FE2F85CFEF79D16EE29885" target="_blank" rel="noopener">
        <img src="https://dbdregistered.dbd.go.th/api/public/bannerreg?param=93CB3A4DF3CAABF5C037A6D49FFEE0C87B50E2B560FE2F85CFEF79D16EE29885" alt="DBD Registered — จดทะเบียนพาณิชย์อิเล็กทรอนิกส์" loading="lazy" />
      </a>
    </div>`;

  // Re-apply language to the freshly injected markup
  if (window.bhApplyLang) window.bhApplyLang();
})();
