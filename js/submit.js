// ============================================================
// B-Healthy — form submission helper
// Emails the sales team via the serverless endpoint /api/lead (Resend).
// Also inserts into Supabase table `submissions` if BH_CONFIG is filled.
// Both sinks are optional: on a plain static host (no function, no config)
// this resolves ok so the site still works as a front-end demo.
// ============================================================
window.bhSubmit = async function (type, data) {
  const results = await Promise.allSettled([
    sendEmail(type, data),
    saveToSupabase(type, data),
  ]);
  const emailed = results[0].status === "fulfilled" && results[0].value?.ok;
  return { ok: true, emailed: !!emailed };
};

// --- Email the team via the Vercel serverless function -------------------
async function sendEmail(type, data) {
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: type, data: data }),
    });
    // 404 → running as a plain static site (no function). Treat as demo no-op.
    if (res.status === 404) return { ok: true, skipped: true };
    return { ok: res.ok, status: res.status };
  } catch (e) {
    // Network error (e.g. local preview) — don't block the thank-you message.
    return { ok: false, error: String(e) };
  }
}

// --- Optional: also store the raw submission in Supabase -----------------
async function saveToSupabase(type, data) {
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
    payload: data,
  };

  try {
    const res = await fetch(cfg.SUPABASE_URL.replace(/\/+$/, "") + "/rest/v1/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": cfg.SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + cfg.SUPABASE_ANON_KEY,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(row),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
