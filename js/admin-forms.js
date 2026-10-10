// ============================================================
// B-Healthy — Wellness Check submissions (admin.html → Form)
//
// Reads the same `submissions` table as Customers, filtered to
// type = 'wellness'. Nothing new in the database: the answers, the five
// scores and the consent timestamp all travel in `payload`.
//
// Kept apart from the Customers tab on purpose. One is someone asking to be
// called about a booking; the other is someone who answered nine questions
// about how tired they are. They are read differently and they are worked
// differently.
// ============================================================
(function () {
  const $ = id => document.getElementById(id);
  const esc = window.bhEsc;

  let sb = null, rows = [], filter = '*';

  window.bhFormsInit = client => { sb = client; };

  const D = () => window.BH_WELLNESS || { QUESTIONS: {}, DIRECTIONS: [], DIRECTION_LABEL: {} };
  const DIRS = () => D().DIRECTIONS || [];

  // Answers are stored as the option values the form used; show what the
  // person actually read on screen.
  function label(qid, value) {
    const q = (D().QUESTIONS || {})[qid];
    if (!q) return value || '';
    const o = (q.options || []).find(x => x.v === value);
    return o ? (o.label.th || o.label.en) : (value || '');
  }
  function question(qid) {
    const q = (D().QUESTIONS || {})[qid];
    return q ? (q.q.th || q.q.en) : qid;
  }
  const dirName = d => {
    const l = (D().DIRECTION_LABEL || {})[d];
    return l ? `${l.en} · ${l.th}` : (d || '—');
  };

  function fmtDate(s) {
    if (!s) return '';
    const d = new Date(s);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  async function load() {
    if (!sb) return;
    $('formMsg').className = 'msg';
    $('forms').innerHTML = '<div class="empty">Loading…</div>';
    const { data, error } = await sb.from('submissions')
      .select('id,created_at,name,email,phone,subject,payload,status')
      .eq('type', 'wellness')
      .order('created_at', { ascending: false });
    if (error) {
      $('forms').innerHTML = '';
      $('formMsg').textContent = error.message;
      $('formMsg').className = 'msg msg--err show';
      return;
    }
    rows = data || [];
    renderFilters();
    render();
  }

  function renderFilters() {
    const counts = {};
    rows.forEach(r => {
      const p = (r.payload || {}).primary;
      if (p) counts[p] = (counts[p] || 0) + 1;
    });
    $('formFilters').innerHTML =
      `<button class="prog__filter${filter === '*' ? ' is-active' : ''}" data-dir="*" type="button">All (${rows.length})</button>` +
      DIRS().map(d => `<button class="prog__filter${filter === d ? ' is-active' : ''}" data-dir="${esc(d)}" type="button">${esc(((D().DIRECTION_LABEL || {})[d] || {}).en || d)} (${counts[d] || 0})</button>`).join('');
  }

  function render() {
    const list = filter === '*' ? rows : rows.filter(r => (r.payload || {}).primary === filter);
    if (!list.length) {
      $('forms').innerHTML = `<div class="empty">${rows.length
        ? 'No one with this direction yet.'
        : 'Nobody has completed the wellness check yet.<br>It lives at <code>/wellness-check</code> — share that link to start collecting.'}</div>`;
      return;
    }
    const STATUSES = ['new', 'contacted', 'won', 'lost'];
    const QORDER = ['feeling', 'energy', 'desired', 'pain', 'work_style', 'work_type', 'age_group', 'pref', 'interest'];

    $('forms').innerHTML = '<div class="leads">' + list.map(r => {
      const p = r.payload || {};
      const a = p.answers || {};
      const sc = p.scores || {};
      const max = Math.max(1, ...DIRS().map(d => Number(sc[d]) || 0));
      return `
      <div class="lead" data-id="${r.id}">
        <div class="lead__top">
          <div class="lead__who">
            <div class="lead__name">${esc(r.name || '(no name)')}</div>
            <div class="lead__meta">
              ${p.primary ? `<span class="tag tag--dir">${esc(dirName(p.primary))}</span>` : ''}
              ${p.secondary ? `<span class="tag tag--dir2">${esc(dirName(p.secondary))}</span>` : ''}
              <span class="tag tag--${esc(r.status)}">${esc(r.status)}</span>
              <span>${esc(fmtDate(r.created_at))}</span>
            </div>
          </div>
          <div class="lead__acts">
            <select data-act="status">${STATUSES.map(s => `<option value="${s}"${s === r.status ? ' selected' : ''}>${s}</option>`).join('')}</select>
            <button class="btn btn--danger btn--sm" data-act="del">Delete</button>
          </div>
        </div>
        <div class="lead__contact">
          ${r.phone ? `<span>📞 <a href="tel:${esc(r.phone)}">${esc(r.phone)}</a></span>` : ''}
          ${r.email ? `<span>✉️ <a href="mailto:${esc(r.email)}">${esc(r.email)}</a></span>` : ''}
          ${p.consent_at ? `<span title="Consent given at this moment">✅ consent ${esc(fmtDate(p.consent_at))}</span>` : '<span class="fm-noconsent">⚠️ no consent recorded</span>'}
        </div>
        <div class="fm-scores">
          ${DIRS().slice().sort((x, y) => (Number(sc[y]) || 0) - (Number(sc[x]) || 0)).map(d => `
            <span class="fm-score"><b>${esc(((D().DIRECTION_LABEL || {})[d] || {}).en || d)}</b>
              <i style="width:${Math.max(2, Math.round(((Number(sc[d]) || 0) / max) * 46))}px"></i>
              <em>${esc(Number(sc[d]) || 0)}</em></span>`).join('')}
        </div>
        <details class="fm-det">
          <summary>All nine answers</summary>
          <dl class="fm-ans">
            ${QORDER.filter(q => a[q]).map(q => `<dt>${esc(question(q))}</dt><dd>${esc(label(q, a[q]))}</dd>`).join('')}
          </dl>
        </details>
      </div>`;
    }).join('') + '</div>';
  }

  // ---- CSV: one row per person, every answer and score flattened ---------
  function csv() {
    const QORDER = ['feeling', 'energy', 'desired', 'pain', 'work_style', 'work_type', 'age_group', 'pref', 'interest'];
    const head = ['date', 'name', 'email', 'phone', 'status', 'primary', 'secondary']
      .concat(DIRS().map(d => 'score_' + d))
      .concat(QORDER);
    const cell = v => {
      const s = String(v == null ? '' : v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const body = rows.map(r => {
      const p = r.payload || {}, a = p.answers || {}, sc = p.scores || {};
      return [r.created_at, r.name, r.email, r.phone, r.status, p.primary, p.secondary]
        .concat(DIRS().map(d => sc[d]))
        .concat(QORDER.map(q => label(q, a[q])))
        .map(cell).join(',');
    });
    // The BOM is not noise: without it Excel opens Thai answers as mojibake.
    const blob = new Blob(['﻿' + [head.join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'b-healthy-wellness-check-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  window.bhFormsLoad = load;

  $('formRefresh').addEventListener('click', load);
  $('formExport').addEventListener('click', csv);
  $('formFilters').addEventListener('click', e => {
    const b = e.target.closest('.prog__filter'); if (!b) return;
    filter = b.dataset.dir;
    renderFilters(); render();
  });

  $('forms').addEventListener('change', async e => {
    const sel = e.target.closest('select[data-act="status"]'); if (!sel) return;
    const id = +e.target.closest('.lead').dataset.id;
    const { error } = await sb.from('submissions').update({ status: sel.value }).eq('id', id);
    if (error) { $('formMsg').textContent = error.message; $('formMsg').className = 'msg msg--err show'; return; }
    const r = rows.find(x => x.id === id); if (r) r.status = sel.value;
    renderFilters(); render();
  });

  $('forms').addEventListener('click', async e => {
    const btn = e.target.closest('button[data-act="del"]'); if (!btn) return;
    const row = e.target.closest('.lead');
    const id = +row.dataset.id;
    const who = row.querySelector('.lead__name').textContent;
    // Health answers given under consent — deleting is right when asked for,
    // and worth one confirmation either way.
    if (!confirm(`Delete the wellness check from ${who}? This cannot be undone.`)) return;
    const { error } = await sb.from('submissions').delete().eq('id', id);
    if (error) { $('formMsg').textContent = error.message; $('formMsg').className = 'msg msg--err show'; return; }
    rows = rows.filter(x => x.id !== id);
    renderFilters(); render();
  });
})();
