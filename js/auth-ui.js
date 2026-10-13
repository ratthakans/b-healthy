// ============================================================
// B-Healthy — the password field, shared by /account and the wellness check
//
//   bhAuthUI.pwField(id, th, en, autocomplete, hintHtml)  markup
//   bhAuthUI.bind(container)        show/hide, Caps Lock, label refresh
//   bhAuthUI.wireNewPassword(pw, confirm)  -> () => [th, en, el] | null
//   bhAuthUI.hidePasswords(container)
//   bhAuthUI.put(el, th, en, kind)  set a message in both languages
//   bhAuthUI.explain(error)         Auth error -> [th, en, action?]
//
// Pulled out of account.js once a second page needed the same field: two
// copies of a password input drift, and the one that drifts is the one where
// someone types a password that does not work.
// ============================================================
(function () {
  const isEn = () => document.documentElement.lang === 'en';
  const MIN = 8;

  // Every message has to exist in both languages, or the language toggle
  // blanks it mid-read (i18n rewrites data-en elements wholesale).
  function put(el, th, en, kind) {
    if (typeof el === 'string') el = document.getElementById(el);
    if (!el) return;
    el.textContent = th;
    el.setAttribute('data-en', en || th);
    delete el.__th;
    if (kind !== undefined) el.className = el.className.replace(/\bis-(ok|err|info)\b/g, '').trim() + (kind ? ' is-' + kind : '');
    if (window.bhApplyLang) window.bhApplyLang();
  }

  const EYE = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';
  const EYE_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.1 3.9M6.6 6.6C3.9 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
  const eyeLabel = shown => isEn() ? (shown ? 'Hide password' : 'Show password') : (shown ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน');

  // A password input with its own show/hide button. data-en sits on the inner
  // <span>, never on the <label>: i18n replaces an element's whole innerHTML,
  // and a label carrying data-en would delete the input inside it.
  function pwField(id, th, en, autocomplete, hint) {
    return `
      <div class="form__full pwf">
        <label for="${id}"><span data-en="${en}">${th}</span> <span>*</span></label>
        <div class="pw">
          <input id="${id}" type="password" autocomplete="${autocomplete}" required
                 spellcheck="false" autocapitalize="off" autocorrect="off"
                 aria-describedby="${id}-caps${hint ? ' ' + id + '-hint' : ''}" />
          <button type="button" class="pw__eye" data-for="${id}" aria-controls="${id}"
                  aria-pressed="false" aria-label="${eyeLabel(false)}">${EYE}</button>
        </div>
        ${hint || ''}
        <p class="pwf__caps" id="${id}-caps" role="status" hidden data-en="Caps Lock is on">Caps Lock เปิดอยู่</p>
      </div>`;
  }

  // Password fields go back to type=password before submitting: browsers
  // will not offer to save a password that was submitted from a text field.
  function hidePasswords(root) {
    root.querySelectorAll('.pw input').forEach(i => { i.type = 'password'; });
    root.querySelectorAll('.pw__eye').forEach(b => {
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', eyeLabel(false));
      b.innerHTML = EYE;
    });
  }

  // ---- shared behaviour, bound once per container -----------------------
  function bind(root) {
  root.addEventListener('click', e => {
    const b = e.target.closest('.pw__eye');
    if (!b) return;
    const input = document.getElementById(b.dataset.for);
    if (!input) return;
    const reveal = input.type === 'password';
    // Changing type resets the caret in some browsers; put it back.
    const s = input.selectionStart, f = input.selectionEnd;
    input.type = reveal ? 'text' : 'password';
    try { if (s !== null) input.setSelectionRange(s, f); } catch (_) {}
    b.setAttribute('aria-pressed', reveal ? 'true' : 'false');
    b.setAttribute('aria-label', eyeLabel(reveal));
    b.innerHTML = reveal ? EYE_OFF : EYE;
  });

  // Caps Lock is the commonest reason a correct password is "wrong".
  ['keydown', 'keyup'].forEach(t => root.addEventListener(t, e => {
    const input = e.target.closest && e.target.closest('.pw input');
    if (!input || !e.getModifierState) return;
    const note = document.getElementById(input.id + '-caps');
    if (note) note.hidden = !e.getModifierState('CapsLock');
  }));
  root.addEventListener('focusout', e => {
    const input = e.target.closest && e.target.closest('.pw input');
    if (input) { const n = document.getElementById(input.id + '-caps'); if (n) n.hidden = true; }
  });

  // The eye buttons' labels are attributes, which i18n does not touch.
  document.getElementById('navLang')?.addEventListener('click', () => setTimeout(() => {
    root.querySelectorAll('.pw__eye').forEach(b =>
      b.setAttribute('aria-label', eyeLabel(b.getAttribute('aria-pressed') === 'true')));
  }, 0));
  }

  // ---- new password + confirmation, used by sign-up and change ---------
  // Length is stated before anyone types. The confirmation is judged when the
  // reader leaves the field (or has typed as much as the first one), not on
  // every keystroke — otherwise it is red from the first character on.
  function wireNewPassword(pwId, confirmId) {
    const pw = document.getElementById(pwId);
    const cf = document.getElementById(confirmId);
    const len = document.getElementById(pwId + '-hint');
    const match = document.getElementById(confirmId + '-hint');
    let touched = false;

    const paintLength = () => {
      const ok = pw.value.length >= MIN;
      len.classList.toggle('is-ok', ok);
      put(len, (ok ? '✓ ' : '') + 'อย่างน้อย ' + MIN + ' ตัวอักษร', (ok ? '✓ ' : '') + 'At least ' + MIN + ' characters');
    };
    const paintMatch = () => {
      if (!cf.value) { match.className = 'pwf__hint'; put(match, '', ''); return; }
      const same = cf.value === pw.value;
      match.className = 'pwf__hint ' + (same ? 'is-ok' : 'is-err');
      put(match, same ? '✓ รหัสผ่านตรงกัน' : '✗ รหัสผ่านไม่ตรงกัน', same ? '✓ Passwords match' : '✗ Passwords do not match');
    };

    pw.addEventListener('input', () => { paintLength(); if (touched) paintMatch(); });
    cf.addEventListener('input', () => { if (touched || cf.value.length >= pw.value.length) paintMatch(); });
    cf.addEventListener('blur', () => { touched = true; paintMatch(); });
    paintLength();

    return () => {
      if (pw.value.length < MIN) return ['รหัสผ่านต้องมีอย่างน้อย ' + MIN + ' ตัวอักษร', 'Your password needs at least ' + MIN + ' characters.', pw];
      if (pw.value !== cf.value) { touched = true; paintMatch(); return ['รหัสผ่านสองช่องไม่ตรงกัน', 'The two passwords do not match.', cf]; }
      return null;
    };
  }

  // Server errors, in words a person can act on. Login failures stay vague on
  // purpose: "wrong email or password" never confirms an account exists.
  function explain(e) {
    const c = (e && e.code) || '', m = String((e && e.message) || '');
    if (c === 'user_already_exists' || /already registered/i.test(m))
      return ['อีเมลนี้มีบัญชีอยู่แล้ว', 'This email already has an account.', 'login'];
    if (c === 'weak_password' || /should be at least|weak/i.test(m))
      return ['รหัสผ่านสั้นหรือคาดเดาง่ายเกินไป ลองให้ยาวขึ้น', 'That password is too short or too easy to guess — try a longer one.'];
    if (c === 'user_banned' || /banned/i.test(m))
      return ['บัญชีนี้ถูกระงับชั่วคราว กรุณาติดต่อทีม B-Healthy', 'This account is suspended — please contact the B-Healthy team.'];
    if (c === 'invalid_credentials' || /invalid login/i.test(m))
      return ['อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'Wrong email or password.'];
    if (c === 'same_password')
      return ['รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสเดิม', 'The new password has to be different from the old one.'];
    if (c === 'confirmation_required' || c === 'email_not_confirmed' || /confirmation email|not confirmed/i.test(m))
      return ['ระบบสมัครสมาชิกยังตั้งค่าไม่เสร็จ กรุณาติดต่อทีม B-Healthy', 'Sign-up is not fully set up yet — please contact the B-Healthy team.'];
    if (c === 'signup_disabled')
      return ['ขณะนี้ปิดรับสมัครสมาชิกชั่วคราว', 'Sign-up is closed for the moment.'];
    if (c === 'email_address_invalid' || c === 'validation_failed' || /invalid.*email|email.*invalid/i.test(m))
      return ['อีเมลไม่ถูกต้อง', 'That email does not look right.'];
    if (e && (e.status === 429 || /rate limit/i.test(m)))
      return ['ลองหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่', 'Too many attempts — wait a moment and try again.'];
    if (e && e.status === 0)
      return ['เชื่อมต่อไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่', 'Could not connect — check your connection and try again.'];
    return ['เกิดข้อผิดพลาด กรุณาลองใหม่', 'Something went wrong — please try again.'];
  }

  window.bhAuthUI = {
    MIN: MIN, put: put, pwField: pwField, bind: bind, hidePasswords: hidePasswords,
    wireNewPassword: wireNewPassword, explain: explain
  };
})();
