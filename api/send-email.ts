// api/send-email.ts
// Odesílání e-mailů přes Resend pro vapesport.cz
// Nasazuje se jako Vercel serverless funkce (soubor patří do složky /api v repu).
// Volá se z webu po vytvoření objednávky nebo po registraci.
//
// POTŘEBUJE: nastavit proměnnou prostředí RESEND_API_KEY ve Vercelu.

const RESEND_API = "https://api.resend.com/emails";
const FROM = "Vapesport <info@vapesport.cz>";
const SHOP_EMAIL = "info@vapesport.cz";

// --- barvy vapesportu (Concrete Nature) ---
const MOSS = "#6E7B4E";
const CHARCOAL = "#2E2E2B";
const CONCRETE = "#EFECE6";

const czk = (n: number) =>
  new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(Math.round(n)) + " Kč";

// --- odeslání přes Resend ---
async function sendEmail(opts: { to: string; subject: string; html: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Chybí RESEND_API_KEY (nastav ve Vercelu).");
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error("Resend chyba: " + t);
  }
  return res.json();
}

// --- základní vzhled e-mailu (Concrete Nature, inline styly kvůli e-mailům) ---
function layout(title: string, bodyHtml: string) {
  return `<!DOCTYPE html><html lang="cs"><body style="margin:0;background:${CONCRETE};font-family:Arial,Helvetica,sans-serif;color:${CHARCOAL};">
  <div style="max-width:560px;margin:0 auto;padding:28px 20px;">
    <div style="background:${CHARCOAL};color:#fff;padding:22px 26px;border-radius:8px 8px 0 0;">
      <div style="font-size:12px;letter-spacing:2px;color:#a7b585;text-transform:uppercase;">Vapesport</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px;">${title}</div>
    </div>
    <div style="background:#fff;padding:26px;border:1px solid #e0dcd3;border-top:none;border-radius:0 0 8px 8px;">
      ${bodyHtml}
    </div>
    <div style="text-align:center;color:#8a8a80;font-size:12px;padding:18px 8px;line-height:1.6;">
      Vapesport Vlach s.r.o. · Ostrava · <a href="https://www.vapesport.cz" style="color:${MOSS};">vapesport.cz</a><br>
      info@vapesport.cz · +420 606 080 922
    </div>
  </div></body></html>`;
}

