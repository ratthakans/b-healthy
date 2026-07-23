// ============================================================
// B-Healthy — Package Manager (admin.html)
// Auth + CRUD against the Supabase `packages` table.
// Account-agnostic: reads keys from js/config.js (BH_CONFIG).
// ============================================================
(function () {
  const $ = id => document.getElementById(id);
  const cfg = window.BH_CONFIG || {};
  const url = (cfg.SUPABASE_URL || '').replace(/\/$/, '');
  const key = cfg.SUPABASE_ANON_KEY || '';

  const loginView = $('loginView'), appView = $('appView');
  const listView = $('listView'), editorView = $('editorView');

  // ---- Not configured yet ----
  if (!url || !key || !window.supabase) {
    showMsg('loginMsg', 'err',
      'Supabase is not connected yet. Add SUPABASE_URL + SUPABASE_ANON_KEY to js/config.js (see MIGRATION.md), then reload.');
    $('loginForm').querySelectorAll('input,button').forEach(el => el.disabled = true);
    return;
  }

  const sb = window.supabase.createClient(url, key);
  let rowsCache = [];

  // ---------- helpers ----------
  function showMsg(elId, kind, text) {
    const el = $(elId); if (!el) return;
    el.textContent = text;
    el.className = 'msg ' + (kind === 'ok' ? 'msg--ok' : 'msg--err') + ' show';
  }
  function clearMsg(elId) { const el = $(elId); if (el) el.className = 'msg'; }
  const splitComma = s => (s || '').split(',').map(x => x.trim()).filter(Boolean);
  const linesToArr = s => (s || '').split('\n').map(x => x.trim()).filter(Boolean);
  function parseJSONField(val, fallback, label) {
    const t = (val || '').trim();
    if (!t) return fallback;
    try { return JSON.parse(t); }
    catch (e) { throw new Error(`Invalid JSON in "${label}": ${e.message}`); }
  }
  // Escapes HTML — submissions are attacker-controlled, so this must never
  // return raw markup (it is interpolated into innerHTML).
  const esc = s => String(s == null ? '' : s)
    .replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- views ----------
  function showLogin() { loginView.classList.remove('hide'); appView.classList.add('hide'); }
  function showApp(email) {
    loginView.classList.add('hide'); appView.classList.remove('hide');
    $('whoami').textContent = email || '';
    showTab('packages');
  }
  function showList() { editorView.classList.add('hide'); listView.classList.remove('hide'); loadList(); }
  function showEditor() { listView.classList.add('hide'); editorView.classList.remove('hide'); }

  // ---------- auth ----------
  sb.auth.getSession().then(({ data }) => {
    if (data.session) showApp(data.session.user.email); else showLogin();
  });

  $('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    clearMsg('loginMsg');
    const btn = $('loginBtn'); btn.disabled = true; btn.textContent = 'Signing in…';
    const { data, error } = await sb.auth.signInWithPassword({
      email: $('email').value.trim(), password: $('password').value
    });
    btn.disabled = false; btn.textContent = 'Sign in';
    if (error) { showMsg('loginMsg', 'err', error.message); return; }
    showApp(data.user.email);
  });

  $('signOut').addEventListener('click', async () => { await sb.auth.signOut(); showLogin(); });

  // ---------- tabs ----------
  let currentTab = 'packages';
  function showTab(name) {
    currentTab = name;
    document.querySelectorAll('#tabs .tab').forEach(b => b.classList.toggle('is-active', b.dataset.tab === name));
    const isPkg = name === 'packages';
    $('tab-customers').classList.toggle('hide', isPkg);
    if (isPkg) { showList(); }
    else { $('listView').classList.add('hide'); $('editorView').classList.add('hide'); loadLeads(); }
  }
  $('tabs').addEventListener('click', e => {
    const b = e.target.closest('.tab'); if (b) showTab(b.dataset.tab);
  });

  // ---------- customers (form leads) ----------
  let leadsCache = [], leadFilter = '*';

  $('leadRefresh').addEventListener('click', loadLeads);
  $('leadFilters').addEventListener('click', e => {
    const b = e.target.closest('.prog__filter'); if (!b) return;
    $('leadFilters').querySelectorAll('.prog__filter').forEach(x => x.classList.remove('is-active'));
    b.classList.add('is-active');
    leadFilter = b.dataset.status;
    renderLeads();
  });

  async function loadLeads() {
    clearMsg('leadMsg');
    $('leads').innerHTML = '<div class="empty">Loading…</div>';
    const { data, error } = await sb.from('submissions')
      .select('id,created_at,type,name,company,phone,email,subject,package,pax,pref_date,message,status')
      .order('created_at', { ascending: false });
    if (error) {
      $('leads').innerHTML = '';
      showMsg('leadMsg', 'err', error.message.includes('submissions')
        ? 'Table "submissions" not found — run supabase-submissions.sql in Supabase first.'
        : error.message);
      return;
    }
    leadsCache = data || [];
    renderLeads();
  }

  function fmtDate(s) {
    if (!s) return '';
    const d = new Date(s);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  function renderLeads() {
    const rows = leadFilter === '*' ? leadsCache : leadsCache.filter(r => r.status === leadFilter);
    if (!rows.length) {
      $('leads').innerHTML = `<div class="empty">${leadsCache.length ? 'No leads with this status.' : 'No customer enquiries yet.<br>They appear here the moment someone submits a booking or contact form.'}</div>`;
      return;
    }
    const STATUSES = ['new', 'contacted', 'won', 'lost'];
    $('leads').innerHTML = `<div class="leads">` + rows.map(r => `
      <div class="lead" data-id="${r.id}">
        <div class="lead__top">
          <div class="lead__who">
            <div class="lead__name">${esc(r.name || '(no name)')}${r.company ? ` <span class="lead__company">· ${esc(r.company)}</span>` : ''}</div>
            <div class="lead__meta">
              <span class="tag tag--${r.type === 'contact' ? 'contact' : 'booking'}">${esc(r.type || 'lead')}</span>
              <span class="tag tag--${esc(r.status)}">${esc(r.status)}</span>
              <span>${fmtDate(r.created_at)}</span>
              ${r.package ? `<span>· ${esc(r.package)}</span>` : ''}
              ${r.subject ? `<span>· ${esc(r.subject)}</span>` : ''}
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
          ${r.pax ? `<span>👥 ${esc(r.pax)} pax</span>` : ''}
          ${r.pref_date ? `<span>📅 ${esc(r.pref_date)}</span>` : ''}
        </div>
        ${r.message ? `<div class="lead__msg">${esc(r.message)}</div>` : ''}
      </div>`).join('') + `</div>`;
  }

  $('leads').addEventListener('change', async e => {
    const sel = e.target.closest('select[data-act="status"]'); if (!sel) return;
    const id = +e.target.closest('.lead').dataset.id;
    const { error } = await sb.from('submissions').update({ status: sel.value }).eq('id', id);
    if (error) showMsg('leadMsg', 'err', error.message);
    else { const r = leadsCache.find(x => x.id === id); if (r) r.status = sel.value; renderLeads(); }
  });

  $('leads').addEventListener('click', async e => {
    const btn = e.target.closest('button[data-act="del"]'); if (!btn) return;
    const id = +e.target.closest('.lead').dataset.id;
    const r = leadsCache.find(x => x.id === id);
    if (!confirm(`Delete the enquiry from "${(r && r.name) || id}"? This cannot be undone.`)) return;
    const { error } = await sb.from('submissions').delete().eq('id', id);
    if (error) showMsg('leadMsg', 'err', error.message);
    else { leadsCache = leadsCache.filter(x => x.id !== id); renderLeads(); }
  });

  // ---------- list ----------
  async function loadList() {
    clearMsg('listMsg');
    $('list').innerHTML = '<div class="empty">Loading…</div>';
    const { data, error } = await sb.from('packages')
      .select('id,type,status,sort,name,data,en').order('type').order('sort');
    if (error) { $('list').innerHTML = ''; showMsg('listMsg', 'err', error.message); return; }
    rowsCache = data || [];
    if (!rowsCache.length) {
      $('list').innerHTML = '<div class="empty">No packages yet.<br>Click “Import current packages” to load what’s on the site now, or “+ New package”.</div>';
      return;
    }
    const rowHtml = r => {
      const hero = (r.data && r.data.hero) || '';
      return `<div class="row" data-id="${esc(r.id)}">
        <img class="row__thumb" src="${esc(hero)}" alt="" onerror="this.style.visibility='hidden'" />
        <div class="row__main">
          <div class="row__name">${esc(r.name || r.id)}</div>
          <div class="row__meta">
            <span class="tag tag--${r.status === 'published' ? 'published' : 'draft'}">${r.status}</span>
            <span>sort ${r.sort}</span><span>·</span><span>${esc(r.id)}</span>
          </div>
        </div>
        <div class="row__acts">
          <button class="btn btn--soft btn--sm" data-act="edit">Edit</button>
          <button class="btn btn--sm ${r.status === 'published' ? 'btn--warn' : 'btn--ok'}" data-act="toggle">${r.status === 'published' ? 'Unpublish' : 'Publish'}</button>
          <button class="btn btn--danger btn--sm" data-act="del">Delete</button>
        </div>
      </div>`;
    };
    const GROUPS = [
      { type: 'retreat', label: 'Retreats' },
      { type: 'workshop', label: 'Workshops' },
      { type: 'membership', label: 'Membership tiers' },
      { type: 'topic', label: 'Homepage topic images' }
    ];
    let html = GROUPS.map(g => {
      const rows = rowsCache.filter(r => r.type === g.type);
      if (!rows.length) return '';
      return `<section class="group">
        <div class="group__head"><span class="tag tag--${g.type}">${g.label}</span><span class="group__count">${rows.length}</span></div>
        ${rows.map(rowHtml).join('')}
      </section>`;
    }).join('');
    const others = rowsCache.filter(r => !GROUPS.some(g => g.type === r.type));
    if (others.length) {
      html += `<section class="group"><div class="group__head"><span class="tag">Other</span><span class="group__count">${others.length}</span></div>${others.map(rowHtml).join('')}</section>`;
    }
    $('list').innerHTML = html;
  }

  $('list').addEventListener('click', async e => {
    const btn = e.target.closest('button[data-act]'); if (!btn) return;
    const id = e.target.closest('.row').dataset.id;
    const row = rowsCache.find(r => r.id === id); if (!row) return;
    const act = btn.dataset.act;
    if (act === 'edit') { openEditor(row); }
    else if (act === 'toggle') {
      const next = row.status === 'published' ? 'draft' : 'published';
      btn.disabled = true;
      const { error } = await sb.from('packages').update({ status: next }).eq('id', id);
      if (error) showMsg('listMsg', 'err', error.message); else loadList();
    }
    else if (act === 'del') {
      if (!confirm(`Delete "${row.name || id}"? This cannot be undone.`)) return;
      const { error } = await sb.from('packages').delete().eq('id', id);
      if (error) showMsg('listMsg', 'err', error.message); else loadList();
    }
  });

  // ---------- import current (seed) ----------
  $('importBtn').addEventListener('click', async () => {
    const rows = [];
    (window.PACKAGE_ORDER || []).forEach((id, i) => {
      const o = window.PACKAGES[id]; if (o) rows.push({ id, type: 'retreat', status: 'published', sort: i, name: o.name, data: o, en: (window.PACKAGES_EN || {})[id] || {} });
    });
    (window.WORKSHOP_ORDER || []).forEach((id, i) => {
      const o = (window.WORKSHOPS || {})[id] || window.PACKAGES[id]; if (o) rows.push({ id, type: 'workshop', status: 'published', sort: i, name: o.name, data: o, en: (window.PACKAGES_EN || {})[id] || {} });
    });
    // membership tiers (from the site's infographic) so /membership.html can be edited here too
    const MEM_FEATURES = ['Employee App Access', 'Redeem Wellness Service', 'Company Portal', 'Credit Management'];
    [
      { id: 'mem-platinum', name: 'Platinum', price: '100,000', credits: '130,000', bonus: 'BONUS +30%', style: 'platinum' },
      { id: 'mem-gold', name: 'Gold', price: '50,000', credits: '60,000', bonus: 'BONUS +20%', style: 'gold' },
      { id: 'mem-silver', name: 'Silver', price: '20,000', credits: '22,000', bonus: 'BONUS +10%', style: 'silver' }
    ].forEach((m, i) => rows.push({ id: m.id, type: 'membership', status: 'published', sort: i, name: m.name, data: { ...m, type: 'membership', features: MEM_FEATURES.slice() }, en: {} }));
    // homepage topic headings — seeded with the photos currently on disk so they
    // can be swapped in the admin without touching code
    const TOPICS = [
      ['tour', 'stay-wellness', 'Stay Wellness', 3], ['tour', 'local-route', 'Local Route', 3],
      ['tour', 'health-assessment', 'Health Assessment', 3], ['tour', 'therapeutic-treatment', 'Therapeutic Treatment', 3],
      ['tour', 'food-as-medicine', 'Food as Medicine', 3], ['tour', 'sound-healing', 'Sound Healing', 3],
      ['tour', 'horo-health', 'Horo-Health', 3], ['tour', 'workshop-activities', 'Workshop Activities', 3],
      ['wk', 'office-syndrome', 'Office Syndrome', 3], ['wk', 'sound-healing', 'Sound Healing', 3],
      ['wk', 'yoga-meditation', 'Yoga Meditation', 3], ['wk', 'elemental-aroma-oil', 'Elemental Aroma Oil', 3],
      ['wk', 'personalized-herbal-tea', 'Personalized Herbal Tea', 3], ['wk', 'flower-mandala', 'Flower Mandala', 3]
    ];
    TOPICS.forEach(([g, k, label, n], i) => {
      const base = g === 'wk' ? 'images/workshop' : 'images/tourism';
      const images = Array.from({ length: n }, (_, j) => `${base}/${k}/${k}-${j + 1}.jpg`);
      rows.push({ id: `topic-${g}-${k}`, type: 'topic', status: 'published', sort: i,
        name: `${label} (${g === 'wk' ? 'Workshop' : 'Retreats'})`,
        data: { id: `topic-${g}-${k}`, type: 'topic', group: g, key: k, name: label, images }, en: {} });
    });
    if (!rows.length) { showMsg('listMsg', 'err', 'No hard-coded packages found to import.'); return; }
    if (!confirm(`Import ${rows.length} packages from the site into the database?\nExisting rows with the same ID will be overwritten.`)) return;
    const btn = $('importBtn'); btn.disabled = true; btn.textContent = 'Importing…';
    const { error } = await sb.from('packages').upsert(rows, { onConflict: 'id' });
    btn.disabled = false; btn.textContent = '↧ Import current packages';
    if (error) showMsg('listMsg', 'err', error.message);
    else { showMsg('listMsg', 'ok', `Imported ${rows.length} packages.`); loadList(); }
  });

  // ---------- image uploads (Supabase Storage) ----------
  const BUCKET = 'package-images';
  let galleryImgs = [];

  async function uploadFile(file) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const slug = ($('f_id').value.trim() || 'pkg').replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'pkg';
    const path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await sb.storage.from(BUCKET).upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type || undefined });
    if (error) throw error;
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  function setHeroPreview(url) {
    $('heroPreview').style.backgroundImage = url ? `url("${url}")` : '';
  }

  // Hero upload
  $('heroUploadBtn').addEventListener('click', () => $('heroFile').click());
  $('f_hero').addEventListener('input', () => setHeroPreview($('f_hero').value.trim()));
  $('heroFile').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file) return;
    const st = $('heroStatus'); st.textContent = 'Uploading…';
    try { const url = await uploadFile(file); $('f_hero').value = url; setHeroPreview(url); st.textContent = 'Uploaded ✓'; }
    catch (err) { st.textContent = 'Upload failed: ' + err.message; }
    e.target.value = '';
  });

  // Gallery
  function renderGallery() {
    $('galleryGrid').innerHTML = galleryImgs.map((url, i) =>
      `<div class="gal__item"><img src="${esc(url)}" alt="" /><button type="button" class="gal__del" data-i="${i}" title="Remove">×</button></div>`
    ).join('');
  }
  $('galleryGrid').addEventListener('click', e => {
    const del = e.target.closest('.gal__del'); if (!del) return;
    galleryImgs.splice(+del.dataset.i, 1); renderGallery();
  });
  $('galleryAddBtn').addEventListener('click', () => $('galleryFile').click());
  $('galleryFile').addEventListener('change', async e => {
    const files = [...e.target.files]; if (!files.length) return;
    const st = $('galleryStatus'); let done = 0;
    for (const file of files) {
      st.textContent = `Uploading ${done + 1}/${files.length}…`;
      try { const url = await uploadFile(file); galleryImgs.push(url); renderGallery(); done++; }
      catch (err) { st.textContent = 'Upload failed: ' + err.message; e.target.value = ''; return; }
    }
    st.textContent = `Uploaded ${done} image${done > 1 ? 's' : ''} ✓`;
    e.target.value = '';
  });

  // ---------- experiences / venue / itinerary (form editors, no JSON) ----------
  let experiences = [], venueImgs = [], itinerary = [];

  // Generic "pick a file and upload it" helper for the repeater rows.
  function pickAndUpload(onDone, statusEl, multiple) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*'; if (multiple) inp.multiple = true;
    inp.hidden = true; document.body.appendChild(inp);
    inp.addEventListener('change', async () => {
      const files = [...inp.files];
      for (const f of files) {
        if (statusEl) statusEl.textContent = 'Uploading…';
        try { onDone(await uploadFile(f)); }
        catch (err) { if (statusEl) statusEl.textContent = 'Upload failed: ' + err.message; }
      }
      inp.remove();
    });
    inp.click();
  }

  // --- Experiences ---
  function renderExp() {
    $('expList').innerHTML = experiences.map((x, i) => `
      <div class="rep" data-i="${i}">
        <div class="rep__head">
          <span class="rep__n">${i + 1}</span>
          <span class="rep__title">${esc(x.title || 'Experience')}</span>
          <button type="button" class="rep__del" data-act="exp-del">✕ Remove</button>
        </div>
        <div class="rep-img">
          <div class="rep-thumb" style="background-image:${x.img ? `url('${esc(x.img)}')` : 'none'}"></div>
          <div class="rep-img__ctl">
            <div class="grid">
              <label>Title<input data-f="title" value="${esc(x.title || '')}" placeholder="Yoga &amp; Meditation" /></label>
              <label>Thai subtitle<input data-f="th" value="${esc(x.th || '')}" placeholder="โยคะ &amp; สมาธิ" /></label>
            </div>
            <label>Description<textarea data-f="desc" placeholder="รายละเอียดกิจกรรม">${esc(x.desc || '')}</textarea></label>
            <div class="up-row">
              <button type="button" class="btn btn--soft btn--sm" data-act="exp-up">↥ Upload photo</button>
              <span class="hint" data-role="exp-status"></span>
            </div>
          </div>
        </div>
      </div>`).join('');
  }
  $('expList').addEventListener('input', e => {
    const f = e.target.dataset.f; if (!f) return;
    const rep = e.target.closest('.rep');
    experiences[+rep.dataset.i][f] = e.target.value;
    if (f === 'title') rep.querySelector('.rep__title').textContent = e.target.value || 'Experience';
  });
  $('expList').addEventListener('click', e => {
    const act = e.target.dataset.act; if (!act) return;
    const i = +e.target.closest('.rep').dataset.i;
    if (act === 'exp-del') { experiences.splice(i, 1); renderExp(); }
    else if (act === 'exp-up') {
      pickAndUpload(url => { experiences[i].img = url; renderExp(); },
        e.target.closest('.rep').querySelector('[data-role="exp-status"]'));
    }
  });
  $('expAdd').addEventListener('click', () => { experiences.push({ title: '', th: '', desc: '', img: '' }); renderExp(); });

  // --- Venue photos ---
  function renderVenue() {
    $('venueGrid').innerHTML = venueImgs.map((url, i) =>
      `<div class="gal__item"><img src="${esc(url)}" alt="" /><button type="button" class="gal__del" data-i="${i}" title="Remove">×</button></div>`).join('');
  }
  $('venueGrid').addEventListener('click', e => {
    const d = e.target.closest('.gal__del'); if (!d) return;
    venueImgs.splice(+d.dataset.i, 1); renderVenue();
  });
  $('venueAddBtn').addEventListener('click', () =>
    pickAndUpload(url => { venueImgs.push(url); renderVenue(); }, $('venueStatus'), true));

  // --- Itinerary ---
  function renderItin() {
    $('itinList').innerHTML = itinerary.map((d, i) => `
      <div class="rep" data-i="${i}">
        <div class="rep__head">
          <span class="rep__n">${i + 1}</span>
          <span class="rep__title">Day ${i + 1}</span>
          <button type="button" class="rep__del" data-act="itin-del">✕ Remove day</button>
        </div>
        <label>Day title<input data-f="title" value="${esc(d.title || '')}" placeholder="Workshop &amp; Connection Night" /></label>
        <label style="margin-top:10px">Schedule</label>
        ${(d.items || []).map((it, j) => `
          <div class="itin-item" data-j="${j}">
            <input data-f="time" value="${esc(it.time || '')}" placeholder="13.00" />
            <input data-f="text" value="${esc(it.text || '')}" placeholder="Welcome Check in" />
            <button type="button" class="rep__del" data-act="item-del">✕</button>
          </div>`).join('')}
        <button type="button" class="btn btn--soft btn--sm" style="margin-top:8px" data-act="item-add">＋ Add time slot</button>
      </div>`).join('');
  }
  $('itinList').addEventListener('input', e => {
    const f = e.target.dataset.f; if (!f) return;
    const i = +e.target.closest('.rep').dataset.i;
    const item = e.target.closest('.itin-item');
    if (item) itinerary[i].items[+item.dataset.j][f] = e.target.value;
    else itinerary[i][f] = e.target.value;
  });
  $('itinList').addEventListener('click', e => {
    const act = e.target.dataset.act; if (!act) return;
    const i = +e.target.closest('.rep').dataset.i;
    if (act === 'itin-del') { itinerary.splice(i, 1); renderItin(); }
    else if (act === 'item-add') { if (!itinerary[i].items) itinerary[i].items = []; itinerary[i].items.push({ time: '', text: '' }); renderItin(); }
    else if (act === 'item-del') { itinerary[i].items.splice(+e.target.closest('.itin-item').dataset.j, 1); renderItin(); }
  });
  $('itinAdd').addEventListener('click', () => {
    itinerary.push({ day: `Day ${itinerary.length + 1}`, title: '', items: [{ time: '', text: '' }] });
    renderItin();
  });

  // --- Homepage topic photos ---
  let topicImgs = [];
  function renderTopic() {
    $('topicGrid').innerHTML = topicImgs.map((url, i) =>
      `<div class="gal__item"><img src="${esc(url)}" alt="" /><button type="button" class="gal__del" data-i="${i}" title="Remove">×</button></div>`).join('');
  }
  $('topicGrid').addEventListener('click', e => {
    const d = e.target.closest('.gal__del'); if (!d) return;
    topicImgs.splice(+d.dataset.i, 1); renderTopic();
  });
  $('topicAddBtn').addEventListener('click', () =>
    pickAndUpload(url => { topicImgs.push(url); renderTopic(); }, $('topicStatus'), true));

  // ---------- editor ----------
  $('newBtn').addEventListener('click', () => openEditor(null));
  $('cancelBtn').addEventListener('click', showList);
  $('f_id').addEventListener('input', updatePreview);
  $('f_type').addEventListener('change', applyTypeMode);

  function applyTypeMode() { $('editorForm').dataset.mode = $('f_type').value; }

  function updatePreview() {
    $('previewBtn').href = 'package.html?id=' + encodeURIComponent($('f_id').value.trim());
  }

  function openEditor(row) {
    clearMsg('editorMsg');
    const d = (row && row.data) || {};
    $('editorTitle').textContent = row ? `Edit — ${row.name || row.id}` : 'New package';
    $('f_id').value = row ? row.id : '';
    $('f_id').readOnly = !!row;
    $('f_type').value = (row && row.type) || d.type || 'retreat';
    $('f_status').value = (row && row.status) || 'published';
    $('f_sort').value = row ? row.sort : 0;
    $('f_name').value = d.name || '';
    $('f_category').value = d.category || '';
    $('f_province').value = d.province || '';
    $('f_kicker').value = d.kicker || '';
    $('f_tagline').value = (d.tagline || []).join(', ');
    $('f_location').value = d.location || '';
    $('f_duration').value = d.duration || '';
    $('f_group').value = d.group || '';
    $('f_priceNow').value = d.priceNow || '';
    $('f_priceOld').value = d.priceOld || '';
    $('f_priceUnit').value = d.priceUnit || '';
    $('f_priceNote').value = d.priceNote || '';
    $('f_hero').value = d.hero || '';
    setHeroPreview(d.hero || '');
    galleryImgs = Array.isArray(d.gallery) ? d.gallery.slice() : [];
    renderGallery();
    $('heroStatus').textContent = ''; $('galleryStatus').textContent = '';
    $('f_theme_primary').value = toHex((d.theme || {}).primary, '#1ecad3');
    $('f_theme_accent').value = toHex((d.theme || {}).accent, '#425cc7');
    $('f_theme_tint').value = toHex((d.theme || {}).tint, '#e6f4f8');
    $('f_intro').value = d.intro || '';
    $('f_includes').value = (d.includes || []).join('\n');
    experiences = Array.isArray(d.experiences) ? JSON.parse(JSON.stringify(d.experiences)) : [];
    renderExp();
    const v = d.venue || {};
    $('f_venue_name').value = v.name || '';
    $('f_venue_desc').value = v.desc || '';
    venueImgs = Array.isArray(v.images) ? v.images.slice() : [];
    renderVenue();
    $('venueStatus').textContent = '';
    itinerary = Array.isArray(d.itinerary) ? JSON.parse(JSON.stringify(d.itinerary)) : [];
    renderItin();
    $('f_en').value = (row && row.en && Object.keys(row.en).length) ? JSON.stringify(row.en, null, 2) : '';
    // membership-only fields
    $('f_mem_price').value = d.price || '';
    $('f_mem_credits').value = d.credits || '';
    $('f_mem_bonus').value = d.bonus || '';
    $('f_mem_style').value = ['platinum', 'gold', 'silver'].includes(d.style) ? d.style : 'platinum';
    $('f_mem_features').value = Array.isArray(d.features) ? d.features.join('\n') : '';
    // homepage topic fields
    $('f_topic_group').value = d.group === 'wk' ? 'wk' : 'tour';
    $('f_topic_key').value = d.key || '';
    topicImgs = Array.isArray(d.images) ? d.images.slice() : [];
    renderTopic();
    $('topicStatus').textContent = '';
    applyTypeMode();
    updatePreview();
    showEditor();
    window.scrollTo(0, 0);
  }

  function toHex(v, fallback) {
    return (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)) ? v : fallback;
  }

  $('editorForm').addEventListener('submit', async e => {
    e.preventDefault();
    clearMsg('editorMsg');
    const id = $('f_id').value.trim();
    if (!id) { showMsg('editorMsg', 'err', 'Slug / ID is required.'); return; }
    const type = $('f_type').value;

    // ---- Homepage topic images: heading + up to 3 photos ----
    if (type === 'topic') {
      const gkey = $('f_topic_group').value;
      const tkey = $('f_topic_key').value.trim();
      if (!tkey) { showMsg('editorMsg', 'err', 'Topic key is required (e.g. local-route).'); return; }
      const data = { id, type, group: gkey, key: tkey, name: $('f_name').value.trim(), images: topicImgs.slice(0, 3) };
      const rec = { id, type, status: $('f_status').value, sort: parseInt($('f_sort').value, 10) || 0, name: data.name || tkey, data, en: {} };
      const tbtn = $('saveBtn'); tbtn.disabled = true; tbtn.textContent = 'Saving…';
      const { error } = await sb.from('packages').upsert(rec, { onConflict: 'id' });
      tbtn.disabled = false; tbtn.textContent = 'Save';
      if (error) { showMsg('editorMsg', 'err', error.message); return; }
      showList(); return;
    }

    // ---- Membership tier: its own small shape ----
    if (type === 'membership') {
      const data = {
        id, type,
        name: $('f_name').value.trim(),
        price: $('f_mem_price').value.trim(),
        credits: $('f_mem_credits').value.trim(),
        bonus: $('f_mem_bonus').value.trim(),
        style: $('f_mem_style').value,
        features: linesToArr($('f_mem_features').value)
      };
      const rec = { id, type, status: $('f_status').value, sort: parseInt($('f_sort').value, 10) || 0, name: data.name || id, data, en: {} };
      const mbtn = $('saveBtn'); mbtn.disabled = true; mbtn.textContent = 'Saving…';
      const { error } = await sb.from('packages').upsert(rec, { onConflict: 'id' });
      mbtn.disabled = false; mbtn.textContent = 'Save';
      if (error) { showMsg('editorMsg', 'err', error.message); return; }
      showList(); return;
    }

    let en;
    try { en = parseJSONField($('f_en').value, {}, 'English overrides'); }
    catch (err) { showMsg('editorMsg', 'err', err.message); return; }

    // Built from the form editors — drop rows the user left completely blank.
    const expOut = experiences.filter(x => (x.title || x.desc || x.img || x.th));
    const venueName = $('f_venue_name').value.trim();
    const venueDesc = $('f_venue_desc').value.trim();
    const venue = (venueName || venueDesc || venueImgs.length)
      ? { name: venueName, desc: venueDesc, images: venueImgs.slice() }
      : undefined;
    const itinOut = itinerary
      .map(d => ({ title: (d.title || '').trim(), items: (d.items || []).filter(it => it.time || it.text) }))
      .filter(d => d.title || d.items.length)
      .map((d, i) => ({ day: `Day ${i + 1}`, title: d.title, items: d.items }));
    const itineraryOut = itinOut.length ? itinOut : undefined;

    const data = {
      id, type,
      name: $('f_name').value.trim(),
      category: $('f_category').value.trim() || undefined,
      province: $('f_province').value.trim() || undefined,
      kicker: $('f_kicker').value.trim() || undefined,
      tagline: splitComma($('f_tagline').value),
      location: $('f_location').value.trim(),
      duration: $('f_duration').value.trim(),
      group: $('f_group').value.trim(),
      priceNow: $('f_priceNow').value.trim(),
      priceOld: $('f_priceOld').value.trim(),
      priceUnit: $('f_priceUnit').value.trim(),
      priceNote: $('f_priceNote').value.trim() || undefined,
      theme: { primary: $('f_theme_primary').value, accent: $('f_theme_accent').value, tint: $('f_theme_tint').value },
      hero: $('f_hero').value.trim(),
      intro: $('f_intro').value.trim(),
      experiences: expOut,
      includes: linesToArr($('f_includes').value),
    };
    if (venue !== undefined) data.venue = venue;
    if (itineraryOut !== undefined) data.itinerary = itineraryOut;
    if (galleryImgs.length) data.gallery = galleryImgs.slice();

    const rec = { id, type, status: $('f_status').value, sort: parseInt($('f_sort').value, 10) || 0, name: data.name || id, data, en };
    const btn = $('saveBtn'); btn.disabled = true; btn.textContent = 'Saving…';
    const { error } = await sb.from('packages').upsert(rec, { onConflict: 'id' });
    btn.disabled = false; btn.textContent = 'Save';
    if (error) { showMsg('editorMsg', 'err', error.message); return; }
    showList();
  });
})();
