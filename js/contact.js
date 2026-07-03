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

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    done.hidden = false;
    form.querySelector('button[type=submit]').textContent = 'ส่งแล้ว ✓';
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
