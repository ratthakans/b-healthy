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
            <small>${esc(m.email || '')}${m.company ? ' · ' + esc(m.company) : ''}</small></span>
          <span role="cell">${m.phone ? `<a href="tel:${esc(m.phone)}">${esc(m.phone)}</a>` : '—'}</span>
          <span role="cell">${esc(fmt(m.created_at))}</span>
          <span role="cell">${esc(fmt(m.last_sign_in_at))}</span>
          <span role="cell">${m.is_staff ? '' : `<button class="btn btn--soft btn--sm" data-act="temp" data-user="${esc(m.id)}" data-who="${esc(m.full_name || m.email)}">Temp password</button>`}</span>
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
    load();
  }

  window.bhMembersLoad = load;

  $('memRefresh').addEventListener('click', load);
  document.getElementById('tab-members').addEventListener('click', async e => {
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    if (b.dataset.act === 'temp') return issue(b);
    if (b.dataset.act === 'close') {
      b.disabled = true;
      const { error } = await sb.from('submissions').update({ status: 'lost' }).eq('id', +b.dataset.req);
      if (error) { b.disabled = false; return err(error.message); }
      load();
    }
  });
})();
