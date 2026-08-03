// api/send-email.ts
// Odesílání e-mailů přes Resend pro vapesport.cz (Vercel serverless funkce, složka /api).
//
// PROMĚNNÉ PROSTŘEDÍ (ve Vercelu):
//   RESEND_API_KEY        – klíč z Resendu
//   SUPABASE_URL          – https://<projekt>.supabase.co
//   SUPABASE_SERVICE_KEY  – tajný (secret) klíč ze Supabase
//
// Zabezpečení:
//   - "order": e-mail se odešle jen pokud objednávka s daným číslem existuje v DB;
//              posílá se na e-mail uložený u objednávky.
//   - "payment": smí spustit jen přihlášený uživatel (ověřuje se token ze Supabase).

const RESEND_API = "https://api.resend.com/emails";
const FROM = "Vapesport <info@vapesport.cz>";
const SHOP_EMAIL = "info@vapesport.cz";

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

// --- barvy vapesportu (Concrete Nature) ---
const MOSS = "#6E7B4E";
const CHARCOAL = "#2E2E2B";
const CONCRETE = "#EFECE6";

const czk = (n: number) =>
  new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(Math.round(n)) + " Kč";

// --- ověření přihlášeného uživatele přes Supabase ---
async function verifyUser(token: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !token) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

