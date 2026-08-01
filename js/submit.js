// ============================================================
// B-Healthy — form submission helper
// Emails the sales team via the serverless endpoint /api/lead (Resend).
// Also inserts into Supabase table `submissions` if BH_CONFIG is filled.
// Both sinks are optional: on a plain static host (no function, no config)
// this resolves ok so the site still works as a front-end demo.
// ============================================================
// Returns { ok } where ok means the lead reached AT LEAST ONE sink. It used to
// return ok:true unconditionally, so when both the email endpoint and Supabase
// failed the visitor still saw a thank-you and the enquiry was lost with nobody
// aware of it. A sink that is deliberately absent (no serverless function, no
// Supabase config) reports skipped and must not count as a delivery.
window.bhSubmit = async function (type, data) {
  const [mail, db] = await Promise.allSettled([
    sendEmail(type, data),
    saveToSupabase(type, data),
  ]);

  const landed = r => r.status === "fulfilled" && r.value?.ok && !r.value.skipped;
  const configured = r => !(r.status === "fulfilled" && r.value?.skipped);

  const emailed = landed(mail);
  const stored = landed(db);
  // Nothing is wired up at all (plain static preview) — keep the demo flow.
  const anyConfigured = configured(mail) || configured(db);

  return { ok: emailed || stored || !anyConfigured, emailed, stored };
};

// --- Shared result handling for every form on the site -------------------
// Keeps the success copy the page already ships (so it stays translated) and
// swaps in a retry message when nothing got through. The submit button is only
// left disabled on success — a failed send must always be retryable.
window.bhSubmitDone = function (res, form, done, btn, successLabel) {
  if (!done) return false;
  const ok = !!(res && res.ok);

  // i18n stores the element's original Thai in __th the first time it runs, and
  // that has already happened by the time anyone submits. Reading innerHTML here
  // would capture whatever language is on screen right now.
  if (done.__okTh === undefined) {
    done.__okTh = done.__th !== undefined ? done.__th : done.innerHTML;
    done.__okEn = done.getAttribute('data-en') || done.__okTh;
  }

  if (ok) {
    done.classList.remove('form__done--err');
    done.innerHTML = done.__okTh;
    done.setAttribute('data-en', done.__okEn);
  } else {
    done.classList.add('form__done--err');
    done.textContent = 'ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือติดต่อเราทาง LINE @bhealthyme';
    done.setAttribute('data-en', "Couldn't send — please try again, or reach us on LINE @bhealthyme");
    if (btn) btn.disabled = false;
  }

  delete done.__th;                          // force i18n to re-cache the new copy
  done.hidden = false;

  // The submit button carries its own data-en, so the label has to be set in
  // BOTH languages — otherwise the next applyLang() wipes whatever we put here.
  // Its original pair is captured once so a failed send can restore it intact.
  if (btn) {
    if (btn.__origTh === undefined) {
      btn.__origTh = btn.__th !== undefined ? btn.__th : btn.textContent;
      btn.__origEn = btn.getAttribute('data-en') || btn.__origTh;
    }
    const th = ok ? (successLabel || '✓') : btn.__origTh;
    const en = ok ? (successLabel || '✓') : btn.__origEn;
    btn.textContent = th;
    btn.setAttribute('data-en', en);
    delete btn.__th;
  }

  if (window.bhApplyLang) window.bhApplyLang();
  return ok;
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
