// ============================================================
// B-Healthy — form submission helper
// Sends a row to Supabase table `submissions`. If config is empty,
// resolves as a no-op so the site still works as a front-end demo.
// ============================================================
window.bhSubmit = async function (type, data) {
  const cfg = window.BH_CONFIG || {};
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
    return { ok: true, skipped: true };
  }

  const row = {
    type: type,
    name: data.contact || data.name || null,
    company: data.company || null,
    phone: data.phone || null,
    email: data.email || null,
    subject: data.subject || null,
    package: data.package || null,
    pax: data.pax ? Number(data.pax) : null,
    pref_date: data.date || null,
    message: data.message || null,
    payload: data
  };

  try {
    const res = await fetch(cfg.SUPABASE_URL.replace(/\/+$/, "") + "/rest/v1/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": cfg.SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + cfg.SUPABASE_ANON_KEY,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(row)
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
};
