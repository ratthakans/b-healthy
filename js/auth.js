// ============================================================
// B-Healthy — member sign-in, without supabase-js
//
// The rest of the public site talks to Supabase with plain fetch, and the
// handful of Auth endpoints a member needs (sign up, sign in, refresh, sign
// out, change password) are just as plain. Loading the 120 KB client on every
// marketing page to make six calls was not worth it. The admin keeps
// supabase-js; staff and members never share a session anyway.
//
//   bhAuth.user()                 who is signed in, from storage (sync, may be stale)
//   bhAuth.session()              a fresh session or null — refreshes near expiry
//   bhAuth.signUp(fields)         { email, password, full_name, phone, company, consent }
//   bhAuth.signIn(email, pw)
//   bhAuth.signOut()
//   bhAuth.updatePassword(pw)
//   bhAuth.rest(path, init)       PostgREST as the member
//   bhAuth.rpc(fn, args)
//   bhAuth.storageWorks           false where the browser refuses to remember
//
// Errors come back as { status, code, message } with the server's own code
// (user_already_exists, invalid_credentials, weak_password, ...) so the page
// can say something specific instead of "something went wrong".
// ============================================================
(function () {
  const cfg = window.BH_CONFIG || {};
  const base = (cfg.SUPABASE_URL || '').replace(/\/$/, '');
  const key = cfg.SUPABASE_ANON_KEY || '';
  const KEY = 'bh-session';

  // ---- storage --------------------------------------------------------
  // Private mode and blocked site data throw on access. Then a sign-in lasts
  // for this page only — and the account page says so, rather than appearing
  // to log people out at random.
  let memo = null, storageWorks = true;
  try { localStorage.setItem('bh-probe', '1'); localStorage.removeItem('bh-probe'); }
  catch (e) { storageWorks = false; }

  function load() {
    if (!storageWorks) return memo;
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; }
    catch (e) { return memo; }
  }
  function store(s) {
    memo = s;
    if (!storageWorks) return;
    try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); }
    catch (e) {}
  }

  // ---- transport ------------------------------------------------------
  async function call(path, opts) {
    const o = opts || {};
    if (!base || !key) throw { status: 0, code: 'not_configured', message: 'not configured' };
    let res, body;
    try {
      res = await fetch(base + path, {
        method: o.method || 'GET',
        headers: Object.assign({
          apikey: key,
          Authorization: 'Bearer ' + (o.token || key),
          'Content-Type': 'application/json'
        }, o.headers || {}),
        body: o.body ? JSON.stringify(o.body) : undefined
      });
    } catch (e) {
      throw { status: 0, code: 'network', message: String(e && e.message || e) };
    }
    const text = await res.text();
    try { body = text ? JSON.parse(text) : null; } catch (e) { body = text; }
    if (!res.ok) {
      const b = body && typeof body === 'object' ? body : {};
      // Auth answers in two shapes depending on endpoint and version:
      // { error_code, msg } and { error, error_description }. PostgREST uses
      // { code, message }. Normalise to one.
      throw {
        status: res.status,
        code: b.error_code || (typeof b.code === 'string' ? b.code : '') || b.error || '',
        message: b.msg || b.message || b.error_description || String(text || res.status)
      };
    }
    return body;
  }

  function fromTokenResponse(j) {
    if (!j || !j.access_token) return null;
    const now = Math.floor(Date.now() / 1000);
    const u = j.user || {};
    const meta = u.user_metadata || {};
    return {
      access_token: j.access_token,
      refresh_token: j.refresh_token,
      expires_at: j.expires_at || (now + (j.expires_in || 3600)),
      user: { id: u.id, email: u.email, name: meta.full_name || '' }
    };
  }

  // ---- session --------------------------------------------------------
  let refreshing = null;

  async function refresh(s) {
    // One refresh at a time per tab; two concurrent ones would spend the same
    // refresh token twice.
    if (refreshing) return refreshing;
    refreshing = (async () => {
      try {
        const j = await call('/auth/v1/token?grant_type=refresh_token',
          { method: 'POST', body: { refresh_token: s.refresh_token } });
        const next = fromTokenResponse(j);
        if (next && !next.user.name) next.user.name = s.user.name;
        store(next);
        return next;
      } catch (e) {
        // Revoked (password reset by staff), expired, or the account is gone.
        // A network failure is different: keep the session and try next time.
        if (e.status === 400 || e.status === 401 || e.status === 403) { store(null); paintNav(); }
        return e.status === 0 ? s : null;
      } finally { refreshing = null; }
    })();
    return refreshing;
  }

  async function session() {
    const s = load();
    if (!s || !s.access_token) return null;
    const now = Math.floor(Date.now() / 1000);
    if (s.expires_at - 60 > now) return s;
    return refresh(s);
  }

  // ---- the API --------------------------------------------------------
  async function signUp(f) {
    const j = await call('/auth/v1/signup', {
      method: 'POST',
      body: {
        email: f.email, password: f.password,
        data: { full_name: f.full_name, phone: f.phone, company: f.company || '', consent: f.consent ? 'true' : 'false' }
      }
    });
    const s = fromTokenResponse(j);
    if (!s) {
      // An account was created but no session came back: the project still
      // has "Confirm email" switched on, and that confirmation mail will be
      // refused. Say it plainly, it is a setting, not the visitor's fault.
      throw { status: 200, code: 'confirmation_required', message: 'email confirmation is switched on' };
    }
    if (!s.user.name) s.user.name = f.full_name || '';
    store(s); paintNav();
    return s;
  }

  async function signIn(email, password) {
    const j = await call('/auth/v1/token?grant_type=password',
      { method: 'POST', body: { email: email, password: password } });
    const s = fromTokenResponse(j);
    store(s); paintNav();
    return s;
  }

  async function signOut() {
    const s = load();
    store(null); paintNav();
    if (s && s.access_token) {
      try { await call('/auth/v1/logout?scope=local', { method: 'POST', token: s.access_token }); } catch (e) {}
    }
  }

  async function updatePassword(password) {
    const s = await session();
    if (!s) throw { status: 401, code: 'not_signed_in', message: 'not signed in' };
    await call('/auth/v1/user', { method: 'PUT', token: s.access_token, body: { password: password } });
  }

  async function rest(path, init) {
    const s = await session();
    if (!s) throw { status: 401, code: 'not_signed_in', message: 'not signed in' };
    const i = init || {};
    return call('/rest/v1/' + path, {
      method: i.method || 'GET', token: s.access_token, body: i.body,
      headers: i.headers
    });
  }

  function rpc(fn, args) {
    return rest('rpc/' + fn, { method: 'POST', body: args || {} });
  }

  function user() {
    const s = load();
    return s && s.user && s.user.id ? s.user : null;
  }

  function setName(name) {
    const s = load();
    if (!s) return;
    s.user.name = name || '';
    store(s); paintNav();
  }

  // ---- the menu -------------------------------------------------------
  // One link, before Contact, on every page: "Sign in", or the member's first
  // name once they are. Injected rather than written into eleven HTML files.
  function paintNav() {
    const links = document.getElementById('navLinks');
    if (!links) return;
    // Hidden from the menu until the switch in config.js is on — unless
    // someone is already signed in, who should always be able to get back.
    if (!cfg.MEMBERS && !user()) {
      const old = document.getElementById('navAcct');
      if (old) old.remove();
      return;
    }
    let a = document.getElementById('navAcct');
    if (!a) {
      a = document.createElement('a');
      a.id = 'navAcct';
      a.className = 'nav__acct';
      a.href = 'account.html';
      const cta = links.querySelector('.nav__cta');
      links.insertBefore(a, cta || null);
    }
    const u = user();
    // "คุณ" is how Thai addresses anyone; typed into the name it is not a name.
    const first = u && u.name ? u.name.trim().replace(/^คุณ\s*/, '').split(/\s+/)[0] : '';
    const th = u ? (first || 'บัญชีของฉัน') : 'เข้าสู่ระบบ';
    const en = u ? (first || 'My account') : 'Sign in';
    a.textContent = th;
    a.setAttribute('data-en', en);
    delete a.__th;
    if (location.pathname.replace(/\.html$/, '').endsWith('/account')) a.classList.add('is-active');
    if (window.bhApplyLang) window.bhApplyLang();
  }

  // Signed in or out in another tab: follow it here too.
  window.addEventListener('storage', e => { if (e.key === KEY) paintNav(); });

  window.bhAuth = {
    user: user, session: session, signUp: signUp, signIn: signIn, signOut: signOut,
    updatePassword: updatePassword, rest: rest, rpc: rpc, setName: setName,
    storageWorks: storageWorks
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paintNav);
  else paintNav();
})();