function orderRows(items: Array<{ name: string; qty: number; price: number }>) {
  return items
    .map(
      (it) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${it.name} <span style="color:#8a8a80;">× ${it.qty}</span></td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">${czk(it.price * it.qty)}</td>
      </tr>`
    )
    .join("");
}

// --- šablony ---
function customerOrderEmail(o: any) {
  const b2bInfo =
    o.isB2B && o.company
      ? `<div style="background:${CONCRETE};border-radius:6px;padding:12px 16px;margin-bottom:18px;font-size:13px;">
           <strong>Firma:</strong> ${escapeHtml(o.company)}${o.ico ? ` &middot; <strong>IČO:</strong> ${escapeHtml(o.ico)}` : ""}
         </div>`
      : "";
  const closing = o.isB2B
    ? "Objednávku jsme přijali. Fakturu se splatností 6 dní vám zašleme e-mailem. Kdyby cokoli, stačí odpovědět na tento e-mail."
    : "Objednávku jsme přijali a co nejdřív se do ní pustíme. O dalším průběhu vás budeme informovat. Kdyby cokoli, stačí odpovědět na tento e-mail.";
  const body = `
    <p style="font-size:16px;margin:0 0 14px;">Dobrý den${o.customerName ? " " + escapeHtml(o.customerName) : ""},</p>
    <p style="margin:0 0 18px;line-height:1.6;">děkujeme za vaši objednávku. Tady je její shrnutí:</p>
    <div style="background:${CONCRETE};border-radius:6px;padding:16px 18px;margin-bottom:18px;">
      <div style="font-size:13px;color:#8a8a80;text-transform:uppercase;letter-spacing:1px;">Objednávka</div>
      <div style="font-size:18px;font-weight:700;">#${escapeHtml(String(o.orderNumber))}</div>
    </div>
    ${b2bInfo}
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${orderRows(o.items || [])}
      <tr>
        <td style="padding:12px 0 0;font-weight:700;">Celkem${o.vat ? " s DPH" : ""}</td>
        <td style="padding:12px 0 0;text-align:right;font-weight:700;color:${MOSS};">${czk(o.total || 0)}</td>
      </tr>
    </table>
    <p style="margin:22px 0 0;line-height:1.6;">${closing}</p>
  `;
  return layout("Potvrzení objednávky", body);
}

function shopOrderEmail(o: any) {
  const body = `
    <p style="font-size:16px;margin:0 0 14px;font-weight:700;">Nová objednávka${o.isB2B ? " (B2B)" : ""} #${escapeHtml(String(o.orderNumber))}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:14px;">
      <tr><td style="padding:4px 0;color:#8a8a80;">Zákazník</td><td style="padding:4px 0;text-align:right;">${escapeHtml(o.customerName || "—")}</td></tr>
      <tr><td style="padding:4px 0;color:#8a8a80;">E-mail</td><td style="padding:4px 0;text-align:right;">${escapeHtml(o.customerEmail || "—")}</td></tr>
      ${o.phone ? `<tr><td style="padding:4px 0;color:#8a8a80;">Telefon</td><td style="padding:4px 0;text-align:right;">${escapeHtml(o.phone)}</td></tr>` : ""}
      ${o.company ? `<tr><td style="padding:4px 0;color:#8a8a80;">Firma</td><td style="padding:4px 0;text-align:right;">${escapeHtml(o.company)}</td></tr>` : ""}
      ${o.ico ? `<tr><td style="padding:4px 0;color:#8a8a80;">IČO</td><td style="padding:4px 0;text-align:right;">${escapeHtml(o.ico)}</td></tr>` : ""}
    </table>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${orderRows(o.items || [])}
      <tr><td style="padding:12px 0 0;font-weight:700;">Celkem</td><td style="padding:12px 0 0;text-align:right;font-weight:700;">${czk(o.total || 0)}</td></tr>
    </table>
  `;
  return layout("Nová objednávka", body);
}

function registrationEmail(u: any) {
  const body = `
    <p style="font-size:16px;margin:0 0 14px;">Vítejte${u.name ? " " + escapeHtml(u.name) : ""}!</p>
    <p style="margin:0 0 18px;line-height:1.6;">Váš účet u Vapesportu je hotový. Můžete si prohlédnout náš sortiment brašen a příslušenství pro e-bike a gravel — česká značka od roku 1994.</p>
    <a href="https://www.vapesport.cz/obchod" style="display:inline-block;background:${MOSS};color:#fff;text-decoration:none;padding:12px 22px;border-radius:4px;font-weight:700;">Prohlédnout obchod →</a>
  `;
  return layout("Vítejte ve Vapesportu", body);
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

// --- handler ---
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Použij POST" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { type } = body;

    if (type === "order") {
      const o = body.order || {};
      if (!o.customerEmail || !o.orderNumber) {
        return res.status(400).json({ error: "Chybí customerEmail nebo orderNumber." });
      }
      await sendEmail({
        to: o.customerEmail,
        subject: `Potvrzení objednávky #${o.orderNumber} — Vapesport`,
        html: customerOrderEmail(o),
        replyTo: SHOP_EMAIL,
      });
      await sendEmail({
        to: SHOP_EMAIL,
        subject: `Nová objednávka${o.isB2B ? " (B2B)" : ""} #${o.orderNumber}`,
        html: shopOrderEmail(o),
        replyTo: o.customerEmail,
      });
      return res.status(200).json({ ok: true });
    }

    if (type === "registration") {
      const u = body.user || {};
      if (!u.email) return res.status(400).json({ error: "Chybí email." });
      await sendEmail({
        to: u.email,
        subject: "Vítejte ve Vapesportu",
        html: registrationEmail(u),
        replyTo: SHOP_EMAIL,
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Neznámý typ (použij 'order' nebo 'registration')." });
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
