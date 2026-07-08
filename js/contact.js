// ============================================================
// B-Healthy — contact form (prefill subject from ?subject=, submit)
// ============================================================
(function () {
  const form = document.getElementById('contactForm');
  const select = document.getElementById('subject');
  const done = document.getElementById('formDone');
  if (!form) return;

  // Prefill subject from URL (?subject=...) — e.g. from a Membership CTA
  const q = new URLSearchParams(location.search).get('subject');
  if (q && select) {
    let opt = [...select.options].find(o => o.value === q);
    if (!opt) {
      opt = new Option(q, q);
      select.add(opt, 0);
    }
    select.value = q;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    await window.bhSubmit?.('contact', Object.fromEntries(new FormData(form)));
    done.hidden = false;
    btn.textContent = '✓';
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
