// ============================================================
// B-Healthy — render a single article on post.html?id=<slug>
// Falls back to the blog index when the id is missing or unknown.
// ============================================================
(function () {
  const root = document.getElementById('postRoot');
  if (!root || !window.BLOG_POSTS) return;

  const esc = window.bhEsc, escAttr = window.bhEscAttr;   // js/core.js

  const params = new URLSearchParams(location.search);

  // Canonical URL is /blog/<slug> (rewritten to this page by vercel.json).
  // ?id=<slug> still works so links shared before the change keep resolving.
  const fromPath = (location.pathname.match(/\/blog\/([^/]+)\/?$/) || [])[1];
  const id = fromPath ? decodeURIComponent(fromPath) : params.get('id');

  // This article was renamed: its old slug collided with the Elemental Aroma Oil
  // workshop, and `id` is the primary key across every content type, so the two
  // could not coexist. Links shared under the old slug still have to resolve.
  const LEGACY_IDS = {
    'elemental-aroma-oil': 'thai-elements-aroma-oil'
  };

  // ?preview=1 renders the draft the admin just put in sessionStorage, so an
  // unpublished (or unsaved) article can be checked through the real article
  // page. Same-origin only, and never consulted without the flag.
  const preview = params.get('preview') === '1' ? readPreview() : null;

  function readPreview() {
    try {
      const raw = sessionStorage.getItem('bh-preview-post');
      const obj = raw ? JSON.parse(raw) : null;
      return obj && obj.title ? obj : null;
    } catch (e) { return null; }
  }

  function render() {
    if (preview) { paint(preview, true); return; }
    const posts = window.BLOG_POSTS || [];
    let found = posts.find(x => x.id === id);

    // Renamed article: resolve the old slug and correct the address bar, but
    // only once the new record is really loaded, so a slow fetch can't leave
    // the URL pointing at something that isn't there.
    if (!found && LEGACY_IDS[id]) {
      found = posts.find(x => x.id === LEGACY_IDS[id]);
      if (found) history.replaceState(null, '', '/blog/' + encodeURIComponent(found.id));
    }

    if (!found) {
      root.innerHTML = `
        <section class="pkg-sec">
          <div class="container post-missing">
            <h1 data-en="Article not found">ไม่พบบทความนี้</h1>
            <p data-en="It may have been moved or renamed.">บทความอาจถูกย้ายหรือเปลี่ยนชื่อแล้ว</p>
            <a class="btn btn--primary" href="blog.html" data-en="Back to all articles">กลับไปดูบทความทั้งหมด</a>
          </div>
        </section>`;
      if (window.bhApplyLang) window.bhApplyLang();
      return;
    }
    paint(found, false);
  }

  function paint(p, isPreview) {
  // Tab title and description follow whichever language i18n.js has active.
  // Re-applied on toggle too — i18n only swaps elements, not <head> metadata.
  const applyMeta = () => {
    const isEn = document.documentElement.lang === 'en';
    document.title = `${isEn ? p.titleEn : p.title} — B-Healthy`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', isEn ? p.excerptEn : p.excerpt);
  };
  applyMeta();
  document.getElementById('navLang')?.addEventListener('click', () => setTimeout(applyMeta, 0));
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', p.titleEn);
  // Resolve against <base> (the site root), not location.href — on /blog/<slug>
  // the latter would produce /blog/images/... and break the share preview.
  const ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg) ogImg.setAttribute('content', new URL(p.cover, document.baseURI).href);
  if (isPreview) {
    const robots = document.createElement('meta');
    robots.name = 'robots'; robots.content = 'noindex,nofollow';
    document.head.appendChild(robots);
  }
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', new URL('blog/' + encodeURIComponent(p.id), document.baseURI).href);

  const date = window.bhBlogDate
    ? window.bhBlogDate(p.date)
    : { th: p.date, en: p.date };

  // Articles from the database (and previews) carry their own body. The bundled
  // fallback keeps bodies in js/blog-bodies.js so the listing page never has to
  // download them — look there when the record itself has none.
  const bodyBlocks = (Array.isArray(p.body) && p.body.length)
    ? p.body
    : ((window.BLOG_BODIES || {})[p.id] || []);

  // --- Body blocks ---
  const block = b => {
    switch (b.type) {
      case 'h2':
        return `<h2 class="post__h2" data-en="${escAttr(b.en)}">${esc(b.th)}</h2>`;
      case 'ul':
        return `<ul class="post__list">${(b.items || []).map(i =>
          `<li data-en="${escAttr(i.en)}">${esc(i.th)}</li>`).join('')}</ul>`;
      case 'quote':
        return `<blockquote class="post__quote" data-en="${escAttr(b.en)}">${esc(b.th)}</blockquote>`;
      case 'img':
        return `<figure class="post__fig">
          <img src="${esc(b.src)}" alt="${esc(b.alt)}" loading="lazy" />
          ${b.caption ? `<figcaption data-en="${escAttr(b.caption.en)}">${esc(b.caption.th)}</figcaption>` : ''}
        </figure>`;
      default:
        return `<p class="post__p" data-en="${escAttr(b.en)}">${esc(b.th)}</p>`;
    }
  };

  // --- Related: same category first, topped up with the newest others ---
  const posts = isPreview ? [] : (window.BLOG_POSTS || []);
  const sameCat = posts.filter(x => x.id !== p.id && x.category === p.category);
  const others = posts.filter(x => x.id !== p.id && x.category !== p.category);
  const related = [...sameCat, ...others].slice(0, 3);

  const relatedCard = r => {
    const d = window.bhBlogDate ? window.bhBlogDate(r.date) : { th: r.date, en: r.date };
    return `
      <a class="bcard" href="/blog/${encodeURIComponent(r.id)}">
        <div class="bcard__media">
          <img src="${esc(r.cover)}" alt="${esc(r.coverAlt)}" loading="lazy" />
          <span class="bcard__cat" data-en="${escAttr(r.categoryEn)}">${esc(r.category)}</span>
        </div>
        <div class="bcard__body">
          <p class="bcard__meta"><span data-en="${escAttr(d.en)}">${esc(d.th)}</span></p>
          <h3 class="bcard__title" data-en="${escAttr(r.titleEn)}">${esc(r.title)}</h3>
        </div>
      </a>`;
  };

  root.innerHTML = `
    ${isPreview ? `<div class="post-preview-bar" role="status">
      <strong data-en="Preview">พรีวิว</strong>
      <span data-en="This is a draft — not visible to visitors until you publish it.">นี่คือฉบับร่าง ยังไม่แสดงบนเว็บจนกว่าจะกด Publish</span>
    </div>` : ''}
    <article class="post">
      <header class="post__head">
        <div class="container post__head-inner">
          <a class="post__back" href="blog.html" data-en="← All articles">← บทความทั้งหมด</a>
          <span class="post__cat" data-en="${escAttr(p.categoryEn)}">${esc(p.category)}</span>
          <h1 class="post__title" data-en="${escAttr(p.titleEn)}">${esc(p.title)}</h1>
          <p class="post__meta">
            <span data-en="${escAttr(p.authorEn)}">${esc(p.author)}</span>
            <span class="bcard__dot"></span>
            <span data-en="${escAttr(date.en)}">${esc(date.th)}</span>
            <span class="bcard__dot"></span>
            <span data-en="${escAttr(p.readMins + ' min read')}">อ่าน ${esc(p.readMins)} นาที</span>
          </p>
        </div>
      </header>

      <figure class="post__hero container">
        <img src="${esc(p.cover)}" alt="${esc(p.coverAlt)}" />
      </figure>

      <div class="container post__body">
        ${bodyBlocks.map(block).join('')}
      </div>

      <div class="container post__cta">
        <h3 data-en="Want this for your team?">อยากจัดให้ทีมของคุณ?</h3>
        <p data-en="Tell us about your team and we'll design a programme around it.">เล่าให้เราฟังเกี่ยวกับทีมของคุณ แล้วเราจะออกแบบโปรแกรมให้เหมาะกับองค์กร</p>
        <a class="btn btn--primary" href="contact.html" data-en="Talk to us">ติดต่อเรา</a>
      </div>
    </article>

    ${related.length ? `
    <section class="pkg-sec pkg-sec--tint">
      <div class="container">
        <div class="pill-head"><span class="pill-head__pill" data-en="KEEP READING">อ่านต่อ</span></div>
        <div class="blog__grid">${related.map(relatedCard).join('')}</div>
      </div>
    </section>` : ''}`;

  if (window.bhApplyLang) window.bhApplyLang();
  }

  render();
  // Re-render once the admin-managed articles arrive (js/blog-store.js).
  document.addEventListener('bh:posts-ready', render);
})();
