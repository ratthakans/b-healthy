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
form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true;
  await window.bhSubmit?.('register', Object.fromEntries(new FormData(form)));
  done.hidden = false;
  btn.textContent = 'SENT ✓';
  setTimeout(() => { form.reset(); btn.disabled = false; }, 600);
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

// --- Wellness Tourism / Workshop: hover a list item to swap the featured image ---
document.querySelectorAll('.detail').forEach(section => {
  const heroImg = section.querySelector('.detail__img--tall img');
  const items = section.querySelectorAll('.detail__list li[data-swap]');
  if (!heroImg || !items.length) return;

  items.forEach(li => { const pre = new Image(); pre.src = li.dataset.swap; }); // preload swaps

  const swap = li => {
    items.forEach(x => x.classList.toggle('is-active', x === li));
    const src = li.dataset.swap;
    if (heroImg.getAttribute('src') === src) return;
    heroImg.style.opacity = '0';
    setTimeout(() => { heroImg.setAttribute('src', src); heroImg.style.opacity = '1'; }, 150);
  };

  items.forEach(li => {
    li.tabIndex = 0;
    li.addEventListener('mouseenter', () => swap(li));
    li.addEventListener('focus', () => swap(li));
  });
});
