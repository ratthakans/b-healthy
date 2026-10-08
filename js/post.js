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
    // Logged from here, not on load: a legacy slug only resolves to its real
    // article once the data is in, and the preview branch above must not count.
    if (window.bhTrackView) window.bhTrackView({ kind: 'post', refId: found.id });

    // Someone who unlocked an article before should not meet the card again.
    // Paint the teaser without it while the token is checked, then swap the
    // real body in — a stale token falls back to the card rather than leaving
    // a half article with no way forward.
    if (found.gated && window.bhGateToken && window.bhGateToken()) {
      paint(found, false, { pending: true });
      window.bhGateBody(found.id).then(body => {
        if (body) paint(found, false, { unlocked: body });
        else { window.bhGateForget(); paint(found, false); }
      });
      return;
    }

    paint(found, false);
  }

  // Says out loud which articles are gated. Google's own guidance is to mark
  // the paywalled section with a cssSelector, but there is no such section
  // here — the text never reaches the page — so the flag alone is the honest
  // signal, and what gets indexed is the teaser the reader also sees. That is
  // the trade: no cloaking, and no ranking for what we do not show.
  function structuredData(p, isEn) {
    let el = document.getElementById('postLd');
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = 'postLd';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: (isEn ? p.titleEn : p.title) || p.title,
      description: (isEn ? p.excerptEn : p.excerpt) || p.excerpt || '',
      datePublished: p.date || undefined,
      image: p.cover ? new URL(p.cover, document.baseURI).href : undefined,
      author: { '@type': 'Organization', name: 'B-Healthy' },
      publisher: { '@type': 'Organization', name: 'B-Healthy' },
      mainEntityOfPage: new URL('blog/' + encodeURIComponent(p.id), document.baseURI).href,
      isAccessibleForFree: !p.gated
    });
  }

  // The bundled index carries no article text, so between first paint and the
  // database answering there is nothing to show. Saying so beats a blank page,
  // and after the answer the same gap means the article really is unavailable.
  function placeholder() {
    return window.BH_POSTS_READY
      ? `<p class="post__p" data-en="This article could not be loaded right now. Please try again in a moment.">ยังโหลดบทความนี้ไม่ได้ กรุณาลองใหม่อีกครั้งในอีกสักครู่</p>`
      : `<p class="post__p post__p--wait" data-en="Loading the article…">กำลังโหลดบทความ…</p>`;
  }

  // `bare` = nothing was free to show. The fade above the card exists to blur
  // the sentence it interrupts; with no sentence there it would just smear the
  // cover photo.
  function gateCard(p, bare) {
    return `
      <div class="post-gate${bare ? ' post-gate--bare' : ''}" id="postGate">
        <h3 class="post-gate__h" data-en="Keep reading — just leave your email">อ่านต่อฟรี เพียงทิ้งอีเมลไว้</h3>
        <p class="post-gate__sub" data-en="The rest of this article is open to readers on our list. No cost, no password.">ส่วนที่เหลือของบทความนี้เปิดให้ผู้ที่อยู่ในรายชื่อผู้อ่านของเรา ไม่มีค่าใช้จ่าย ไม่ต้องตั้งรหัสผ่าน</p>
        <form class="post-gate__form" id="gateForm" novalidate>
          <input type="email" id="gateEmail" required autocomplete="email"
                 placeholder="you@company.com" aria-label="Email" />
          <button class="btn btn--primary" type="submit" id="gateBtn" data-en="Read the full article">อ่านบทความเต็ม</button>
        </form>
        <p class="post-gate__msg" id="gateMsg" role="status"></p>
        <p class="post-gate__fine" data-en="By entering your email you agree that B-Healthy may keep it to send you articles and workplace-wellbeing news. You can opt out at any time by replying to any of our emails.">การกรอกอีเมลถือว่าคุณยินยอมให้ B-Healthy เก็บอีเมลไว้ส่งบทความและข่าวสารด้านสุขภาวะองค์กร ยกเลิกได้ทุกเมื่อโดยตอบกลับอีเมลฉบับใดก็ได้ของเรา</p>
      </div>`;
  }

  // opts: { unlocked: <full body blocks>, pending: <token in hand, asking> }
  function paint(p, isPreview, opts) {
    const state = opts || {};
  // Tab title and description follow whichever language i18n.js has active.
  // Re-applied on toggle too — i18n only swaps elements, not <head> metadata.
  const applyMeta = () => {
    const isEn = document.documentElement.lang === 'en';
    document.title = `${isEn ? p.titleEn : p.title} — B-Healthy`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', isEn ? p.excerptEn : p.excerpt);
    if (!isPreview) structuredData(p, isEn);
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

  // A gated article arrives already cut short. `unlocked` is the full body the
  // database handed back against a valid token — when it is here the card goes
  // away, when it is not the reader sees the teaser and the card.
  // (There is no bundled fallback any more: shipping every article body as a
  // static .js file would have handed out the gated ones for free.)
  const bodyBlocks = state.unlocked || (Array.isArray(p.body) ? p.body : []);
  // `pending` keeps the card away from a returning reader whose token is about
  // to come back good — otherwise the article flashes a form they already filled.
  const locked = !!p.gated && !state.unlocked && !state.pending && !isPreview;

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

      <div class="container post__body${locked ? ' post__body--locked' : ''}" id="postBody">
        ${bodyBlocks.length ? bodyBlocks.map(block).join('') : (locked ? '' : placeholder())}
        ${locked ? gateCard(p, !bodyBlocks.length) : ''}
      </div>

      ${locked ? '' : `<div class="container post__cta">
        <h3 data-en="Want this for your team?">อยากจัดให้ทีมของคุณ?</h3>
        <p data-en="Tell us about your team and we'll design a programme around it.">เล่าให้เราฟังเกี่ยวกับทีมของคุณ แล้วเราจะออกแบบโปรแกรมให้เหมาะกับองค์กร</p>
        <a class="btn btn--primary" href="contact.html" data-en="Talk to us">ติดต่อเรา</a>
      </div>`}
    </article>

    ${related.length ? `
    <section class="pkg-sec pkg-sec--tint">
      <div class="container">
        <div class="pill-head"><span class="pill-head__pill" data-en="KEEP READING">อ่านต่อ</span></div>
        <div class="blog__grid">${related.map(relatedCard).join('')}</div>
      </div>
    </section>` : ''}`;

  if (window.bhApplyLang) window.bhApplyLang();

  if (locked) {
    if (window.bhTrackView) window.bhTrackView({ kind: 'gate', refId: p.id });
    bindGate(p);
  }
  }

  function bindGate(p) {
    const form = document.getElementById('gateForm');
    if (!form) return;
    const input = document.getElementById('gateEmail');
    const btn = document.getElementById('gateBtn');
    const msg = document.getElementById('gateMsg');

    // i18n rewrites data-en elements wholesale on a language toggle, so a
    // message has to be set in both languages or it vanishes mid-read.
    const say = (kind, th, en) => {
      msg.className = 'post-gate__msg post-gate__msg--' + kind + ' show';
      msg.textContent = th;
      msg.setAttribute('data-en', en);
      delete msg.__th;
      if (window.bhApplyLang) window.bhApplyLang();
    };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const email = (input.value || '').trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        say('err', 'อีเมลยังไม่ถูกต้อง ลองตรวจอีกครั้ง', 'That email does not look right — please check it.');
        input.focus();
        return;
      }

      btn.disabled = true;
      const thWas = btn.textContent;
      btn.textContent = 'กำลังเปิด…';
      btn.setAttribute('data-en', 'Opening…');
      delete btn.__th;
      if (window.bhApplyLang) window.bhApplyLang();

      try {
        await window.bhGateUnlock(email, p.id);
        if (window.bhTrackView) window.bhTrackView({ kind: 'unlock', refId: p.id });
        const body = await window.bhGateBody(p.id);
        if (!body) throw new Error('unlocked but no body');
        paint(p, false, { unlocked: body });
        document.getElementById('postBody').scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (err) {
        btn.disabled = false;
        btn.textContent = thWas;
        btn.setAttribute('data-en', 'Read the full article');
        delete btn.__th;
        const code = err && err.code;
        if (code === '22023') say('err', 'อีเมลยังไม่ถูกต้อง ลองตรวจอีกครั้ง', 'That email does not look right — please check it.');
        else if (code === '53400') say('err', 'ตอนนี้มีคนลงทะเบียนพร้อมกันมาก ลองอีกครั้งในอีกสักครู่', 'Too many signups at once — please try again shortly.');
        else say('err', 'เปิดบทความไม่สำเร็จ ลองใหม่อีกครั้ง', 'Could not open the article — please try again.');
        if (window.bhApplyLang) window.bhApplyLang();
      }
    });
  }

  render();
  // Re-render once the admin-managed articles arrive (js/blog-store.js).
  document.addEventListener('bh:posts-ready', render);
})();
