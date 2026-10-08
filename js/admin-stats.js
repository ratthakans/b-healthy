// ============================================================
// B-Healthy — Analytics tab (admin.html)
//
// Reads the aggregate functions created by supabase-analytics.sql. It never
// selects from `page_views` directly: the log grows by one row per view, and
// counting in the browser would mean downloading all of it (and PostgREST would
// cap the download at 1000 rows anyway, so the totals would quietly go wrong).
//
// Kept out of admin.js on purpose — that file is the content CRUD and is long
// enough already.
// ============================================================
(function () {
  const $ = id => document.getElementById(id);
  const esc = window.bhEsc;

  let sb = null;
  let days = 30;

  // admin.js owns the Supabase client and the session; this tab just borrows it.
  window.bhStatsInit = client => { sb = client; };

  // Paths are what the database stores. These are what a human calls them.
  const PAGE_NAMES = {
    '/': 'Home page',
    '/about': 'About',
    '/program': 'Wellness Retreats',
    '/workshops': 'Wellness Workshops',
    '/membership': 'Membership',
    '/blog': 'Blog (list)',
    '/contact': 'Contact'
  };

  function titleFor(kind, refId, path) {
    if (kind === 'post') {
      const p = (window.BLOG_POSTS || []).find(x => x.id === refId);
      return p ? (p.title || refId) : refId;
    }
    if (kind === 'package') {
      const p = (window.PACKAGES || {})[refId];
      return p ? (p.name || refId) : refId;
    }
    return PAGE_NAMES[path] || path;
  }

  const nf = n => Number(n || 0).toLocaleString('en-US');

  function trend(cur, prev) {
    cur = Number(cur || 0); prev = Number(prev || 0);
    if (!prev) return cur ? '<span class="kpi__up">new</span>' : '';
    const pct = Math.round(((cur - prev) / prev) * 100);
    if (pct === 0) return '<span class="kpi__flat">= same as before</span>';
    const cls = pct > 0 ? 'kpi__up' : 'kpi__down';
    return `<span class="${cls}">${pct > 0 ? '▲' : '▼'} ${Math.abs(pct)}%</span>` +
           `<span class="kpi__vs"> vs previous ${days} days</span>`;
  }

  // ---------- rendering ----------
  function kpis(t, daily) {
    const views = Number(t.views || 0), visitors = Number(t.visitors || 0);
    const per = visitors ? (views / visitors) : 0;
    const best = daily.reduce((a, b) => (Number(b.views) > Number(a.views) ? b : a), { views: 0, day: null });
    const bestLabel = best.day && Number(best.views)
      ? new Date(best.day + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      : '—';

    $('statKpis').innerHTML = `
      <div class="kpi">
        <div class="kpi__k">People</div>
        <div class="kpi__v">${nf(visitors)}</div>
        <div class="kpi__t">${trend(visitors, t.prev_visitors)}</div>
      </div>
      <div class="kpi">
        <div class="kpi__k">Page views</div>
        <div class="kpi__v">${nf(views)}</div>
        <div class="kpi__t">${trend(views, t.prev_views)}</div>
      </div>
      <div class="kpi">
        <div class="kpi__k">Pages per person</div>
        <div class="kpi__v">${per ? per.toFixed(1) : '—'}</div>
        <div class="kpi__t"><span class="kpi__vs">how deep they go</span></div>
      </div>
      <div class="kpi">
        <div class="kpi__k">Busiest day</div>
        <div class="kpi__v kpi__v--sm">${bestLabel}</div>
        <div class="kpi__t"><span class="kpi__vs">${best.day && Number(best.views) ? nf(best.views) + ' views' : 'no traffic yet'}</span></div>
      </div>`;
  }

  function chart(daily) {
    const max = Math.max(1, ...daily.map(d => Number(d.views)));
    // Thin the labels: 90 bars cannot each carry a date without turning to mush,
    // and a phone has room for about half as many as a laptop.
    const slots = window.innerWidth < 640 ? 5 : 10;
    const step = Math.max(1, Math.ceil(daily.length / slots));
    $('statChart').innerHTML = daily.map((d, i) => {
      const v = Number(d.views);
      const dt = new Date(d.day + 'T00:00:00');
      const lbl = dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      return `<div class="ch__col" title="${esc(lbl)} — ${nf(v)} views, ${nf(d.visitors)} people">
        <div class="ch__bar" style="height:${Math.round((v / max) * 100)}%"></div>
        <div class="ch__x">${i % step === 0 ? esc(dt.getDate()) : ''}</div>
      </div>`;
    }).join('');
  }

  function list(elId, rows, opts) {
    const o = opts || {};
    const el = $(elId);
    if (!rows.length) { el.innerHTML = `<div class="blist__none">${esc(o.empty || 'Nothing yet.')}</div>`; return; }
    const max = Math.max(1, ...rows.map(r => Number(r.views)));
    el.innerHTML = rows.map(r => {
      const name = o.name ? o.name(r) : r.label;
      const sub = Number(r.visitors) ? `<span class="blist__sub">${nf(r.visitors)} people</span>` : '';
      return `<div class="blist__row">
        <div class="blist__fill" style="width:${Math.round((Number(r.views) / max) * 100)}%"></div>
        <div class="blist__name">${esc(name)}</div>
        <div class="blist__n">${nf(r.views)}${sub}</div>
      </div>`;
    }).join('');
  }

  // Two numbers that only mean something next to each other: how many readers
  // hit the card, and how many of them actually typed an email. A gated article
  // with a lot of the first and little of the second is asking too much.
  function gate(gates, unlocks) {
    const el = $('statGate');
    const got = {};
    unlocks.forEach(u => { got[u.ref_id] = Number(u.visitors) || 0; });

    const rows = gates
      .map(g => {
        const saw = Number(g.visitors) || 0;
        const gave = got[g.ref_id] || 0;
        return { id: g.ref_id, saw: saw, gave: gave, rate: saw ? (gave / saw) * 100 : 0 };
      })
      .sort((a, b) => b.saw - a.saw);

    if (!rows.length) {
      el.innerHTML = '<div class="blist__none">No gated article has been opened yet. Tick ' +
        '\u201cต้องกรอกอีเมลก่อนอ่าน\u201d on an article in the Blog tab to start.</div>';
      return;
    }

    const tot = rows.reduce((a, r) => ({ saw: a.saw + r.saw, gave: a.gave + r.gave }), { saw: 0, gave: 0 });
    el.innerHTML = `
      <table class="gtab">
        <thead><tr><th>Article</th><th>Saw the card</th><th>Gave an email</th><th>Rate</th></tr></thead>
        <tbody>
          ${rows.map(r => `<tr>
            <td>${esc(titleFor('post', r.id, '/blog/' + r.id))}</td>
            <td>${nf(r.saw)}</td>
            <td>${nf(r.gave)}</td>
            <td class="rate ${r.rate >= 15 ? 'rate--hi' : (r.saw >= 20 ? 'rate--lo' : '')}">${r.saw ? r.rate.toFixed(0) + '%' : '—'}</td>
          </tr>`).join('')}
          <tr>
            <td><strong>All gated articles</strong></td>
            <td><strong>${nf(tot.saw)}</strong></td>
            <td><strong>${nf(tot.gave)}</strong></td>
            <td class="rate"><strong>${tot.saw ? ((tot.gave / tot.saw) * 100).toFixed(0) + '%' : '—'}</strong></td>
          </tr>
        </tbody>
      </table>`;
  }

  const pick = (rows, dim) => rows.filter(r => r.dim === dim)
    .sort((a, b) => Number(b.views) - Number(a.views)).slice(0, 8);

  const DEVICE_NAMES = { mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop', unknown: 'Unknown' };
  const LANG_NAMES = { th: 'ไทย', en: 'English', unknown: 'Unknown' };

  // ---------- load ----------
  async function load() {
    if (!sb) return;
    const msg = $('statMsg');
    msg.className = 'msg';
    $('statKpis').innerHTML = '<div class="empty" style="grid-column:1/-1">Loading…</div>';

    const [totals, daily, pages, posts, pkgs, brk, gates, unlocks] = await Promise.all([
      sb.rpc('bh_stats_totals', { p_days: days }),
      sb.rpc('bh_stats_daily', { p_days: days }),
      sb.rpc('bh_stats_top', { p_days: days, p_kinds: ['page'], p_limit: 12 }),
      sb.rpc('bh_stats_top', { p_days: days, p_kinds: ['post'], p_limit: 10 }),
      sb.rpc('bh_stats_top', { p_days: days, p_kinds: ['package'], p_limit: 10 }),
      sb.rpc('bh_stats_breakdown', { p_days: days }),
      // 200 is the ceiling bh_stats_top enforces. The footer below adds up the
      // rows it is given and calls the result the site-wide rate, so a limit
      // that quietly drops articles would quietly make that number wrong.
      sb.rpc('bh_stats_top', { p_days: days, p_kinds: ['gate'], p_limit: 200 }),
      sb.rpc('bh_stats_top', { p_days: days, p_kinds: ['unlock'], p_limit: 200 })
    ]);

    const failed = [totals, daily, pages, posts, pkgs, brk, gates, unlocks].find(r => r.error);
    if (failed) {
      $('statKpis').innerHTML = '';
      const m = failed.error.message || '';
      // PGRST202 / 42883: the functions were never created.
      const missing = /bh_stats|function|schema cache/i.test(m);
      msg.textContent = missing
        ? 'Analytics is not set up yet — run supabase-analytics.sql in Supabase (SQL Editor), then press Refresh.'
        : m;
      msg.className = 'msg msg--err show';
      $('statBody').classList.add('hide');   // six empty cards under an error help nobody
      return;
    }

    $('statBody').classList.remove('hide');

    const t = (totals.data && totals.data[0]) || {};
    const d = daily.data || [];
    const b = brk.data || [];

    kpis(t, d);
    chart(d);

    list('statPages', pages.data || [], {
      empty: 'No page views yet.',
      name: r => titleFor('page', r.ref_id, r.path)
    });
    list('statPosts', posts.data || [], {
      empty: 'No article has been opened yet.',
      name: r => titleFor('post', r.ref_id, r.path)
    });
    list('statPkgs', pkgs.data || [], {
      empty: 'No package page has been opened yet.',
      name: r => titleFor('package', r.ref_id, r.path)
    });
    list('statRef', pick(b, 'referrer'), {
      empty: 'No referrers yet.',
      name: r => (r.label === 'direct' ? 'Direct / typed in' : r.label)
    });
    gate(gates.data || [], unlocks.data || []);
    list('statDev', pick(b, 'device'), { empty: '—', name: r => DEVICE_NAMES[r.label] || r.label });
    list('statLang', pick(b, 'lang'), { empty: '—', name: r => LANG_NAMES[r.label] || r.label });

    if (!Number(t.views)) {
      msg.textContent = 'No views recorded in this period yet. The counter starts the moment supabase-analytics.sql has run and someone opens the live site — your own visits from localhost are deliberately not counted.';
      msg.className = 'msg show';
      msg.style.background = '#eef1f7';
      msg.style.color = '#6f7d90';
    }
  }

  window.bhStatsLoad = load;

  $('statRefresh').addEventListener('click', load);
  $('statRange').addEventListener('click', e => {
    const b = e.target.closest('.prog__filter'); if (!b) return;
    $('statRange').querySelectorAll('.prog__filter').forEach(x => x.classList.remove('is-active'));
    b.classList.add('is-active');
    days = Number(b.dataset.days) || 30;
    load();
  });
})();
