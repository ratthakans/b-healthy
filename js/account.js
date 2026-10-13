// ============================================================
// B-Healthy — /account: sign up, sign in, forgotten password, new password,
// and the member's own page.
//
// Two facts about this project shape every screen (see supabase-members.sql):
//   * Supabase will not e-mail anyone outside the project team, so "Confirm
//     email" is off: signing up signs you in, there and then.
//   * There is no reset link. A forgotten password goes to staff, who check
//     identity by phone and read out a temporary one, which has to be
//     replaced at the next sign-in.
//
// The page re-renders only when the view changes. Switching language does
// NOT re-render: that would wipe a half-typed password. i18n swaps every
// data-en element in place; the few things it cannot reach (aria-labels on
// the show-password buttons) are updated by hand.
// ============================================================
(function () {
  const root = document.getElementById('acRoot');
  if (!root || !window.bhAuth) return;

  const A = window.bhAuth;
  const esc = window.bhEsc;
  const isEn = () => document.documentElement.lang === 'en';
  const MIN = 8;

  // ---- small helpers ----------------------------------------------------
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
  function done() { if (window.bhApplyLang) window.bhApplyLang(); }

  // Only same-site paths, never "//evil.example" — this comes from the URL.
  function nextUrl() {
    const n = new URLSearchParams(location.search).get('next') || '';
    return /^\/(?!\/)[^\s]*$/.test(n) ? n : '';
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

  function msgBox(id) { return `<p class="ac-msg" id="${id}" role="alert" hidden></p>`; }
  function show(id, th, en, kind) {
    const el = document.getElementById(id);
    if (!el) return;
    el.hidden = false;
    put(el, th, en, kind || 'err');
  }
  function hide(id) { const el = document.getElementById(id); if (el) el.hidden = true; }

  // Buttons carry data-en, so their busy label must be set in both languages.
  function busy(btn, on, th, en) {
    if (!btn) return;
    if (on) {
      btn.__label = [btn.__th !== undefined ? btn.__th : btn.textContent, btn.getAttribute('data-en')];
      btn.disabled = true;
      put(btn, th || 'กำลังดำเนินการ…', en || 'Working…');
    } else if (btn.__label) {
      btn.disabled = false;
      put(btn, btn.__label[0], btn.__label[1]);
    }
  }

  // Password fields go back to type=password before submitting: browsers
  // will not offer to save a password that was submitted from a text field.
  function hidePasswords() {
    root.querySelectorAll('.pw input').forEach(i => { i.type = 'password'; });
    root.querySelectorAll('.pw__eye').forEach(b => {
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', eyeLabel(false));
      b.innerHTML = EYE;
    });
  }

  // ---- shared behaviour, bound once on the root ------------------------
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

  const storageNote = A.storageWorks ? '' : `
    <p class="ac-msg is-info" data-en="This browser is set not to remember sites, so you will be signed out when you leave this page.">เบราว์เซอร์นี้ตั้งค่าไม่ให้จำเว็บไซต์ คุณจะออกจากระบบเมื่อออกจากหน้านี้</p>`;

  function frame(inner, wide) {
    root.innerHTML = `<section class="ac-sec"><div class="container ac-wrap${wide ? ' ac-wrap--wide' : ''}">${inner}</div></section>`;
    done();
  }

  function tabs(active) {
    return `
      <nav class="ac-tabs" aria-label="Account">
        <a href="#login" class="${active === 'login' ? 'is-active' : ''}"${active === 'login' ? ' aria-current="page"' : ''} data-en="Sign in">เข้าสู่ระบบ</a>
        <a href="#signup" class="${active === 'signup' ? 'is-active' : ''}"${active === 'signup' ? ' aria-current="page"' : ''} data-en="Create account">สมัครสมาชิก</a>
      </nav>`;
  }

  // =================================================================
  // SIGN IN
  // =================================================================
  function viewLogin(prefill) {
    frame(`
      ${tabs('login')}
      <h1 class="ac-title" data-en="Welcome back">ยินดีต้อนรับกลับมา</h1>
      ${storageNote}
      <form class="form ac-form" id="acLogin" novalidate>
        <label class="form__full"><span data-en="Email">อีเมล</span> <span>*</span>
          <input id="acEmail" type="email" autocomplete="username" inputmode="email" required value="${esc(prefill || '')}" /></label>
        ${pwField('acPw', 'รหัสผ่าน', 'Password', 'current-password')}
        <p class="ac-forgot"><a href="#forgot" data-en="Forgot your password?">ลืมรหัสผ่าน?</a></p>
        ${msgBox('acMsg')}
        <button class="btn btn--primary ac-submit" type="submit" id="acGo" data-en="Sign in">เข้าสู่ระบบ</button>
      </form>
      <p class="ac-alt"><span data-en="New here?">ยังไม่มีบัญชี?</span> <a href="#signup" data-en="Create an account">สมัครสมาชิก</a></p>`);

    document.getElementById(prefill ? 'acPw' : 'acEmail').focus();

    document.getElementById('acLogin').addEventListener('submit', async e => {
      e.preventDefault();
      hide('acMsg');
      const email = document.getElementById('acEmail').value.trim();
      const pw = document.getElementById('acPw').value;
      if (!email || !pw) return show('acMsg', 'กรุณากรอกอีเมลและรหัสผ่าน', 'Please enter your email and password.');
      hidePasswords();
      const btn = document.getElementById('acGo');
      busy(btn, true, 'กำลังเข้าสู่ระบบ…', 'Signing in…');
      try {
        await A.signIn(email, pw);
        await afterSignIn();
      } catch (err) {
        busy(btn, false);
        const [th, en] = explain(err);
        show('acMsg', th, en);
        document.getElementById('acPw').focus();
      }
    });
  }

  // =================================================================
  // CREATE ACCOUNT
  // =================================================================
  function viewSignup() {
    frame(`
      ${tabs('signup')}
      <h1 class="ac-title" data-en="Create your account">สร้างบัญชีของคุณ</h1>
      <p class="ac-lead" data-en="Read every article in full, keep your wellness guide, and find your workshop codes in one place.">อ่านบทความได้ครบทุกเรื่อง เก็บผลประเมินสุขภาวะ และดูรหัสรับสิทธิ์เวิร์กช็อปได้ในที่เดียว</p>
      ${storageNote}
      <form class="form ac-form" id="acSignup" novalidate>
        <label class="form__full"><span data-en="Full name">ชื่อ-นามสกุล</span> <span>*</span>
          <input id="suName" type="text" autocomplete="name" required maxlength="120" /></label>
        <div class="form__row">
          <label><span data-en="Email">อีเมล</span> <span>*</span>
            <input id="suEmail" type="email" autocomplete="email" inputmode="email" required /></label>
          <label><span data-en="Phone">เบอร์โทร</span> <span>*</span>
            <input id="suPhone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="40" placeholder="08x-xxx-xxxx" /></label>
        </div>
        <label class="form__full"><span data-en="Company (optional)">บริษัท / องค์กร (ไม่บังคับ)</span>
          <input id="suCo" type="text" autocomplete="organization" maxlength="160" /></label>
        ${pwField('suPw', 'รหัสผ่าน', 'Password', 'new-password',
          `<p class="pwf__hint" id="suPw-hint"></p>`)}
        ${pwField('suPw2', 'ยืนยันรหัสผ่าน', 'Confirm password', 'new-password',
          `<p class="pwf__hint" id="suPw2-hint" aria-live="polite"></p>`)}
        <p class="ac-note" data-en="Your phone number is how we confirm it is you if you ever forget your password — we cannot e-mail a reset link.">เบอร์โทรนี้ใช้ยืนยันตัวตนหากคุณลืมรหัสผ่าน เพราะเราไม่ได้ส่งลิงก์รีเซ็ตทางอีเมล</p>
        <label class="form__check"><input type="checkbox" id="suConsent" />
          <span data-en="I agree that B-Healthy may keep my details to run my account and contact me about workplace wellbeing. I can delete my account at any time from this page.">ฉันยินยอมให้ B-Healthy เก็บข้อมูลของฉันเพื่อดูแลบัญชีและติดต่อเรื่องสุขภาวะองค์กร และลบบัญชีได้เองทุกเมื่อจากหน้านี้</span></label>
        ${msgBox('acMsg')}
        <button class="btn btn--primary ac-submit" type="submit" id="acGo" data-en="Create account">สมัครสมาชิก</button>
      </form>
      <p class="ac-alt"><span data-en="Already a member?">มีบัญชีอยู่แล้ว?</span> <a href="#login" data-en="Sign in">เข้าสู่ระบบ</a></p>`);

    const check = wireNewPassword('suPw', 'suPw2');
    document.getElementById('suName').focus();

    document.getElementById('acSignup').addEventListener('submit', async e => {
      e.preventDefault();
      hide('acMsg');
      const f = {
        full_name: document.getElementById('suName').value.trim(),
        email: document.getElementById('suEmail').value.trim(),
        phone: document.getElementById('suPhone').value.trim(),
        company: document.getElementById('suCo').value.trim(),
        password: document.getElementById('suPw').value,
        consent: document.getElementById('suConsent').checked
      };
      const stop = (th, en, el) => { show('acMsg', th, en); if (el) el.focus(); };
      if (!f.full_name) return stop('กรุณากรอกชื่อ', 'Please enter your name.', document.getElementById('suName'));
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) return stop('อีเมลยังไม่ถูกต้อง', 'That email does not look right.', document.getElementById('suEmail'));
      if (f.phone.replace(/\D/g, '').length < 9) return stop('เบอร์โทรยังไม่ถูกต้อง', 'That phone number does not look right.', document.getElementById('suPhone'));
      const bad = check();
      if (bad) return stop(bad[0], bad[1], bad[2]);
      if (!f.consent) return stop('กรุณายืนยันความยินยอมก่อนสมัคร', 'Please confirm your consent first.', document.getElementById('suConsent'));

      hidePasswords();
      const btn = document.getElementById('acGo');
      busy(btn, true, 'กำลังสร้างบัญชี…', 'Creating your account…');
      try {
        await A.signUp(f);
        await afterSignIn(true);
      } catch (err) {
        busy(btn, false);
        const [th, en, action] = explain(err);
        show('acMsg', th, en);
        if (action === 'login' && !document.getElementById('acToLogin')) {
          // A sibling, not a child: the message carries data-en, and i18n
          // replaces a data-en element's whole innerHTML — a link appended
          // inside it vanished on the very next language pass.
          document.getElementById('acMsg').insertAdjacentHTML('afterend',
            `<p class="ac-msg-act"><a href="#login" id="acToLogin" data-en="Sign in with this email instead">เข้าสู่ระบบด้วยอีเมลนี้แทน</a></p>`);
          document.getElementById('acToLogin').addEventListener('click', ev => {
            ev.preventDefault();
            history.replaceState(null, '', location.pathname + location.search + '#login');
            viewLogin(f.email);
          });
          done();
        }
      }
    });
  }

  // =================================================================
  // FORGOT PASSWORD — staff-assisted, because nothing can be e-mailed
  // =================================================================
  function viewForgot() {
    frame(`
      <a class="ac-back" href="#login" data-en="← Back to sign in">← กลับไปหน้าเข้าสู่ระบบ</a>
      <h1 class="ac-title" data-en="Forgot your password?">ลืมรหัสผ่าน?</h1>
      <p class="ac-lead" data-en="Leave your email and phone number. Someone from our team will call the number on your account to confirm it is you, then give you a temporary password over the phone.">กรอกอีเมลและเบอร์โทรไว้ ทีมของเราจะโทรไปยังเบอร์ที่อยู่ในบัญชีเพื่อยืนยันตัวตน แล้วแจ้งรหัสผ่านชั่วคราวให้ทางโทรศัพท์</p>
      <form class="form ac-form" id="acForgot" novalidate>
        <label class="form__full"><span data-en="Email on your account">อีเมลที่ใช้สมัคร</span> <span>*</span>
          <input id="fgEmail" type="email" autocomplete="email" inputmode="email" required /></label>
        <label class="form__full"><span data-en="Phone">เบอร์โทร</span> <span>*</span>
          <input id="fgPhone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="40" placeholder="08x-xxx-xxxx" /></label>
        ${msgBox('acMsg')}
        <button class="btn btn--primary ac-submit" type="submit" id="acGo" data-en="Ask for a call back">ขอให้ทีมติดต่อกลับ</button>
      </form>`);

    document.getElementById('fgEmail').focus();
    document.getElementById('acForgot').addEventListener('submit', async e => {
      e.preventDefault();
      hide('acMsg');
      const email = document.getElementById('fgEmail').value.trim();
      const phone = document.getElementById('fgPhone').value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return show('acMsg', 'อีเมลยังไม่ถูกต้อง', 'That email does not look right.');
      if (phone.replace(/\D/g, '').length < 9) return show('acMsg', 'เบอร์โทรยังไม่ถูกต้อง', 'That phone number does not look right.');

      const btn = document.getElementById('acGo');
      busy(btn, true, 'กำลังส่ง…', 'Sending…');
      let res = { ok: false };
      try {
        res = await window.bhSubmit('password-reset', {
          email: email, phone: phone, subject: 'Password reset request', requested_at: new Date().toISOString()
        });
      } catch (err) { res = { ok: false }; }

      if (!res || !res.ok) {
        busy(btn, false);
        return show('acMsg', 'ส่งไม่สำเร็จ กรุณาลองใหม่ หรือติดต่อเราทาง LINE @bhealthyme',
                    "Couldn't send — please try again, or reach us on LINE @bhealthyme");
      }
      // Identical whether or not the address has an account. Saying "no such
      // account" would let anyone test who is a member.
      frame(`
        <h1 class="ac-title" data-en="We will call you">เราจะติดต่อกลับ</h1>
        <p class="ac-lead" data-en="If this email has an account, someone from our team will call the phone number on it within 2 working days. For your security we only ever call the number already on the account.">หากอีเมลนี้มีบัญชีอยู่ ทีมของเราจะโทรไปยังเบอร์ในบัญชีภายใน 2 วันทำการ เพื่อความปลอดภัย เราจะโทรหาเบอร์ที่อยู่ในบัญชีเท่านั้น</p>
        <p class="ac-alt"><a href="#login" data-en="← Back to sign in">← กลับไปหน้าเข้าสู่ระบบ</a></p>`);
    });
  }

  // =================================================================
  // NEW PASSWORD — chosen freely, or forced after a temporary one
  // =================================================================
  function viewPassword(forced) {
    frame(`
      ${forced ? '' : `<a class="ac-back" href="#me" data-en="← Back to my account">← กลับไปบัญชีของฉัน</a>`}
      <h1 class="ac-title" data-en="${forced ? 'Choose a new password' : 'Change your password'}">${forced ? 'ตั้งรหัสผ่านใหม่' : 'เปลี่ยนรหัสผ่าน'}</h1>
      ${forced ? `<p class="ac-msg is-info" data-en="You signed in with a temporary password from our team. Choose your own before you carry on — the temporary one stops being yours the moment you do.">คุณเข้าสู่ระบบด้วยรหัสชั่วคราวจากทีมงาน กรุณาตั้งรหัสของคุณเองก่อนใช้งานต่อ</p>` : ''}
      <form class="form ac-form" id="acNewPw" novalidate>
        <input type="email" autocomplete="username" value="${esc((A.user() || {}).email || '')}" hidden readonly />
        ${pwField('npPw', 'รหัสผ่านใหม่', 'New password', 'new-password', `<p class="pwf__hint" id="npPw-hint"></p>`)}
        ${pwField('npPw2', 'ยืนยันรหัสผ่านใหม่', 'Confirm new password', 'new-password', `<p class="pwf__hint" id="npPw2-hint" aria-live="polite"></p>`)}
        ${msgBox('acMsg')}
        <button class="btn btn--primary ac-submit" type="submit" id="acGo" data-en="Save new password">บันทึกรหัสผ่านใหม่</button>
      </form>
      ${forced ? `<p class="ac-alt"><button type="button" class="ac-link" id="acOut" data-en="Sign out">ออกจากระบบ</button></p>` : ''}`);

    // The hidden username field above lets a password manager attach the new
    // password to the right account instead of guessing.
    const check = wireNewPassword('npPw', 'npPw2');
    document.getElementById('npPw').focus();
    const out = document.getElementById('acOut');
    if (out) out.addEventListener('click', async () => { await A.signOut(); location.hash = '#login'; route(); });

    document.getElementById('acNewPw').addEventListener('submit', async e => {
      e.preventDefault();
      hide('acMsg');
      const bad = check();
      if (bad) { show('acMsg', bad[0], bad[1]); bad[2].focus(); return; }
      hidePasswords();
      const btn = document.getElementById('acGo');
      busy(btn, true, 'กำลังบันทึก…', 'Saving…');
      try {
        await A.updatePassword(document.getElementById('npPw').value);
        try { await A.rpc('bh_password_changed'); } catch (_) {}
        history.replaceState(null, '', location.pathname + '#me');
        await viewDashboard({ th: 'บันทึกรหัสผ่านใหม่แล้ว', en: 'Your new password is saved.' });
      } catch (err) {
        busy(btn, false);
        if (err && err.status === 401) { await A.signOut(); location.hash = '#login'; return route(); }
        const [th, en] = explain(err);
        show('acMsg', th, en);
      }
    });
  }

  // =================================================================
  // MY ACCOUNT
  // =================================================================
  async function loadProfile() {
    const u = A.user();
    if (!u) return null;
    const rows = await A.rest('profiles?select=full_name,phone,company,must_change_password&id=eq.' + encodeURIComponent(u.id));
    return Array.isArray(rows) && rows[0] ? rows[0] : {};
  }

  async function afterSignIn(fresh) {
    let prof = {};
    try { prof = (await loadProfile()) || {}; } catch (_) {}
    if (prof.must_change_password) { history.replaceState(null, '', location.pathname + '#password'); return viewPassword(true); }
    const next = nextUrl();
    if (next) { location.href = next; return; }
    history.replaceState(null, '', location.pathname + '#me');
    return viewDashboard(fresh ? { th: 'สร้างบัญชีเรียบร้อย ยินดีต้อนรับ', en: 'Your account is ready — welcome.' } : null, prof);
  }

  const DIR = d => ((window.BH_WELLNESS || {}).DIRECTION_LABEL || {})[d] || { th: d, en: d };
  function fmt(iso) {
    try {
      return new Date(iso).toLocaleDateString(isEn() ? 'en-GB' : 'th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (_) { return ''; }
  }

  async function viewDashboard(flash, prof) {
    const u = A.user();
    if (!u) return viewLogin();
    frame(`<p class="ac-lead" data-en="Loading your account…">กำลังโหลดบัญชีของคุณ…</p>`, true);

    let p = prof, subs = [];
    try {
      if (!p) p = (await loadProfile()) || {};
      subs = (await A.rest('submissions?select=id,created_at,type,payload&order=created_at.desc&limit=50')) || [];
    } catch (err) {
      if (err && err.status === 401) { await A.signOut(); return viewLogin(u.email); }
    }
    if (p && p.must_change_password) { history.replaceState(null, '', location.pathname + '#password'); return viewPassword(true); }

    const wellness = subs.filter(s => s.type === 'wellness');
    const claims = subs.filter(s => s.type === 'workshop-claim');
    const latest = wellness[0] && wellness[0].payload;
    const first = (p.full_name || u.name || '').trim().replace(/^คุณ\s*/, '').split(/\s+/)[0];

    frame(`
      <div class="ac-head">
        <div>
          <p class="ac-kicker" data-en="My account">บัญชีของฉัน</p>
          <h1 class="ac-title">${esc(first ? (isEn() ? 'Hello, ' : 'สวัสดี คุณ') + first : (isEn() ? 'Hello' : 'สวัสดี'))}</h1>
        </div>
        <button class="btn btn--ghost" type="button" id="acOut" data-en="Sign out">ออกจากระบบ</button>
      </div>
      ${flash ? `<p class="ac-msg is-ok" role="status" data-en="${esc(flash.en)}">${esc(flash.th)}</p>` : ''}
      ${storageNote}

      <div class="ac-grid">
        <article class="ac-card">
          <h2 class="ac-card__h" data-en="Your wellness guide">ผลประเมินสุขภาวะของคุณ</h2>
          ${latest ? `
            <p class="ac-dir"><strong>${esc(isEn() ? DIR(latest.primary).en : DIR(latest.primary).th)}</strong>
              <span>· ${esc(isEn() ? DIR(latest.secondary).en : DIR(latest.secondary).th)}</span></p>
            <p class="ac-small">${esc(fmt(wellness[0].created_at))}</p>
            <a class="btn btn--ghost btn--sm" href="wellness-check.html" data-en="Take it again">ทำแบบประเมินอีกครั้ง</a>`
          : `
            <p class="ac-small" data-en="Nothing yet. Checks you take while signed in are kept here.">ยังไม่มี แบบประเมินที่ทำขณะเข้าสู่ระบบจะถูกเก็บไว้ที่นี่</p>
            <a class="btn btn--primary btn--sm" href="wellness-check.html" data-en="Take the wellness check">ทำแบบประเมิน</a>`}
        </article>

        <article class="ac-card">
          <h2 class="ac-card__h" data-en="Your workshop codes">รหัสรับสิทธิ์เวิร์กช็อป</h2>
          ${claims.length ? `<ul class="ac-codes">${claims.map(c => `
            <li><code>${esc((c.payload || {}).claim_code || '—')}</code>
              <span>${esc(fmt(c.created_at))}</span></li>`).join('')}</ul>`
          : `<p class="ac-small" data-en="No codes yet — finishing the wellness check while signed in offers one.">ยังไม่มี — ทำแบบประเมินขณะเข้าสู่ระบบแล้วรับสิทธิ์ได้ที่ท้ายผลประเมิน</p>`}
        </article>

        <article class="ac-card ac-card--wide">
          <h2 class="ac-card__h" data-en="Your details">ข้อมูลของคุณ</h2>
          <form class="form" id="acProfile" novalidate>
            <div class="form__row">
              <label><span data-en="Full name">ชื่อ-นามสกุล</span>
                <input id="pfName" type="text" autocomplete="name" maxlength="120" value="${esc(p.full_name || '')}" /></label>
              <label><span data-en="Email">อีเมล</span>
                <input type="email" value="${esc(u.email || '')}" readonly aria-readonly="true" /></label>
            </div>
            <div class="form__row">
              <label><span data-en="Phone">เบอร์โทร</span>
                <input id="pfPhone" type="tel" autocomplete="tel" maxlength="40" value="${esc(p.phone || '')}" /></label>
              <label><span data-en="Company">บริษัท / องค์กร</span>
                <input id="pfCo" type="text" autocomplete="organization" maxlength="160" value="${esc(p.company || '')}" /></label>
            </div>
            <p class="ac-note" data-en="Your email cannot be changed here — changing it would need a confirmation e-mail we cannot send. Ask our team and we will change it for you.">เปลี่ยนอีเมลเองไม่ได้ เพราะต้องส่งอีเมลยืนยันซึ่งระบบยังส่งไม่ได้ แจ้งทีมงานแล้วเราจะเปลี่ยนให้</p>
            ${msgBox('pfMsg')}
            <div class="ac-row">
              <button class="btn btn--primary btn--sm" type="submit" id="pfGo" data-en="Save">บันทึก</button>
              <a class="ac-link" href="#password" data-en="Change password">เปลี่ยนรหัสผ่าน</a>
            </div>
          </form>
        </article>

        <article class="ac-card ac-card--wide ac-danger">
          <h2 class="ac-card__h" data-en="Delete my account">ลบบัญชีของฉัน</h2>
          <p class="ac-small" data-en="This removes your account, your details, and everything you submitted while signed in — wellness answers and workshop codes included. It cannot be undone.">จะลบบัญชี ข้อมูลส่วนตัว และทุกอย่างที่ส่งขณะเข้าสู่ระบบ รวมถึงผลประเมินและรหัสรับสิทธิ์ ย้อนกลับไม่ได้</p>
          <form class="form ac-del" id="acDel" novalidate>
            <label class="form__full"><span data-en="Type ลบบัญชี (or delete) to confirm">พิมพ์คำว่า ลบบัญชี เพื่อยืนยัน</span>
              <input id="delWord" type="text" autocomplete="off" spellcheck="false" /></label>
            ${msgBox('delMsg')}
            <button class="btn ac-btn-danger btn--sm" type="submit" id="delGo" data-en="Delete my account">ลบบัญชีของฉัน</button>
          </form>
        </article>
      </div>`, true);

    document.getElementById('acOut').addEventListener('click', async () => {
      await A.signOut();
      history.replaceState(null, '', location.pathname + '#login');
      viewLogin();
    });

    document.getElementById('acProfile').addEventListener('submit', async e => {
      e.preventDefault();
      hide('pfMsg');
      const name = document.getElementById('pfName').value.trim();
      const phone = document.getElementById('pfPhone').value.trim();
      if (!name) return show('pfMsg', 'กรุณากรอกชื่อ', 'Please enter your name.');
      if (phone && phone.replace(/\D/g, '').length < 9) return show('pfMsg', 'เบอร์โทรยังไม่ถูกต้อง', 'That phone number does not look right.');
      const btn = document.getElementById('pfGo');
      busy(btn, true, 'กำลังบันทึก…', 'Saving…');
      try {
        await A.rest('profiles?id=eq.' + encodeURIComponent(u.id), {
          method: 'PATCH', headers: { Prefer: 'return=minimal' },
          body: { full_name: name, phone: phone, company: document.getElementById('pfCo').value.trim() }
        });
        A.setName(name);
        busy(btn, false);
        show('pfMsg', 'บันทึกแล้ว', 'Saved.', 'ok');
      } catch (err) {
        busy(btn, false);
        const [th, en] = explain(err);
        show('pfMsg', th, en);
      }
    });

    document.getElementById('acDel').addEventListener('submit', async e => {
      e.preventDefault();
      hide('delMsg');
      const word = document.getElementById('delWord').value.trim().toLowerCase();
      if (word !== 'ลบบัญชี' && word !== 'delete') {
        return show('delMsg', 'พิมพ์คำว่า ลบบัญชี ให้ตรงก่อน', 'Type ลบบัญชี or delete exactly to confirm.');
      }
      const btn = document.getElementById('delGo');
      busy(btn, true, 'กำลังลบ…', 'Deleting…');
      try {
        await A.rpc('bh_delete_my_account');
        await A.signOut();
        frame(`
          <h1 class="ac-title" data-en="Your account has been deleted">ลบบัญชีของคุณแล้ว</h1>
          <p class="ac-lead" data-en="Your details and everything you submitted while signed in are gone. Anything you sent before you had an account — an enquiry, for example — can be removed too: email b-healthy@pzentsmart.com.">ข้อมูลของคุณและทุกอย่างที่ส่งขณะเข้าสู่ระบบถูกลบแล้ว สิ่งที่ส่งก่อนมีบัญชี เช่น แบบฟอร์มติดต่อ ขอให้ลบได้ที่ b-healthy@pzentsmart.com</p>
          <p class="ac-alt"><a href="index.html" data-en="Back to the home page">กลับหน้าแรก</a></p>`);
      } catch (err) {
        busy(btn, false);
        const [th, en] = explain(err);
        show('delMsg', th, en);
      }
    });
  }

  // =================================================================
  function route() {
    const h = location.hash.replace('#', '');
    if (A.user()) {
      if (h === 'password') return viewPassword(false);
      return viewDashboard();
    }
    if (h === 'signup') return viewSignup();
    if (h === 'forgot') return viewForgot();
    return viewLogin();
  }

  window.addEventListener('hashchange', route);
  route();
})();
