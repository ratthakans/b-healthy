// ============================================================
// B-Healthy — lead email endpoint (Vercel Serverless Function)
//
// Receives a form submission from the site and emails the sales team
// via Resend (https://resend.com). No npm dependency: it calls Resend's
// REST API directly with the built-in fetch (Node 18+ on Vercel).
//
// Required env var (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY   — your Resend API key (starts with "re_")
//
// Optional env vars (sensible defaults below, override anytime):
//   LEAD_TO      default: b-healthy@pzentsmart.com
//   LEAD_CC      default: kalyarak@pzentsmart.com, marketing@pzentsmart.com
//   LEAD_FROM    default: B-Healthy <no-reply@pzentsmart.com>
//                (the domain here MUST be verified in Resend)
// ============================================================

const TO = process.env.LEAD_TO || "b-healthy@pzentsmart.com";
const CC = (process.env.LEAD_CC || "kalyarak@pzentsmart.com, marketing@pzentsmart.com")
  .split(",").map(s => s.trim()).filter(Boolean);
const FROM = process.env.LEAD_FROM || "B-Healthy <no-reply@pzentsmart.com>";

const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const LABELS = {
  package: "แพ็กเกจ / Package",
  subject: "เรื่อง / Subject",
  contact: "ชื่อผู้ติดต่อ / Contact",
  name: "ชื่อ / Name",
  company: "บริษัท / Organization",
  phone: "เบอร์โทร / Phone",
  email: "อีเมล / Email",
  pax: "จำนวนผู้เข้าร่วม / Participants",
  date: "วันที่สนใจ / Preferred date",
  message: "รายละเอียด / Message",
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return res.status(500).json({ ok: false, error: "Email service not configured" });
  }

  // Body is JSON (Vercel parses it) but be defensive if it arrives as a string.
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const type = body.type === "contact" ? "contact" : "booking";
  const data = body.data && typeof body.data === "object" ? body.data : body;

  const customerEmail = data.email || null;
  const packageName = data.package || null;
  const who = data.contact || data.name || "ผู้ติดต่อ";

  const subject = type === "booking"
    ? `🌿 คำขอจองแพ็กเกจ${packageName ? ` — ${packageName}` : ""} — ${who}`
    : `🌿 ข้อความติดต่อจากเว็บไซต์${data.subject ? ` — ${data.subject}` : ""} — ${who}`;

  // Build a readable table from whatever fields were sent (skip empties + internal keys).
  const skip = new Set(["consent", "type"]);
  const rows = Object.keys(data)
    .filter(k => !skip.has(k) && data[k] !== "" && data[k] != null)
    .map(k => {
      const label = LABELS[k] || k;
      return `<tr>
        <td style="padding:8px 14px;background:#f5f7f4;font-weight:600;white-space:nowrap;vertical-align:top">${esc(label)}</td>
        <td style="padding:8px 14px">${esc(data[k]).replace(/\n/g, "<br>")}</td>
      </tr>`;
    }).join("");

  const heading = type === "booking"
    ? "มีลูกค้าสนใจแพ็กเกจใหม่ 🎉"
    : "มีข้อความติดต่อใหม่จากเว็บไซต์ ✉️";

  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;color:#1f2a24">
    <h2 style="color:#2f6b4f;margin:0 0 4px">${esc(heading)}</h2>
    <p style="margin:0 0 18px;color:#5a6b62">B-Healthy — เว็บไซต์ส่งข้อมูลผู้สนใจเข้ามาให้ทีมขาย</p>
    <table style="border-collapse:collapse;width:100%;border:1px solid #e2e8e2;border-radius:8px;overflow:hidden">
      ${rows || '<tr><td style="padding:12px">(ไม่มีข้อมูลรายละเอียด)</td></tr>'}
    </table>
    ${customerEmail ? `<p style="margin:18px 0 0;color:#5a6b62">ตอบกลับอีเมลนี้เพื่อติดต่อลูกค้าได้โดยตรง (Reply-To: ${esc(customerEmail)})</p>` : ""}
  </div>`;

  const text = Object.keys(data)
    .filter(k => !skip.has(k) && data[k] !== "" && data[k] != null)
    .map(k => `${LABELS[k] || k}: ${data[k]}`).join("\n");

  const payload = {
    from: FROM,
    to: [TO],
    cc: CC,
    subject,
    html,
    text: `${heading}\n\n${text}`,
  };
  if (customerEmail) payload.reply_to = customerEmail;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      console.error("Resend error", r.status, detail);
      return res.status(502).json({ ok: false, error: "Email send failed" });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Lead email exception", e);
    return res.status(500).json({ ok: false, error: "Email send failed" });
  }
};