// --- najít objednávku v DB podle čísla ---
async function findOrder(orderNumber: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/orders?order_number=eq.${encodeURIComponent(
      orderNumber
    )}&select=email,user_id&limit=1`;
    const r = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });
    if (!r.ok) return null;
    const rows = await r.json();
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  } catch {
    return null;
  }
}

/** Poslední záchrana: e-mail přihlašovacího účtu, na který je objednávka vázaná. */
async function findUserEmail(userId: string): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !userId) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });
    if (!r.ok) return null;
    const u = await r.json();
    return u?.email || null;
  } catch {
    return null;
  }
}

// --- odeslání přes Resend ---
async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: Array<{ filename: string; content: string; content_id?: string }>;
}) {
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
      ...(opts.attachments && opts.attachments.length ? { attachments: opts.attachments } : {}),
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error("Resend chyba: " + t);
  }
  return res.json();
}

// --- základní vzhled e-mailu (Concrete Nature) ---
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

// B2B: potvrzení registrace (žádost přijata, čeká na schválení)
function b2bPendingEmail(u: any) {
  const jmeno = u.contactName || u.company || "";
  const body = `
    <p style="font-size:16px;margin:0 0 14px;">Dobrý den${jmeno ? " " + escapeHtml(jmeno) : ""},</p>
    <p style="margin:0 0 18px;line-height:1.6;">děkujeme za registraci do velkoobchodu Vapesport${u.company ? ` (<strong>${escapeHtml(u.company)}</strong>)` : ""}. Vaši žádost jsme přijali a nyní ji zkontrolujeme.</p>
    <div style="background:${CONCRETE};border-radius:6px;padding:14px 18px;margin-bottom:18px;font-size:14px;line-height:1.7;">
      Jakmile žádost schválíme, dáme vám vědět e-mailem a budete se moci přihlásit s velkoobchodními cenami.
    </div>
    <p style="margin:0;line-height:1.6;">Kdyby cokoli, stačí odpovědět na tento e-mail. Děkujeme za zájem!</p>
  `;
  return layout("Registrace přijata", body);
}

// B2B: schválení účtu
function b2bApprovedEmail(u: any) {
  const jmeno = u.contactName || u.company || "";
  const body = `
    <p style="font-size:16px;margin:0 0 14px;">Dobrý den${jmeno ? " " + escapeHtml(jmeno) : ""},</p>
    <p style="margin:0 0 18px;line-height:1.6;">máme pro vás dobrou zprávu — váš velkoobchodní účet Vapesport${u.company ? ` (<strong>${escapeHtml(u.company)}</strong>)` : ""} byl <strong>schválen</strong>. Nyní se můžete přihlásit a nakupovat s velkoobchodními cenami.</p>
    <a href="https://www.vapesport.cz/b2b-login" style="display:inline-block;background:${MOSS};color:#fff;text-decoration:none;padding:12px 22px;border-radius:4px;font-weight:700;">Přihlásit se do B2B →</a>
    <p style="margin:18px 0 0;line-height:1.6;">Přihlašujete se e-mailem a heslem, které jste zadali při registraci. Kdyby cokoli, stačí odpovědět na tento e-mail.</p>
  `;
  return layout("Váš B2B účet byl schválen", body);
}

/** Texty pro jednotlivé stavy objednávky. */
const STATUS_TEXT: Record<string, { title: string; subject: string; body: string }> = {
  zpracovava_se: {
    title: "Objednávka byla přijata",
    subject: "Objednávka byla přijata",
    body: "vaši objednávku jsme přijali a začínáme ji zpracovávat. Až ji odešleme, dáme vám vědět.",
  },
  odeslano: {
    title: "Objednávka odeslána",
    subject: "Objednávka byla odeslána",
    body: "vaše objednávka byla odeslána a je na cestě k vám.",
  },
};

// Poznámka: pro stavy „Doručena" a „Zrušena" se e-mail záměrně neposílá.
// Kdyby je bylo potřeba doplnit, přidej je do STATUS_TEXT výše.

function statusEmail(o: any, statusKey: string) {
  const t = STATUS_TEXT[statusKey];
  const jmeno = o.customerName ? " " + escapeHtml(String(o.customerName)) : "";
  const tracking =
    o.trackingUrl || o.trackingNumber
      ? `<div style="margin:0 0 18px;padding:14px 16px;background:${CONCRETE};border-radius:6px;">
           <div style="font-size:12px;color:#8a8a80;text-transform:uppercase;letter-spacing:1px;">Sledování zásilky</div>
           ${o.trackingNumber ? `<div style="font-weight:700;margin-top:4px;">${escapeHtml(String(o.trackingNumber))}</div>` : ""}
           ${o.trackingUrl ? `<div style="margin-top:6px;"><a href="${escapeHtml(String(o.trackingUrl))}" style="color:${MOSS};">Zobrazit stav zásilky</a></div>` : ""}
         </div>`
      : "";

  return layout(
    t.title,
    `
    <p style="font-size:16px;margin:0 0 14px;">Dobrý den${jmeno},</p>
    <p style="margin:0 0 18px;line-height:1.6;">${t.body}</p>
    <div style="margin:0 0 18px;padding:14px 16px;background:${CONCRETE};border-radius:6px;">
      <div style="font-size:12px;color:#8a8a80;text-transform:uppercase;letter-spacing:1px;">Objednávka</div>
      <div style="font-size:18px;font-weight:700;">#${escapeHtml(String(o.orderNumber))}</div>
      ${o.total != null ? `<div style="margin-top:4px;color:#8a8a80;">Celkem ${czk(Number(o.total))}</div>` : ""}
    </div>
    ${tracking}
    ${
      Array.isArray(o.items) && o.items.length
        ? `<table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px;margin:0 0 18px;">${orderRows(o.items)}</table>`
        : ""
    }
    <p style="margin:0;line-height:1.6;color:#8a8a80;font-size:14px;">
      Máte dotaz? Odpovězte na tento e-mail nebo zavolejte na +420 606 080 922.
    </p>`
  );
}

function paymentEmail(p: any) {
  const vs = p.vs || (String(p.orderNumber).replace(/\D/g, "") || String(p.orderNumber));
  const qrBlock = p.qrCid
    ? `<div style="text-align:center;margin:18px 0;">
         <img src="cid:${p.qrCid}" alt="QR platba" width="200" height="200" style="border:1px solid #e0dcd3;border-radius:8px;padding:8px;background:#fff;" />
         <div style="font-size:12px;color:#8a8a80;margin-top:6px;">Naskenujte v bankovní aplikaci</div>
       </div>`
    : "";
  const body = `
    <p style="font-size:16px;margin:0 0 14px;">Dobrý den,</p>
    <p style="margin:0 0 18px;line-height:1.6;">zasíláme podklady k platbě objednávky <strong>#${escapeHtml(String(p.orderNumber))}</strong>.</p>
    <div style="background:${CONCRETE};border-radius:6px;padding:16px 18px;font-size:14px;line-height:1.9;">
      <div><span style="color:#8a8a80;">Banka:</span> <strong>${escapeHtml(p.bankName || "")}</strong></div>
      <div><span style="color:#8a8a80;">IBAN:</span> <strong>${escapeHtml(p.iban || "")}</strong></div>
      <div><span style="color:#8a8a80;">Částka:</span> <strong>${czk(p.amount || 0)}</strong></div>
      <div><span style="color:#8a8a80;">Variabilní symbol:</span> <strong>${escapeHtml(vs)}</strong></div>
    </div>
    ${qrBlock}
    <p style="margin:18px 0 0;line-height:1.6;">Zaplatit můžete naskenováním QR kódu v bankovní aplikaci, nebo klasickým převodem podle údajů výše. Po připsání platby objednávku připravíme a odešleme. Děkujeme!</p>
  `;
  return layout("Výzva k platbě", body);
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
      if (!o.orderNumber) return res.status(400).json({ error: "Chybí orderNumber." });

      // Adresát se hledá ve třech krocích. Chybějící e-mail v požadavku NESMÍ
      // zablokovat oznámení do obchodu — jinak o objednávce nikdo neví.
      let recipient: string | null = o.customerEmail || null;
      try {
        const dbOrder = await findOrder(o.orderNumber);
        if (dbOrder?.email) {
          recipient = dbOrder.email;
        } else if (!recipient && dbOrder?.user_id) {
          recipient = await findUserEmail(dbOrder.user_id);
        }
      } catch {
        /* ignorujeme – zkusíme poslat aspoň to, co máme */
      }

      // 1) Potvrzení zákazníkovi (jen když máme kam)
      if (recipient) {
        await sendEmail({
          to: recipient,
          subject: `Potvrzení objednávky #${o.orderNumber} — Vapesport`,
          html: customerOrderEmail({ ...o, customerEmail: recipient }),
          replyTo: SHOP_EMAIL,
        });
      }

      // 2) Oznámení do obchodu — odejde VŽDY
      await sendEmail({
        to: SHOP_EMAIL,
        subject: recipient
          ? `Nová objednávka${o.isB2B ? " (B2B)" : ""} #${o.orderNumber}`
          : `⚠️ Objednávka BEZ E-MAILU${o.isB2B ? " (B2B)" : ""} #${o.orderNumber}`,
        html:
          shopOrderEmail({ ...o, customerEmail: recipient || "" }) +
          (recipient
            ? ""
            : `<p style="margin-top:16px;padding:12px;background:#fdeaea;border:1px solid #e5b4b4;font-family:Arial,Helvetica,sans-serif;font-size:14px;">
                 <strong>Pozor:</strong> objednávka nemá e-mail zákazníka, potvrzení se nepodařilo odeslat.
                 Kontaktujte prosím zákazníka telefonicky${o.phone ? ` na ${escapeHtml(String(o.phone))}` : ""}.
               </p>`),
        ...(recipient ? { replyTo: recipient } : {}),
      });

      return res.status(200).json({ ok: true, sentToCustomer: Boolean(recipient) });
    }

    if (type === "status") {
      // ZABEZPEČENÍ: jen administrátor
      const token = body.token || (req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
      const user = await verifyUser(token);
      if (!user?.id) return res.status(401).json({ error: "Nepřihlášený uživatel." });
      const rr = await fetch(`${SUPABASE_URL}/rest/v1/rpc/has_role`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _user_id: user.id, _role: "admin" }),
      });
      if (!rr.ok || !(await rr.json())) {
        return res.status(401).json({ error: "Přístup jen pro administrátora." });
      }

      const o = body.order || {};
      const statusKey = String(body.status || "").trim();
      if (!o.orderNumber) return res.status(400).json({ error: "Chybí orderNumber." });
      if (!STATUS_TEXT[statusKey]) {
        return res.status(400).json({ error: `Pro stav „${statusKey}" se e-mail neposílá.` });
      }

      // Adresát: z požadavku → z objednávky v DB → z přihlašovacího účtu.
      let recipient: string | null = o.customerEmail || null;
      try {
        const dbOrder = await findOrder(o.orderNumber);
        if (dbOrder?.email) recipient = dbOrder.email;
        else if (!recipient && dbOrder?.user_id) recipient = await findUserEmail(dbOrder.user_id);
      } catch {
        /* zkusíme poslat na to, co máme */
      }
      if (!recipient) {
        return res.status(400).json({ error: "Objednávka nemá e-mail zákazníka — nelze odeslat." });
      }

      await sendEmail({
        to: recipient,
        subject: `${STATUS_TEXT[statusKey].subject} #${o.orderNumber} — Vapesport`,
        html: statusEmail(o, statusKey),
        replyTo: SHOP_EMAIL,
      });

      return res.status(200).json({ ok: true, sentTo: recipient });
    }

    if (type === "payment") {
      // ZABEZPEČENÍ: smí jen přihlášený uživatel
      const token = body.token || (req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
      const user = await verifyUser(token);
      if (!user || !user.id) return res.status(401).json({ error: "Nepřihlášený uživatel." });

      const p = body.payment || {};
      if (!p.customerEmail || !p.orderNumber) {
        return res.status(400).json({ error: "Chybí customerEmail nebo orderNumber." });
      }
      const attachments: Array<{ filename: string; content: string; content_id?: string }> = [];
      let qrCid: string | undefined;
      if (p.qrBase64) {
        qrCid = "qr-platba";
        attachments.push({
          filename: `QR-platba-${p.orderNumber}.png`,
          content: String(p.qrBase64).replace(/^data:image\/\w+;base64,/, ""),
          content_id: qrCid,
        });
      }
      await sendEmail({
        to: p.customerEmail,
        subject: `Výzva k platbě — objednávka #${p.orderNumber}`,
        html: paymentEmail({ ...p, qrCid }),
        replyTo: SHOP_EMAIL,
        attachments,
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

    if (type === "b2b_pending") {
      // Potvrzení registrace. Volá jen naše registrační funkce (register-b2b),
      // takže e-mail posíláme rovnou bez další kontroly v DB.
      const u = body.user || {};
      const email = String(u.email || "").trim();
      if (!email) return res.status(400).json({ error: "Chybí email." });
      await sendEmail({
        to: email,
        subject: "Registrace přijata – čeká na schválení | Vapesport B2B",
        html: b2bPendingEmail(u),
        replyTo: SHOP_EMAIL,
      });
      return res.status(200).json({ ok: true });
    }

    if (type === "b2b_approved") {
      // Schválení. Smí spustit jen přihlášený uživatel (admin).
      const token = body.token || (req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
      const user = await verifyUser(token);
      if (!user || !user.id) return res.status(401).json({ error: "Nepřihlášený uživatel." });
      const u = body.user || {};
      const email = String(u.email || "").trim();
      if (!email) return res.status(400).json({ error: "Chybí email." });
      await sendEmail({
        to: email,
        subject: "Váš B2B účet byl schválen | Vapesport",
        html: b2bApprovedEmail(u),
        replyTo: SHOP_EMAIL,
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Neznámý typ (order / payment / registration / b2b_pending / b2b_approved)." });
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
