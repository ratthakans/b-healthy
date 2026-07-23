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

// --- Wellness Retreats / Workshop: hover a topic → hero + stack show random photos of that topic ---
function initTopicGallery(opts) {
  const hero = document.getElementById(opts.heroId);
  const stack = document.getElementById(opts.stackId);
  if (!hero || !stack) return;
  const heroImg = hero.querySelector('img');
  const items = document.querySelectorAll(opts.listSel + ' li[data-topic]');
  if (!items.length) return;

  const COUNTS = opts.counts;
  const url = (topic, i) => `${opts.base}/${topic}/${topic}-${i}.jpg`;

  // Photos are FIXED per topic (no shuffling) — hovering a topic always shows
  // the same 3 pictures. Admin-managed images (window.BH_TOPICS, set by
  // js/topics.js) win; otherwise fall back to the files on disk.
  const imagesFor = topic => {
    const override = (window.BH_TOPICS || {})[opts.group + '/' + topic];
    if (Array.isArray(override) && override.length) return override.slice(0, 3);
    const total = Math.min(COUNTS[topic] || 3, 3);
    return Array.from({ length: total }, (_, i) => url(topic, i + 1));
  };

  // Preload the photos actually used so swaps are instant (no flash / reflow).
  const preload = () => Object.keys(COUNTS).forEach(t =>
    imagesFor(t).forEach(src => { const im = new Image(); im.src = src; }));
  preload();

  let currentTopic = items[0].dataset.topic;
  const render = topic => {
    currentTopic = topic;
    const pics = imagesFor(topic);
    if (!pics.length) return;
    heroImg.src = pics[0];
    stack.innerHTML = pics.slice(1).map(src =>
      `<figure class="detail__img"><img src="${src}" alt="" /></figure>`
    ).join('');
  };

  // Re-render with admin images once they arrive.
  document.addEventListener('bh:topics-ready', () => { preload(); render(currentTopic); });

  const setActive = li => items.forEach(x => x.classList.toggle('is-active', x === li));

  let hoverTimer = null;
  items.forEach(li => {
    li.tabIndex = 0;
    const go = () => {
      setActive(li);
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => render(li.dataset.topic), 70); // debounce pass-through
    };
    li.addEventListener('mouseenter', go);
    li.addEventListener('focus', go);
  });

  render(items[0].dataset.topic); // initial set
}

initTopicGallery({
  group: 'tour',
  heroId: 'rtourHero', stackId: 'rtourStack', listSel: '.detail--tourism .rtour__list', base: 'images/tourism',
  counts: { 'stay-wellness': 6, 'local-route': 7, 'workshop-activities': 4, 'health-assessment': 6, 'therapeutic-treatment': 6, 'food-as-medicine': 6, 'sound-healing': 6, 'horo-health': 6 }
});
initTopicGallery({
  group: 'wk',
  heroId: 'wkHero', stackId: 'wkStack', listSel: '.detail--workshop .rtour__list', base: 'images/workshop',
  counts: { 'office-syndrome': 14, 'sound-healing': 7, 'yoga-meditation': 8, 'elemental-aroma-oil': 12, 'personalized-herbal-tea': 14, 'flower-mandala': 3 }
});
