// ============================================================
// B-Healthy — interactions
// ============================================================

// --- Navbar: solid background on scroll ---
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// --- Mobile menu toggle ---
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
toggle.addEventListener('click', () => links.classList.toggle('is-open'));
links.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => links.classList.remove('is-open'))
);

// --- FAQ accordion ---
document.querySelectorAll('.acc').forEach(acc => {
  const head = acc.querySelector('.acc__head');
  const body = acc.querySelector('.acc__body');
  head.addEventListener('click', () => {
    const open = acc.classList.contains('is-open');
    document.querySelectorAll('.acc').forEach(a => {
      a.classList.remove('is-open');
      a.querySelector('.acc__body').style.maxHeight = null;
    });
    if (!open) {
      acc.classList.add('is-open');
      body.style.maxHeight = body.scrollHeight + 'px';
    }
  });
});

// --- Register form (front-end demo only) ---
const form = document.getElementById('registerForm');
const done = document.getElementById('formDone');
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  done.hidden = false;
  form.querySelector('button[type=submit]').textContent = 'SENT ✓';
  setTimeout(() => form.reset(), 400);
});

// --- Video modal (Google Drive embed) ---
const vmodal = document.getElementById('vmodal');
const vframe = document.getElementById('vmodalFrame');
function openVideo(id) {
  if (!id) return;
  vframe.src = `https://drive.google.com/file/d/${id}/preview`;
  vmodal.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeVideo() {
  vmodal.hidden = true;
  vframe.src = '';
  document.body.style.overflow = '';
}
document.querySelectorAll('.play-btn').forEach(btn =>
  btn.addEventListener('click', () => openVideo(btn.dataset.video))
);
vmodal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeVideo));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !vmodal.hidden) closeVideo(); });

// --- Language toggle (TH / EN) — UI scaffold ---
window.initLangToggle = function () {
  const btn = document.getElementById('navLang');
  if (!btn) return;
  const spans = btn.querySelectorAll('span:not(.sep)');
  btn.addEventListener('click', () => {
    spans.forEach(s => s.classList.toggle('on'));
    const en = btn.querySelector('span:last-child').classList.contains('on');
    document.documentElement.lang = en ? 'en' : 'th';
  });
};
window.initLangToggle();
