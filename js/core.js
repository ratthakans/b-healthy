// ============================================================
// B-Healthy — shared primitives used by every renderer
//
// Load this BEFORE any script that renders content. It carries the three
// things that were previously copy-pasted around the codebase:
//
//   bhEsc / bhEscAttr  HTML escaping (was duplicated in 7 files)
//   bhBlogDate         ISO date -> Thai/English label
//   bhFetchRows        one Supabase read for `packages` (was 3 near-copies)
// ============================================================
(function () {

  // --- Escaping ---------------------------------------------------------
  // All CMS content is admin-authored and therefore untrusted.
  const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => MAP[c]);

  // data-en values must be escaped TWICE. The browser decodes entities when it
  // parses the attribute, and i18n.js then assigns the result with innerHTML —
  // so one pass would hand live markup straight back to the parser.
  const escAttr = s => esc(esc(s));

  window.bhEsc = esc;
  window.bhEscAttr = escAttr;

  // --- Dates ------------------------------------------------------------
  // 2026-07-18 -> { th: "18 ก.ค. 2026", en: "18 Jul 2026" }. Returned as a pair
  // so the language toggle can swap the label without re-rendering anything.
  const TH_MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const EN_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  window.bhBlogDate = iso => {
    const [y, m, d] = String(iso).split('-').map(Number);
    if (!y || !m || !d) return { th: String(iso), en: String(iso) };
    return { th: `${d} ${TH_MONTH[m - 1]} ${y}`, en: `${d} ${EN_MONTH[m - 1]} ${y}` };
  };

  // --- Supabase read ----------------------------------------------------
  // Resolves to an array of rows, or null when Supabase is unconfigured,
  // unreachable or empty. Callers keep their bundled fallback on null, so the
  // site never renders blank because of a database problem.
  //
  // `type` is always sent to the server: articles, topic photos and packages
  // share one table, and filtering client-side means every page downloads the
  // rows it will throw away.
  window.bhFetchRows = function (opts) {
    const cfg = window.BH_CONFIG || {};
    const base = (cfg.SUPABASE_URL || '').replace(/\/$/, '');
    const key = cfg.SUPABASE_ANON_KEY || '';
    if (!base || !key) return Promise.resolve(null);   // demo / fallback mode

    const q = [
      'status=eq.published',
      'type=' + opts.type,
      'select=' + (opts.select || 'id,type,sort,data'),
    ];
    if (opts.order) q.push('order=' + opts.order);

    return fetch(base + '/rest/v1/packages?' + q.join('&'), {
      headers: { apikey: key, Authorization: 'Bearer ' + key }
    })
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(rows => (Array.isArray(rows) && rows.length ? rows : null))
      .catch(() => null);
  };
})();
