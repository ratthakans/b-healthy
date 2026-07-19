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
  const esc = s => String(s == null ? '' : s);

  // ---------- views ----------
  function showLogin() { loginView.classList.remove('hide'); appView.classList.add('hide'); }
  function showApp(email) {
    loginView.classList.add('hide'); appView.classList.remove('hide');
    $('whoami').textContent = email || '';
    showList();
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
      { type: 'membership', label: 'Membership tiers' }
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
    $('f_experiences').value = d.experiences ? JSON.stringify(d.experiences, null, 2) : '';
    $('f_venue').value = d.venue ? JSON.stringify(d.venue, null, 2) : '';
    $('f_itinerary').value = d.itinerary ? JSON.stringify(d.itinerary, null, 2) : '';
    $('f_en').value = (row && row.en && Object.keys(row.en).length) ? JSON.stringify(row.en, null, 2) : '';
    // membership-only fields
    $('f_mem_price').value = d.price || '';
    $('f_mem_credits').value = d.credits || '';
    $('f_mem_bonus').value = d.bonus || '';
    $('f_mem_style').value = ['platinum', 'gold', 'silver'].includes(d.style) ? d.style : 'platinum';
    $('f_mem_features').value = Array.isArray(d.features) ? d.features.join('\n') : '';
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

    let experiences, venue, itinerary, en;
    try {
      experiences = parseJSONField($('f_experiences').value, [], 'Experiences');
      venue = parseJSONField($('f_venue').value, undefined, 'Venue');
      itinerary = parseJSONField($('f_itinerary').value, undefined, 'Itinerary');
      en = parseJSONField($('f_en').value, {}, 'English overrides');
    } catch (err) { showMsg('editorMsg', 'err', err.message); return; }

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
      experiences: Array.isArray(experiences) ? experiences : [],
      includes: linesToArr($('f_includes').value),
    };
    if (venue !== undefined) data.venue = venue;
    if (itinerary !== undefined) data.itinerary = itinerary;
    if (galleryImgs.length) data.gallery = galleryImgs.slice();

    const rec = { id, type, status: $('f_status').value, sort: parseInt($('f_sort').value, 10) || 0, name: data.name || id, data, en };
    const btn = $('saveBtn'); btn.disabled = true; btn.textContent = 'Saving…';
    const { error } = await sb.from('packages').upsert(rec, { onConflict: 'id' });
    btn.disabled = false; btn.textContent = 'Save';
    if (error) { showMsg('editorMsg', 'err', error.message); return; }
    showList();
  });
})();
