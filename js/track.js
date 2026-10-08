// ============================================================
// B-Healthy — page-view tracker
//
// Logs one row per view into the Supabase `page_views` table; the Analytics tab
// in /admin reads it back as aggregates. First party only — no cookies, no IP
// address, no third-party script. "Visitors" counts random ids that each
// browser keeps for itself in localStorage, which is what makes the number
// people rather than hits.
//
// Detail pages (post.html, package.html) carry data-track="manual" on <body>
// and call bhTrackView() once they know what they are showing: the URL alone
// doesn't say which article a legacy slug resolves to, and those pages render a
// second time when the database answers.
// ============================================================
(function () {
  const cfg = window.BH_CONFIG || {};
  const base = (cfg.SUPABASE_URL || '').replace(/\/$/, '');
  const key = cfg.SUPABASE_ANON_KEY || '';

  const host = location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '[::1]' ||
                  host === '' || host.endsWith('.local');

  // Without this, an afternoon of reloading localhost — and every headless
  // browser used for testing — would land in the owner's traffic report.
  // Set window.BH_TRACK_LOCAL = true to let a deliberate check through.
  const live = !!base && !!key && (window.BH_TRACK_LOCAL || (!isLocal && !navigator.webdriver));

  const mkid = () => (window.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);

  // Storage can throw outright (private mode, blocked site data). A visitor we
  // can't remember simply counts as a new one — never a broken page.
  //
  // The store arrives as a function because browsers that block site data
  // throw on the `localStorage` property access itself, not on getItem. Passed
  // by value it was read before this try block existed, the exception escaped
  // the whole file, and bhTrackView was never defined — so those visitors
  // vanished from the report entirely, which is the one thing this was not
  // supposed to do.
  function stored(get, k) {
    try {
      const store = get();
      let v = store.getItem(k);
      if (!v) { v = mkid(); store.setItem(k, v); }
      return v;
    } catch (e) { return mkid(); }
  }

  const visitorId = stored(() => localStorage, 'bh-vid');
  const sessionId = stored(() => sessionStorage, 'bh-sid');

  function device() {
    const ua = navigator.userAgent;
    if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'tablet';
    if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  // Hostname only. The full referring URL can carry someone's search terms or
  // a private link, and none of that is needed to answer "where from?".
  function referrer() {
    if (!document.referrer) return null;
    try {
      const strip = s => s.replace(/^www\./, '');
      const from = strip(new URL(document.referrer).hostname);
      return from === strip(host) ? null : from.slice(0, 180);
    } catch (e) { return null; }
  }

  function lang() {
    try { return localStorage.getItem('bh-lang') === 'th' ? 'th' : 'en'; }
    catch (e) { return null; }
  }

  // '/index.html' and '/program.html' are the same pages as '/' and '/program'
  // (cleanUrls serves both), so they have to collapse or every page splits in
  // two in the report.
  function pagePath() {
    let p = location.pathname.replace(/\/{2,}/g, '/').replace(/\.html$/i, '');
    if (/\/index$/.test(p)) p = p.slice(0, -5);
    p = p.replace(/(.)\/+$/, '$1');
    return (p || '/').slice(0, 300);
  }

  const sent = new Set();

  function send(row) {
    if (!live) return;
    const once = row.kind + ':' + row.path;
    if (sent.has(once)) return;            // detail pages render twice
    sent.add(once);

    const body = JSON.stringify({
      path: row.path, kind: row.kind, ref_id: row.ref_id,
      visitor_id: visitorId, session_id: sessionId,
      referrer: referrer(), device: device(), lang: lang()
    });

    // keepalive so the view still lands if the visitor clicks straight through.
    // sendBeacon would be the obvious tool but cannot set the apikey header.
    fetch(base + '/rest/v1/page_views', {
      method: 'POST',
      keepalive: true,
      headers: {
        apikey: key,
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: body
    }).catch(() => {});                    // a counter must never break the page
  }

  window.bhTrackView = function (opts) {
    const o = opts || {};
    const ref = o.refId ? String(o.refId).slice(0, 200) : null;
    if (o.kind === 'post' && ref)    return send({ kind: 'post',    ref_id: ref, path: ('/blog/' + ref).slice(0, 300) });
    if (o.kind === 'package' && ref) return send({ kind: 'package', ref_id: ref, path: ('/package/' + ref).slice(0, 300) });
    // 'gate' = the email card was shown, 'unlock' = an email was given. Same
    // path as the article, different kind, so the dedupe above keeps them apart
    // and the admin can put them side by side as a conversion rate.
    if ((o.kind === 'gate' || o.kind === 'unlock') && ref) return send({ kind: o.kind, ref_id: ref, path: ('/blog/' + ref).slice(0, 300) });
    send({ kind: 'page', ref_id: null, path: pagePath() });
  };

  if (!document.body || document.body.dataset.track !== 'manual') window.bhTrackView();
})();
