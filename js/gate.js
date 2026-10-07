// ============================================================
// B-Healthy — article gate
//
// A gated article arrives from the database already cut short: the view
// `posts_public` sends the first few blocks and a `gated` flag, and the rest
// of the text never leaves the server. This file is what asks for it back.
//
//   bhGateToken()          the unlock token this browser holds, or null
//   bhGateUnlock(email,id) records the reader as a lead, returns a token
//   bhGateBody(id)         the full body, or null if the token is no good
//
// The email is not verified, and it is not meant to be. This is the lead gate
// a magazine puts on an article, not a login — what makes it real is that the
// server, not the browser, decides whether the text is sent.
// ============================================================
(function () {
  const KEY = 'bh-unlock';
  const cfg = window.BH_CONFIG || {};
  const base = (cfg.SUPABASE_URL || '').replace(/\/$/, '');
  const key = cfg.SUPABASE_ANON_KEY || '';

  function read() { try { return localStorage.getItem(KEY) || null; } catch (e) { return null; } }
  function write(v) { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) {} }

  window.bhGateToken = read;
  window.bhGateForget = () => write(null);

  function rpc(fn, args) {
    if (!base || !key) return Promise.reject(new Error('not configured'));
    return fetch(base + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(args)
    }).then(r => r.json().then(
      payload => (r.ok ? payload : Promise.reject(payload || { message: 'HTTP ' + r.status }))
    ));
  }

  window.bhGateUnlock = function (email, slug) {
    return rpc('bh_unlock', { p_email: email, p_slug: slug || null }).then(token => {
      if (typeof token !== 'string' || !token) throw new Error('no token');
      write(token);
      return token;
    });
  };

  // Resolves to the body blocks, or null for "this browser may not read it" —
  // an expired or tampered token is indistinguishable from none, on purpose.
  window.bhGateBody = function (slug) {
    const token = read();
    if (!token) return Promise.resolve(null);
    return rpc('bh_article_body', { p_slug: slug, p_token: token })
      .then(body => (Array.isArray(body) && body.length ? body : null))
      .catch(() => null);
  };
})();
