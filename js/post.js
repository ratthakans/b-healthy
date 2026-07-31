// ============================================================
// B-Healthy — render a single article on post.html?id=<slug>
// Falls back to the blog index when the id is missing or unknown.
// ============================================================
(function () {
  const root = document.getElementById('postRoot');
  if (!root || !window.BLOG_POSTS) return;

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // Escaped twice: attribute parsing decodes entities, then i18n.js assigns the
  // result with innerHTML — one pass would hand markup back to the parser.
  const escAttr = s => esc(esc(s));

  // Canonical URL is /blog/<slug> (rewritten to this page by vercel.json).
  // ?id=<slug> still works so links shared before the change keep resolving.
  const fromPath = (location.pathname.match(/\/blog\/([^/]+)\/?$/) || [])[1];
  const id = fromPath
    ? decodeURIComponent(fromPath)
    : new URLSearchParams(location.search).get('id');

  function render() {
  const posts = window.BLOG_POSTS || [];
  const p = posts.find(x => x.id === id);

  if (!p) {
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
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', new URL('blog/' + encodeURIComponent(p.id), document.baseURI).href);

  const date = window.bhBlogDate
    ? window.bhBlogDate(p.date)
    : { th: p.date, en: p.date };

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
        ${(p.body || []).map(block).join('')}
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
