// ============================================================
// B-Healthy — member accounts and forgotten passwords (admin.html → Members)
//
// Nothing can be e-mailed from this project, so a forgotten password comes
// here as a request. The procedure the screen walks staff through:
//
//   1. Call the phone number ON THE ACCOUNT — never the one typed into the
//      request. Anyone can type any number; only the real member answers the
//      one they signed up with.
//   2. Confirm who you are speaking to.
//   3. Issue a temporary password, read it out, and close the request.
//
// The member is signed out everywhere and has to choose a new password the
// moment they sign in with the temporary one.
// ============================================================
(function () {
  const $ = id => document.getElementById(id);
  const esc = window.bhEsc;
  let sb = null, members = [], requests = [];

  window.bhMembersInit = client => { sb = client; };

  const fmt = s => {
    if (!s) return '—';
    const d = new Date(s);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };
  const digits = s => String(s || '').replace(/\D/g, '');
  const suspended = m => !!(m && m.banned_until && new Date(m.banned_until) > new Date());

  function err(text) {
    $('memMsg').textContent = text;
    $('memMsg').className = 'msg msg--err show';
  }

  async function load() {
    if (!sb) return;
    $('memMsg').className = 'msg';
    $('memList').innerHTML = '<div class="empty">Loading…</div>';
    $('memReq').innerHTML = '';

    const [m, r] = await Promise.all([
      sb.rpc('bh_staff_members'),
      sb.from('submissions').select('id,created_at,email,phone,status,payload')
        .eq('type', 'password-reset').in('status', ['new', 'contacted'])
        .order('created_at', { ascending: false })
    ]);
    if (m.error) {
      $('memList').innerHTML = '';
      return err(/bh_staff_members|schema cache|function/i.test(m.error.message)
        ? 'Member accounts are not set up yet — run supabase-members.sql in Supabase, then press Refresh.'
        : m.error.message);
    }
    members = m.data || [];
    requests = r.error ? [] : (r.data || []);
    render();
  }

  function byEmail(email) {
    const e = String(email || '').trim().toLowerCase();
    return members.find(x => String(x.email || '').toLowerCase() === e) || null;
  }

  function render() {
    // ---- password requests ----
    $('memReq').innerHTML = requests.length ? `
      <h3 class="mem-h">Forgotten passwords <span class="group__count">${requests.length}</span></h3>
      <div class="leads">${requests.map(q => {
        const m = byEmail(q.email);
        const same = m && digits(m.phone) && digits(m.phone) === digits(q.phone);
        return `
        <div class="lead mem-req" data-req="${q.id}">
          <div class="lead__top">
            <div class="lead__who">
              <div class="lead__name">${esc(q.email || '(no email)')}</div>
              <div class="lead__meta"><span class="tag tag--${esc(q.status)}">${esc(q.status)}</span><span>${esc(fmt(q.created_at))}</span></div>
            </div>
            <div class="lead__acts">
              ${m && !m.is_staff ? `<button class="btn btn--sm" data-act="temp" data-user="${esc(m.id)}" data-who="${esc(m.full_name || m.email)}">Issue temporary password</button>` : ''}
              <button class="btn btn--soft btn--sm" data-act="close" data-req="${q.id}">Close request</button>
            </div>
          </div>
          ${m ? `
            <div class="mem-call">
              <span class="mem-call__k">Call this number</span>
              <a class="mem-call__n" href="tel:${esc(m.phone || '')}">${esc(m.phone || '— no phone on the account —')}</a>
              <span class="mem-call__who">${esc(m.full_name || '')}${m.company ? ' · ' + esc(m.company) : ''}</span>
            </div>
            <p class="mem-warn">Typed into the request: <b>${esc(q.phone || '—')}</b>
              ${same ? '<span class="mem-ok">matches the account</span>'
                     : '<span class="mem-bad">does NOT match the account — do not use it to verify</span>'}</p>`
          : m === null ? `<p class="mem-warn">No account uses this email. Nothing to reset — close the request.</p>` : ''}
          ${m && m.is_staff ? `<p class="mem-warn">This is a staff account. Staff passwords are reset in the Supabase dashboard, not here.</p>` : ''}
        </div>`;
      }).join('')}</div>` : '';

    // ---- everyone with an account ----
    $('memCount').textContent = members.filter(x => !x.is_staff).length;
    $('memList').innerHTML = members.length ? `
      <div class="mem-table" role="table">
        <div class="mem-row mem-row--h" role="row">
          <span role="columnheader">Member</span><span role="columnheader">Phone</span>
          <span role="columnheader">Joined</span><span role="columnheader">Last sign-in</span><span></span>
        </div>
        ${members.map(m => `
        <div class="mem-row" role="row">
          <span role="cell"><b>${esc(m.full_name || '—')}</b>
            ${m.is_staff ? '<span class="tag tag--member">staff</span>' : ''}
            ${m.must_change_password ? '<span class="tag tag--contacted">temp password</span>' : ''}
            ${suspended(m) ? '<span class="tag tag--lost">suspended</span>' : ''}
            <small>${esc(m.email || '')}${m.company ? ' · ' + esc(m.company) : ''}</small></span>
          <span role="cell">${m.phone ? `<a href="tel:${esc(m.phone)}">${esc(m.phone)}</a>` : '—'}</span>
          <span role="cell">${esc(fmt(m.created_at))}</span>
          <span role="cell">${esc(fmt(m.last_sign_in_at))}</span>
          <span role="cell"><button class="btn btn--soft btn--sm" data-act="open" data-user="${esc(m.id)}">${m.is_staff ? 'View' : 'Manage'}</button></span>
        </div>`).join('')}
      </div>` : '<div class="empty">No accounts yet.</div>';
  }

  // ---- temporary password, shown once --------------------------------
  function reveal(who, pw) {
    const box = $('memTemp');
    box.innerHTML = `
      <div class="mem-modal" role="dialog" aria-modal="true" aria-labelledby="memTempH">
        <h3 id="memTempH">Temporary password for ${esc(who)}</h3>
        <p class="mem-pw" id="memPw">${esc(pw)}</p>
        <p class="hint">Read it out over the phone — never send it by chat or e-mail. It is shown once:
          close this and it is gone. They will be asked to choose their own the moment they sign in,
          and they have already been signed out everywhere else.</p>
        <div class="foot"><button class="btn btn--soft" id="memCopy" type="button">Copy</button>
          <span class="sp"></span><button class="btn" id="memDone" type="button">Done</button></div>
      </div>`;
    box.hidden = false;
    $('memDone').focus();
    $('memCopy').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(pw); $('memCopy').textContent = 'Copied'; }
      catch (_) { $('memCopy').textContent = 'Select and copy it by hand'; }
    });
    $('memDone').addEventListener('click', () => { box.innerHTML = ''; box.hidden = true; });
  }

  async function issue(btn) {
    const user = btn.dataset.user, who = btn.dataset.who || 'this member';
    if (!confirm(`Issue a temporary password for ${who}?\n\nOnly do this after confirming who you are speaking to on the phone number stored on their account.\nTheir current password stops working and they are signed out everywhere.`)) return;
    btn.disabled = true;
    const { data, error } = await sb.rpc('bh_issue_temp_password', { p_user: user });
    btn.disabled = false;
    if (error) return err(error.message);

    // Any open request for this member is now dealt with.
    const m = members.find(x => x.id === user);
    const open = requests.filter(q => m && String(q.email || '').toLowerCase() === String(m.email || '').toLowerCase());
    for (const q of open) await sb.from('submissions').update({ status: 'won' }).eq('id', q.id);

    reveal(who, data);
    await load();
    if (openId === user) openPanel(user);
  }

  // =================================================================
  // One member, everything staff can do about them
  // =================================================================
  let openId = null, returnFocus = null;

  const KIND = {
    wellness: 'Wellness check', 'workshop-claim': 'Workshop claim', member: 'Article sign-up',
    'password-reset': 'Password request', booking: 'Booking', contact: 'Enquiry', register: 'Registration'
  };
  function what(r) {
    const p = r.payload || {};
    if (r.type === 'wellness') return (p.primary || '?').toUpperCase() + ' / ' + (p.secondary || '?').toUpperCase();
    if (r.type === 'workshop-claim') return (p.claim_code || '—') + (p.team_size ? ' · team ' + p.team_size : '');
    return r.subject || r.package || '';
  }
  const rowList = (rows, pick) => rows.length ? `<ul class="mem-subs">${rows.map(r => `
      <li>${pick ? `<label><input type="checkbox" value="${esc(r.id)}" />` : ''}
        <span class="mem-subs__k">${esc(KIND[r.type] || r.type || '—')}</span>
        <span class="mem-subs__v">${esc(what(r))}</span>
        <span class="mem-subs__d">${esc(fmt(r.created_at))}</span>${pick ? '</label>' : ''}</li>`).join('')}</ul>` : '';

  function panelMsg(text, ok) {
    const el = $('mpMsg'); if (!el) return;
    el.textContent = text;
    el.className = 'msg ' + (ok ? 'msg--ok' : 'msg--err') + ' show';
  }

  async function openPanel(id) {
    const m = members.find(x => x.id === id);
    if (!m) return;
    openId = id;
    const box = $('memPanel');
    box.hidden = false;
    box.innerHTML = `<div class="mem-modal mem-panel" role="dialog" aria-modal="true" aria-labelledby="mpH"><p class="hint">Loading…</p></div>`;

    // What they own, and — separately — what they sent before signing up
    // under the same address. LIKE treats _ and % as wildcards, and both turn
    // up in e-mail addresses, so they are escaped and the result re-checked.
    const pattern = String(m.email || '').replace(/[\\%_]/g, c => '\\' + c);
    const [own, loose] = await Promise.all([
      sb.from('submissions').select('id,created_at,type,subject,package,payload,email')
        .eq('user_id', id).order('created_at', { ascending: false }),
      m.is_staff ? Promise.resolve({ data: [] }) :
        sb.from('submissions').select('id,created_at,type,subject,package,payload,email')
          .is('user_id', null).ilike('email', pattern).order('created_at', { ascending: false })
    ]);
    const mine = own.data || [];
    const cand = (loose.data || []).filter(r => String(r.email || '').toLowerCase() === String(m.email || '').toLowerCase()
                                              && r.type !== 'password-reset');
    const staff = m.is_staff, off = suspended(m);

    box.innerHTML = `
      <div class="mem-modal mem-panel" role="dialog" aria-modal="true" aria-labelledby="mpH">
        <div class="mp-head">
          <div>
            <h3 id="mpH" tabindex="-1">${esc(m.full_name || m.email)}
              ${staff ? '<span class="tag tag--member">staff</span>' : ''}
              ${m.must_change_password ? '<span class="tag tag--contacted">temp password</span>' : ''}
              ${off ? '<span class="tag tag--lost">suspended</span>' : ''}</h3>
            <p class="hint">${esc(m.email)} · joined ${esc(fmt(m.created_at))} · last sign-in ${esc(fmt(m.last_sign_in_at))}</p>
          </div>
          <button class="mp-x" type="button" data-act="shut" aria-label="Close">×</button>
        </div>
        <div class="msg" id="mpMsg"></div>

        ${staff ? `<p class="mem-warn">This is a staff account. Its e-mail, password, suspension and deletion are
          handled in the Supabase dashboard, deliberately — never from a button one stolen staff session could press.</p>` : ''}

        <section class="mp-sec">
          <h4>Details</h4>
          <form id="mpDetails" class="mp-grid" novalidate>
            <label>Name<input id="mpName" value="${esc(m.full_name || '')}" maxlength="120" /></label>
            <label>Phone<input id="mpPhone" value="${esc(m.phone || '')}" maxlength="40" /></label>
            <label>Company<input id="mpCo" value="${esc(m.company || '')}" maxlength="160" /></label>
            <div class="mp-act"><button class="btn btn--sm" type="submit">Save details</button></div>
          </form>
        </section>

        ${staff ? '' : `
        <section class="mp-sec">
          <h4>E-mail</h4>
          <p class="hint">Members cannot change this themselves — it would need a confirmation mail that cannot be sent.
            Change it only after confirming who you are speaking to on the phone number above.</p>
          <form id="mpEmail" class="mp-inline" novalidate>
            <input id="mpNewEmail" type="email" placeholder="new@example.com" aria-label="New e-mail" />
            <button class="btn btn--soft btn--sm" type="submit">Change e-mail</button>
          </form>
        </section>`}

        <section class="mp-sec">
          <h4>On their account <span class="group__count">${mine.length}</span></h4>
          ${mine.length ? rowList(mine, false) : '<p class="hint">Nothing submitted while signed in yet.</p>'}
        </section>

        ${staff || !cand.length ? '' : `
        <section class="mp-sec mp-attach">
          <h4>Sent before they had an account <span class="group__count">${cand.length}</span></h4>
          <p class="hint">Same e-mail address, no owner. An unconfirmed e-mail proves nothing — anyone can sign up as
            anyone — so attach these <b>only after confirming identity by phone</b>. Once attached the member sees them,
            and they go if the account is deleted.</p>
          <form id="mpAttach" novalidate>
            ${rowList(cand, true)}
            <button class="btn btn--soft btn--sm" type="submit">Attach selected</button>
          </form>
        </section>`}

        ${staff ? '' : `
        <section class="mp-sec mp-row">
          <button class="btn btn--sm" type="button" data-act="temp" data-user="${esc(m.id)}" data-who="${esc(m.full_name || m.email)}">Issue temporary password</button>
          <button class="btn btn--sm ${off ? 'btn--ok' : 'btn--warn'}" type="button" data-act="suspend" data-on="${off ? '0' : '1'}">
            ${off ? 'Lift suspension' : 'Suspend account'}</button>
        </section>

        <section class="mp-sec mp-danger">
          <h4>Delete account</h4>
          <p class="hint">Removes the account, the profile, and everything on it. It cannot be undone.
            Type the member's e-mail to confirm.</p>
          <form id="mpDelete" class="mp-inline" novalidate>
            <input id="mpDelWord" type="text" autocomplete="off" spellcheck="false" aria-label="Type the e-mail to confirm" placeholder="${esc(m.email)}" />
            <button class="btn btn--danger btn--sm" type="submit">Delete account</button>
          </form>
        </section>`}
      </div>`;

    $('mpH').focus();
    bindPanel(m);
  }

  function closePanel() {
    const box = $('memPanel');
    box.innerHTML = ''; box.hidden = true; openId = null;
    if (returnFocus && document.body.contains(returnFocus)) returnFocus.focus();
  }

  function bindPanel(m) {
    $('mpDetails').addEventListener('submit', async e => {
      e.preventDefault();
      const { error } = await sb.from('profiles').update({
        full_name: $('mpName').value.trim(), phone: $('mpPhone').value.trim(), company: $('mpCo').value.trim()
      }).eq('id', m.id);
      if (error) return panelMsg(error.message);
      await load(); await openPanel(m.id); panelMsg('Details saved.', true);
    });

    const em = $('mpEmail');
    if (em) em.addEventListener('submit', async e => {
      e.preventDefault();
      const to = $('mpNewEmail').value.trim();
      if (!to) return panelMsg('Type the new e-mail first.');
      if (!confirm(`Change ${m.email} to ${to}?\n\nThey will sign in with the new address from now on. Only do this after confirming who you are speaking to.`)) return;
      const { data, error } = await sb.rpc('bh_admin_set_email', { p_user: m.id, p_email: to });
      if (error) return panelMsg(error.message);
      await load(); await openPanel(m.id); panelMsg(`E-mail changed to ${data}. Tell them — nothing is sent automatically.`, true);
    });

    const at = $('mpAttach');
    if (at) at.addEventListener('submit', async e => {
      e.preventDefault();
      const ids = [...at.querySelectorAll('input:checked')].map(i => Number(i.value));
      if (!ids.length) return panelMsg('Tick the rows to attach first.');
      if (!confirm(`Attach ${ids.length} item(s) to ${m.full_name || m.email}?\n\nOnly if you have confirmed their identity by phone.`)) return;
      const { data, error } = await sb.rpc('bh_admin_attach_submissions', { p_user: m.id, p_ids: ids });
      if (error) return panelMsg(error.message);
      await openPanel(m.id);
      panelMsg(data === ids.length ? `Attached ${data}.` : `Attached ${data} of ${ids.length} — the rest no longer matched this account's e-mail.`, data === ids.length);
    });

    const del = $('mpDelete');
    if (del) del.addEventListener('submit', async e => {
      e.preventDefault();
      if ($('mpDelWord').value.trim().toLowerCase() !== String(m.email || '').toLowerCase()) {
        return panelMsg("Type the member's e-mail exactly to confirm.");
      }
      if (!confirm(`Delete ${m.email} for good?`)) return;
      const { error } = await sb.rpc('bh_admin_delete_member', { p_user: m.id });
      if (error) return panelMsg(error.message);
      closePanel(); await load();
      err(`Deleted ${m.email}.`); $('memMsg').className = 'msg msg--ok show';
    });
  }

  $('memPanel').addEventListener('click', async e => {
    if (e.target === $('memPanel')) return closePanel();       // backdrop
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    if (b.dataset.act === 'shut') return closePanel();
    if (b.dataset.act === 'temp') return issue(b);
    if (b.dataset.act === 'suspend') {
      const on = b.dataset.on === '1';
      const m = members.find(x => x.id === openId);
      if (!confirm(on
        ? `Suspend ${m.full_name || m.email}?\n\nThey are signed out now and cannot sign in until you lift it. Nothing on the account is deleted.`
        : `Lift the suspension on ${m.full_name || m.email}?`)) return;
      b.disabled = true;
      const { error } = await sb.rpc('bh_admin_set_suspended', { p_user: openId, p_on: on });
      if (error) { b.disabled = false; return panelMsg(error.message); }
      const id = openId;
      await load(); await openPanel(id); panelMsg(on ? 'Suspended.' : 'Suspension lifted.', true);
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('memPanel').hidden) closePanel(); });

  window.bhMembersLoad = load;

  $('memRefresh').addEventListener('click', load);
  document.getElementById('tab-members').addEventListener('click', async e => {
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    if (b.dataset.act === 'temp') return issue(b);
    if (b.dataset.act === 'open') { returnFocus = b; return openPanel(b.dataset.user); }
    if (b.dataset.act === 'close') {
      b.disabled = true;
      const { error } = await sb.from('submissions').update({ status: 'lost' }).eq('id', +b.dataset.req);
      if (error) { b.disabled = false; return err(error.message); }
      load();
    }
  });
})();
