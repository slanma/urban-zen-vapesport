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

// --- barvy a písmo vapesportu (VAPESPORT-AI-SYSTEM v3.0, Concrete Nature) ---
const MOSS = "#48604B";
const CHARCOAL = "#1F1F1F";
const CONCRETE = "#E4E2DE"; // board
const PAPER = "#F4F3F0";
const MUTED = "#6F6E69";
const LINE = "#D6D3CC";
const HEAD = `'Space Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif`;
const BODY = `'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif`;
const MONO = `'Space Mono','SFMono-Regular',Menlo,Consolas,monospace`;

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
    )}&select=email,user_id,first_name,last_name,phone,street,city,zip,company_name,ico,note,shipping_label,shipping_gross,payment_label,payment_gross,packeta_point&limit=1`;
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
function layout(title: string, bodyHtml: string, preheader = "") {
  return `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${CONCRETE};">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CONCRETE};border-collapse:collapse;">
<tr><td align="center" style="padding:32px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;border-collapse:collapse;">
    <tr><td style="padding:0 4px 18px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr>
        <td style="font-family:${HEAD};font-size:20px;font-weight:700;letter-spacing:3px;color:${CHARCOAL};">VAPESPORT</td>
        <td align="right" style="font-family:${MONO};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${MOSS};">Česká značka od 1994</td>
      </tr></table>
    </td></tr>
    <tr><td style="background:#ffffff;border-top:4px solid ${MOSS};padding:34px 32px 30px;font-family:${BODY};font-size:15px;line-height:1.6;color:${CHARCOAL};">
      <div style="font-family:${HEAD};font-size:26px;font-weight:600;line-height:1.25;color:${CHARCOAL};margin:0 0 22px;">${escapeHtml(title)}</div>
      ${bodyHtml}
    </td></tr>
    <tr><td align="center" style="padding:22px 8px;font-family:${BODY};font-size:12px;line-height:1.7;color:${MUTED};">
      <a href="https://www.vapesport.cz" style="color:${MOSS};text-decoration:none;font-family:${MONO};letter-spacing:1px;">vapesport.cz</a>
      · info@vapesport.cz · +420 606 080 922<br>
      Vapesport Vlach s.r.o. · Paskovská 636/275, 720 00 Ostrava-Hrabová · IČ 05819369
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

/** Štítek nad sekcí. */
const label = (t: string) =>
  `<div style="font-family:${MONO};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MOSS};margin:26px 0 10px;">${t}</div>`;

/** Rámeček s číslem objednávky. */
const orderBadge = (orderNumber: string, extra = "") =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 6px;">
    <tr><td style="background:${PAPER};border-left:3px solid ${MOSS};padding:14px 18px;">
      <div style="font-family:${MONO};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};">Objednávka</div>
      <div style="font-family:${HEAD};font-size:20px;font-weight:700;color:${CHARCOAL};">#${escapeHtml(orderNumber)}</div>
      ${extra}
    </td></tr></table>`;

function orderRows(items: Array<{ name: string; qty: number; price: number }>) {
  const cell = `padding:12px 0;border-bottom:1px solid ${LINE};font-family:${BODY};font-size:14px;color:${CHARCOAL};vertical-align:top;`;
  return items
    .map(
      (it) => `<tr>
        <td style="${cell}">${escapeHtml(String(it.name))} <span style="color:${MUTED};">× ${it.qty}</span></td>
        <td style="${cell}text-align:right;white-space:nowrap;padding-left:16px;">${czk(it.price * it.qty)}</td>
      </tr>`
    )
    .join("");
}

function itemsTable(items: any[], total: number, vat: boolean, extraRows = "") {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-top:2px solid ${CHARCOAL};">
    ${orderRows(items || [])}
    ${extraRows}
    <tr>
      <td style="padding:16px 0 0;font-family:${HEAD};font-size:17px;font-weight:700;">Celkem${vat ? ` <span style="font-family:${BODY};font-size:13px;font-weight:400;color:${MUTED};">s DPH</span>` : ""}</td>
      <td style="padding:16px 0 0;text-align:right;white-space:nowrap;font-family:${HEAD};font-size:17px;font-weight:700;color:${MOSS};">${czk(total || 0)}</td>
    </tr>
  </table>`;
}

/** Doprava a platba z DB (pokud jsou k dispozici) jako řádky tabulky. */
function deliveryRows(d: any) {
  if (!d) return "";
  const cell = `padding:12px 0;border-bottom:1px solid ${LINE};font-family:${BODY};font-size:14px;color:${CHARCOAL};`;
  const row = (a: string, price: any) =>
    `<tr><td style="${cell}">${escapeHtml(a)}</td><td style="${cell}text-align:right;white-space:nowrap;">${
      Number(price) > 0 ? czk(Number(price)) : "zdarma"
    }</td></tr>`;
  return (d.shipping_label ? row(d.shipping_label, d.shipping_gross) : "") +
    (d.payment_label && Number(d.payment_gross) > 0 ? row(d.payment_label, d.payment_gross) : "");
}

function addressBlock(d: any) {
  if (!d) return "";
  const lines: string[] = [];
  if (d.packeta_point) lines.push(`<strong>Výdejní místo:</strong> ${escapeHtml(d.packeta_point)}`);
  else if (d.street || d.city)
    lines.push(`<strong>Doručovací adresa:</strong> ${escapeHtml([d.street, [d.zip, d.city].filter(Boolean).join(" ")].filter(Boolean).join(", "))}`);
  if (d.payment_label) lines.push(`<strong>Platba:</strong> ${escapeHtml(d.payment_label)}`);
  return lines.length ? `<p style="margin:18px 0 0;font-size:14px;line-height:1.7;">${lines.join("<br>")}</p>` : "";
}

const pStyle = `margin:0 0 14px;font-family:${BODY};font-size:15px;line-height:1.6;color:${CHARCOAL};`;
const small = `margin:16px 0 0;font-family:${BODY};font-size:13px;line-height:1.6;color:${MUTED};`;

function customerOrderEmail(o: any) {
  const d = o.db || null;
  const b2bInfo =
    o.isB2B && o.company
      ? `<div style="margin-top:6px;font-size:13px;color:${MUTED};">${escapeHtml(o.company)}${o.ico ? ` · IČO ${escapeHtml(o.ico)}` : ""}</div>`
      : "";
  const closing = o.isB2B
    ? "Objednávku jsme přijali. Fakturu se splatností 6 dní vám zašleme e-mailem. Kdyby cokoli, stačí odpovědět na tento e-mail."
    : "Objednávku jsme přijali a co nejdřív se do ní pustíme. O dalším průběhu vás budeme informovat. Kdyby cokoli, stačí odpovědět na tento e-mail.";
  const body = `
    <p style="${pStyle}">Dobrý den${(o.customerName || [o.db?.first_name, o.db?.last_name].filter(Boolean).join(" ")) ? ", " + escapeHtml(o.customerName || [o.db?.first_name, o.db?.last_name].filter(Boolean).join(" ")) : ""},</p>
    <p style="${pStyle}margin-bottom:22px;">děkujeme za vaši objednávku. Tady je její shrnutí:</p>
    ${orderBadge(String(o.orderNumber), b2bInfo)}
    ${label("Shrnutí")}
    ${itemsTable(o.items, o.total, o.vat, deliveryRows(d))}
    ${addressBlock(d)}
    <p style="${pStyle}margin-top:22px;">${closing}</p>
    <p style="${small}">${
      o.isB2B
        ? "Objednávka se řídí obchodními podmínkami Vapesport Vlach s.r.o. (ustanovení pro podnikatele), které najdete v patičce webu vapesport.cz."
        : `V příloze najdete obchodní podmínky a formulář pro odstoupení od smlouvy. Od smlouvy můžete odstoupit do 14 dnů od převzetí zboží bez udání důvodu, i online na <a href="https://www.vapesport.cz/odstoupeni" style="color:${MOSS};">vapesport.cz/odstoupeni</a>.`
    }</p>
  `;
  return layout("Potvrzení objednávky", body, `Objednávka #${o.orderNumber} je přijatá.`);
}

function shopOrderEmail(o: any) {
  const d = o.db || {};
  const name = o.customerName || [d.first_name, d.last_name].filter(Boolean).join(" ");
  const phone = o.phone || d.phone;
  const company = o.company || d.company_name;
  const ico = o.ico || d.ico;
  const cell = `padding:6px 0;font-family:${BODY};font-size:14px;`;
  const row = (k: string, v: string) =>
    v ? `<tr><td style="${cell}color:${MUTED};width:110px;">${k}</td><td style="${cell}">${v}</td></tr>` : "";
  const body = `
    ${orderBadge(String(o.orderNumber), o.isB2B ? `<div style="margin-top:6px;font-family:${MONO};font-size:11px;letter-spacing:2px;color:${MOSS};">B2B</div>` : "")}
    ${label("Zákazník")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${row("Jméno", escapeHtml(name || "—"))}
      ${row("E-mail", o.customerEmail ? `<a href="mailto:${escapeHtml(o.customerEmail)}" style="color:${MOSS};">${escapeHtml(o.customerEmail)}</a>` : "—")}
      ${row("Telefon", phone ? `<a href="tel:${escapeHtml(String(phone).replace(/\s/g, ""))}" style="color:${MOSS};">${escapeHtml(phone)}</a>` : "")}
      ${row("Firma", company ? escapeHtml(company) : "")}
      ${row("IČO", ico ? escapeHtml(ico) : "")}
    </table>
    ${label("Položky")}
    ${itemsTable(o.items, o.total, false, deliveryRows(o.db))}
    ${addressBlock(o.db)}
    ${d.note ? `<p style="margin:16px 0 0;padding:12px 16px;background:${PAPER};font-size:14px;"><strong>Poznámka zákazníka:</strong> ${escapeHtml(d.note)}</p>` : ""}
  `;
  return layout(`Nová objednávka${o.isB2B ? " (B2B)" : ""}`, body);
}

function registrationEmail(u: any) {
  const body = `
    <p style="${pStyle}">Vítejte${u.name ? " " + escapeHtml(u.name) : ""}!</p>
    <p style="${pStyle}">Váš účet u Vapesportu je hotový. Můžete si prohlédnout náš sortiment brašen a příslušenství pro e-bike a gravel — česká značka od roku 1994.</p>
    <a href="https://www.vapesport.cz/obchod" style="display:inline-block;background:${MOSS};color:#fff;text-decoration:none;padding:13px 24px;font-family:${HEAD};font-weight:600;letter-spacing:0.5px;">Prohlédnout obchod →</a>
  `;
  return layout("Vítejte ve Vapesportu", body);
}

// B2B: potvrzení registrace (žádost přijata, čeká na schválení)
function b2bPendingEmail(u: any) {
  const jmeno = u.contactName || u.company || "";
  const body = `
    <p style="${pStyle}">Dobrý den${jmeno ? ", " + escapeHtml(jmeno) : ""},</p>
    <p style="${pStyle}">děkujeme za registraci do velkoobchodu Vapesport${u.company ? ` (<strong>${escapeHtml(u.company)}</strong>)` : ""}. Vaši žádost jsme přijali a nyní ji zkontrolujeme.</p>
    <div style="background:${PAPER};border-left:3px solid ${MOSS};padding:14px 18px;margin-bottom:18px;font-size:14px;line-height:1.7;">
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
    <p style="${pStyle}">Dobrý den${jmeno ? ", " + escapeHtml(jmeno) : ""},</p>
    <p style="${pStyle}">máme pro vás dobrou zprávu — váš velkoobchodní účet Vapesport${u.company ? ` (<strong>${escapeHtml(u.company)}</strong>)` : ""} byl <strong>schválen</strong>. Nyní se můžete přihlásit a nakupovat s velkoobchodními cenami.</p>
    <a href="https://www.vapesport.cz/b2b-login" style="display:inline-block;background:${MOSS};color:#fff;text-decoration:none;padding:13px 24px;font-family:${HEAD};font-weight:600;letter-spacing:0.5px;">Přihlásit se do B2B →</a>
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
  const jmeno = o.customerName ? ", " + escapeHtml(String(o.customerName)) : "";
  const tracking =
    o.trackingUrl || o.trackingNumber
      ? `<div style="margin:0 0 18px;padding:14px 16px;background:${PAPER};border-left:3px solid ${MOSS};">
           <div style="font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:1px;">Sledování zásilky</div>
           ${o.trackingNumber ? `<div style="font-weight:700;margin-top:4px;">${escapeHtml(String(o.trackingNumber))}</div>` : ""}
           ${o.trackingUrl ? `<div style="margin-top:6px;"><a href="${escapeHtml(String(o.trackingUrl))}" style="color:${MOSS};">Zobrazit stav zásilky</a></div>` : ""}
         </div>`
      : "";

  return layout(
    t.title,
    `
    <p style="${pStyle}">Dobrý den${jmeno},</p>
    <p style="${pStyle}">${t.body}</p>
    <div style="margin:0 0 18px;padding:14px 16px;background:${PAPER};border-left:3px solid ${MOSS};">
      <div style="font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:1px;">Objednávka</div>
      <div style="font-size:18px;font-weight:700;">#${escapeHtml(String(o.orderNumber))}</div>
      ${o.total != null ? `<div style="margin-top:4px;color:${MUTED};">Celkem ${czk(Number(o.total))}</div>` : ""}
    </div>
    ${tracking}
    ${
      Array.isArray(o.items) && o.items.length
        ? `<table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px;margin:0 0 18px;">${orderRows(o.items)}</table>`
        : ""
    }
    <p style="margin:0;line-height:1.6;color:${MUTED};font-size:14px;">
      Máte dotaz? Odpovězte na tento e-mail nebo zavolejte na +420 606 080 922.
    </p>`
  );
}

function paymentEmail(p: any) {
  const vs = p.vs || (String(p.orderNumber).replace(/\D/g, "") || String(p.orderNumber));
  const qrBlock = p.qrCid
    ? `<div style="text-align:center;margin:18px 0;">
         <img src="cid:${p.qrCid}" alt="QR platba" width="200" height="200" style="border:1px solid #e0dcd3;border-radius:8px;padding:8px;background:#fff;" />
         <div style="font-size:12px;color:${MUTED};margin-top:6px;">Naskenujte v bankovní aplikaci</div>
       </div>`
    : "";
  const body = `
    <p style="${pStyle}">Dobrý den,</p>
    <p style="${pStyle}">zasíláme podklady k platbě objednávky <strong>#${escapeHtml(String(p.orderNumber))}</strong>.</p>
    <div style="background:${PAPER};border-left:3px solid ${MOSS};padding:16px 18px;font-size:14px;line-height:1.9;">
      <div><span style="color:${MUTED};">Banka:</span> <strong>${escapeHtml(p.bankName || "")}</strong></div>
      <div><span style="color:${MUTED};">IBAN:</span> <strong>${escapeHtml(p.iban || "")}</strong></div>
      <div><span style="color:${MUTED};">Částka:</span> <strong>${czk(p.amount || 0)}</strong></div>
      <div><span style="color:${MUTED};">Variabilní symbol:</span> <strong>${escapeHtml(vs)}</strong></div>
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


// ---------------------------------------------------------------------------
// Přílohy k potvrzení objednávky (jen B2C)
// ---------------------------------------------------------------------------
// Podle § 1824 občanského zákoníku musí spotřebitel po uzavření smlouvy dostat
// obchodní podmínky a poučení o odstoupení v textové podobě (trvalý nosič).
// Odkaz na web to nesplňuje, proto se posílají jako přílohy.
//
// POZOR: text obchodních podmínek je KOPIE stránky src/pages/Terms.tsx.
// Při každé změně podmínek uprav OBĚ místa a stejné datum UCINNOST_OD.

const UCINNOST_OD = "9. 8. 2026";

const TERMS_BODY = `<p> 
Obchodní podmínky společnosti Vapesport Vlach s.r.o. 
</p> 
<p>Účinné od ${UCINNOST_OD}</p> 
<div> 
<h2>I. Úvodní ustanovení</h2> 
<p> 
Tyto obchodní podmínky upravují práva a povinnosti mezi společností Vapesport Vlach s.r.o. (dále jen „prodávající") a zákazníky (dále jen „kupující") při prodeji zboží a poskytování služeb prostřednictvím webových stránek www.vapesport.cz, jakož i při přímém prodeji. 
</p> 
<p><strong>Prodávající:</strong></p> 
<p>Název společnosti: Vapesport Vlach s.r.o.</p> 
<p>Sídlo: Paskovská 636/275, Ostrava-Hrabová, 720 00</p> 
<p>IČ: 05819369, DIČ: CZ05819369 (plátce DPH)</p> 
<p>Zapsaná v obchodním rejstříku vedeném Krajským soudem v Ostravě, sp. zn. C 69479</p> 
<p>E-mail: info@vapesport.cz, Telefon: +420 606 080 922</p> 
<p>Datová schránka: 9becuy2</p> 
<p>Kupujícím může být spotřebitel (koncový zákazník v rámci B2C) nebo podnikatel (velkoobchodní partner nebo objednatel služeb, nakupující na IČO v rámci B2B). Pokud tyto podmínky nestanoví jinak, vztahují se na oba typy kupujících.</p> 
<p><strong>Spotřebitelem</strong> se rozumí každý člověk, který mimo rámec své podnikatelské činnosti nebo mimo rámec samostatného výkonu svého povolání uzavírá smlouvu s prodávajícím nebo s ním jinak jedná (§ 419 občanského zákoníku). Ustanovení označená jako B2C se vztahují výhradně na spotřebitele.</p> 
<p>Právní vztahy mezi prodávajícím a kupujícím se řídí právním řádem České republiky, zejména zákonem č. 89/2012 Sb., občanský zákoník, a je-li kupujícím spotřebitel, také zákonem č. 634/1992 Sb., o ochraně spotřebitele.</p> 
</div> 
<div> 
<h2>II. Informace před uzavřením smlouvy</h2> 
<p>V souladu s § 1811 a § 1820 občanského zákoníku prodávající sděluje, že:</p> 
<p>Náklady na prostředky komunikace na dálku se neliší od základní sazby a prodávající si za jejich použití neúčtuje žádné poplatky.</p> 
<p>Ceny zboží jsou uvedeny včetně DPH; náklady na dodání jsou uvedeny samostatně v objednávkovém procesu.</p> 
<p>Prodávající nepožaduje zálohu ani jinou obdobnou platbu, s výjimkou zboží nebo služeb připravovaných na zakázku, o čemž je kupující vždy předem informován.</p> 
<p>Prodávající není ve vztahu ke kupujícímu vázán žádnými kodexy chování ve smyslu § 1826 odst. 1 písm. e) občanského zákoníku.</p> 
<p>Smlouvu lze uzavřít v českém jazyce. Uzavřená smlouva je archivována v elektronické podobě, není přístupná třetím osobám a kupujícímu je zaslána v textové podobě na jeho e-mail.</p> 
<p>Kupující má právo od smlouvy odstoupit za podmínek uvedených v článku VI a v případě sporu právo na jeho mimosoudní řešení podle článku XI.</p> 
<p>Je-li u zboží uvedena sleva, prodávající vedle zlevněné ceny uvádí rovněž nejnižší cenu, za kterou zboží nabízel v době 30 dnů před poskytnutím slevy (§ 12a zákona o ochraně spotřebitele).</p> 
<p>Fotografie u zboží mají ilustrativní charakter; rozhodující je textový popis a technická specifikace.</p> 
</div> 
<div> 
<h2>III. Uzavření kupní smlouvy a objednávka služeb</h2> 
<p>Prezentace zboží na webových stránkách má informativní charakter; ustanovení § 1732 odst. 2 občanského zákoníku se nepoužije.</p> 
<p>Kupující odesílá objednávku kliknutím na tlačítko, které je jednoznačně označeno tak, aby z něj vyplývala povinnost k platbě (§ 1826 odst. 2 občanského zákoníku). Bezprostředně nad tímto tlačítkem je uvedena celková cena k úhradě. Před odesláním má kupující možnost všechny zadané údaje zkontrolovat a změnit. Odesláním objednávky kupující potvrzuje, že se seznámil s těmito obchodními podmínkami a souhlasí s nimi.</p> 
<p>Kupní smlouva (nebo smlouva o poskytnutí služby) je uzavřena okamžikem doručení potvrzení objednávky ze strany prodávajícího na e-mailovou adresu kupujícího. Automatické oznámení o přijetí objednávky do systému se za potvrzení nepovažuje, není-li v něm výslovně uvedeno jinak.</p> 
<p>Prodávající zašle kupujícímu bez zbytečného odkladu po uzavření smlouvy potvrzení o uzavřené smlouvě v textové podobě, včetně těchto obchodních podmínek a poučení o právu odstoupit od smlouvy (§ 1824a občanského zákoníku).</p> 
<p>Kupující je povinen uvést správné, pravdivé a úplné údaje při objednávce.</p> 
<p>Předmětem smlouvy může být nákup zboží (cyklistické brašny a doplňky) nebo objednávka služeb nabízených prodávajícím.</p> 
<p>Prodávající je oprávněn od smlouvy odstoupit, pokud zboží není dostupné a nelze jej nahradit, došlo ke zjevné chybě v uvedené ceně, nebo kupující neuhradil kupní cenu ve lhůtě splatnosti u platby předem. O odstoupení prodávající kupujícího neprodleně informuje a již uhrazenou částku vrátí do 14 dnů.</p> 
</div> 
<div> 
<h2>IV. Cena a platba</h2> 
<p>Ceny v českých korunách (CZK) pro koncové zákazníky (B2C):</p> 
<p>Ceny uvedené na webových stránkách jsou konečné, včetně DPH a všech zákonných poplatků. Cena nezahrnuje náklady na dopravu zboží ani případný příplatek za zvolený způsob platby; obojí je zobrazeno v košíku před dokončením objednávky.</p> 
<p>Ceny v eurech (EUR) pro B2B obchodníky:</p> 
<p>Prodávající poskytuje obchodním partnerům (B2B) ceník v eurech, který je stanoven na základě aktuálního kurzu české koruny vůči euru v době jeho vystavení.</p> 
<p>Pokud se kurz české koruny vůči euru změní o více než ±5 % oproti kurzu uvedenému v odeslaném ceníku, prodávající si vyhrazuje právo ceny v eurech v ceníku jednostranně upravit. Tato úprava se nevztahuje na již potvrzené objednávky.</p> 
<p>Výsledná cena bude pevně potvrzena při vystavení faktury, a to podle kurzu České národní banky (ČNB) platného v den vystavení faktury.</p> 
<p>Způsoby platby:</p> 
<p>Bankovním převodem na účet prodávajícího, a to i pomocí QR platby.</p> 
<p>Dobírkou při převzetí zboží — u zásilek doručovaných prostřednictvím Zásilkovny nebo PPL, s příplatkem uvedeným v košíku.</p> 
<p>Hotově při osobním odběru na prodejně.</p> 
<p>Platbou na fakturu se splatností — pouze pro schválené B2B partnery.</p> 
<p>Dostupné způsoby platby se mohou lišit podle zvoleného způsobu dopravy; aktuální kombinace jsou vždy zobrazeny v objednávkovém procesu.</p> 
<p>Daňový doklad vystaví prodávající v elektronické podobě a zašle jej na e-mail kupujícího, s čímž kupující souhlasí.</p> 
</div> 
<div> 
<h2>V. Dodání fyzického zboží a realizace služeb</h2> 
<p><strong>Fyzické zboží:</strong> Prodávající dodá zboží způsobem zvoleným kupujícím v objednávce — prostřednictvím výdejních míst Zásilkovny, doručením na adresu přepravcem, nebo osobním odběrem na prodejně. Náklady na dopravu jsou specifikovány v procesu objednávky. Prodávající dodá zboží bez zbytečného odkladu, nejpozději do 30 dnů od uzavření kupní smlouvy, nedohodnou-li se strany jinak. Při platbě předem začíná dodací lhůta běžet od připsání platby na účet prodávajícího.</p> 
<p><strong>Přechod nebezpečí škody:</strong> Je-li kupujícím spotřebitel, přechází na něj nebezpečí škody na zboží okamžikem převzetí zboží spotřebitelem nebo jím určenou třetí osobou odlišnou od dopravce. Určí-li dopravce spotřebitel, aniž mu byl prodávajícím nabídnut, přechází nebezpečí předáním zboží dopravci. Je-li kupujícím podnikatel, přechází nebezpečí škody předáním zboží prvnímu dopravci.</p> 
<p>Nepřevzetím řádně objednané zásilky kupní smlouva nezaniká. Nepřevezme-li kupující zásilku (např. při platbě na dobírku), vzniká prodávajícímu nárok na náhradu skutečně vynaložených nákladů spojených s dodáním (poštovné k zákazníkovi i zpět). Prodávající je oprávněn vyzvat kupujícího k jejich úhradě. Tímto není dotčeno právo spotřebitele odstoupit od smlouvy podle článku VI.</p> 
<p><strong>Jednorázové služby:</strong> V případě jednorázových služeb objednaných přes e-shop (např. tréninky, konzultace a obdobné služby) se konkrétní realizace, termín a podmínky plnění řeší s kupujícím následně (osobně, telefonicky nebo e-mailem), případně dle potvrzené specifikace v objednávce.</p> 
<p><strong>Služby poskytované opakovaně:</strong> U služeb s pravidelnou měsíční platbou (zejména správa a provoz webu, správa sociálních sítí, newsletter, grafické podklady, měsíční kontrola a aktualizace) se plnění poskytuje průběžně po dobu trvání smlouvy. Není-li ujednáno jinak, uzavírá se smlouva na dobu neurčitou s měsíčním zúčtovacím obdobím a výpovědní dobou jeden měsíc, která počíná běžet prvním dnem měsíce následujícího po doručení výpovědi. Kterákoli strana může smlouvu vypovědět i bez udání důvodu. Jednorázově uhrazené položky (např. pořízení webu, natočení materiálů, naplnění webu produkty) se při ukončení smlouvy nevracejí. Podmínky předání dat, obsahu a přístupů při ukončení spolupráce se řídí individuální dohodou.</p> 
</div> 
<div> 
<h2>VI. Odstoupení od smlouvy</h2> 
<p><strong>A. Prodej zboží koncovým spotřebitelům (B2C):</strong></p> 
<p>Kupující (spotřebitel) má právo odstoupit od smlouvy do 14 dnů bez udání důvodu (§ 1829 občanského zákoníku).</p> 
<p>Lhůta začíná běžet ode dne převzetí zboží. Je-li předmětem smlouvy několik kusů zboží objednaných v jedné objednávce a dodávaných samostatně, běží lhůta ode dne převzetí poslední dodávky; u zboží sestávajícího z několika položek nebo částí ode dne převzetí poslední položky nebo části. Lhůta je zachována, je-li odstoupení odesláno nejpozději poslední den lhůty.</p> 
<p>Nebyl-li spotřebitel o právu odstoupit od smlouvy poučen, může odstoupit do 1 roku a 14 dnů od počátku běhu lhůty. Byl-li poučen v průběhu této doby, běží 14denní lhůta ode dne poučení.</p> 
<p>Odstoupit lze jakýmkoli jednoznačným prohlášením vůči prodávajícímu, zejména prostřednictvím  
<a href="https://www.vapesport.cz/odstoupeni">formuláře pro odstoupení od smlouvy</a>  
na tomto webu, e-mailem na info@vapesport.cz nebo písemně na adresu sídla. Prodávající potvrdí spotřebiteli přijetí odstoupení bez zbytečného odkladu v textové podobě.</p> 
<p>Spotřebitel zašle nebo předá zboží prodávajícímu bez zbytečného odkladu, nejpozději do 14 dnů od odstoupení od smlouvy. Náklady spojené s vrácením zboží prodávajícímu hradí v plné výši kupující, a to i v případě, vrací-li se zboží, které nemůže být pro svou povahu vráceno obvyklou poštovní cestou.</p> 
<p>Prodávající vrátí přijaté peněžní prostředky (včetně nákladů na dodání ve výši nejlevnějšího prodávajícím nabízeného způsobu dodání) do 14 dnů od odstoupení, a to stejným způsobem, jakým je přijal, nedohodnou-li se strany jinak. Prodávající není povinen vrátit peníze dříve, než mu kupující zboží předá nebo prokáže jeho odeslání.</p> 
<p>Spotřebitel je oprávněn zboží vyzkoušet a seznámit se s jeho povahou, vlastnostmi a funkčností obdobně, jako by tak učinil v kamenné prodejně. Spotřebitel však odpovídá prodávajícímu za snížení hodnoty zboží, které vzniklo v důsledku nakládání s tímto zbožím jinak, než je k takovému seznámení nutné (§ 1833 občanského zákoníku) — zejména v důsledku užívání zboží v provozu, jeho znečištění, poškození nebo opotřebení. Nárok na náhradu snížení hodnoty je prodávající oprávněn jednostranně započíst proti nároku kupujícího na vrácení kupní ceny; vzniklou újmu je prodávající povinen prokázat.</p> 
<p><strong>Výjimky z práva na odstoupení (§ 1837 občanského zákoníku):</strong> Spotřebitel nemůže odstoupit od smlouvy zejména o dodávce zboží vyrobeného podle jeho požadavků nebo přizpůsobeného jeho osobním potřebám (např. brašna v individuálním provedení nebo s potiskem na zakázku), zboží v zapečetěném obalu, které z hygienických důvodů není vhodné vrátit poté, co jej spotřebitel porušil, a zboží, jehož cena závisí na výchylkách finančního trhu nezávisle na vůli prodávajícího.</p> 
<p>Byl-li spolu se zbožím poskytnut dárek, pozbývá darovací smlouva odstoupením od kupní smlouvy účinnosti a spotřebitel je povinen dárek vrátit spolu se zbožím.</p> 
<p><strong>B. Poskytování služeb koncovým spotřebitelům (B2C):</strong></p> 
<p>I u smlouvy o poskytnutí služby má spotřebitel právo odstoupit do 14 dnů od jejího uzavření.</p> 
<p>Požaduje-li spotřebitel, aby poskytování služby začalo již v průběhu této lhůty, musí o to prodávajícího výslovně požádat. Prodávající spotřebitele současně poučí, že splněním služby právo na odstoupení zaniká. Toto poučení je součástí objednávkového procesu a spotřebitel je při objednávce výslovně potvrzuje.</p> 
<p>Právo odstoupit od smlouvy zaniká okamžikem úplného poskytnutí služby, byly-li splněny obě uvedené podmínky (§ 1837 písm. a) občanského zákoníku).</p> 
<p>Odstoupí-li spotřebitel od smlouvy v době, kdy již bylo s poskytováním služby započato, ale služba dosud nebyla poskytnuta zcela, uhradí prodávajícímu poměrnou část sjednané ceny odpovídající rozsahu již poskytnutého plnění (§ 1834 občanského zákoníku).</p> 
<p>Nebyl-li u zakoupeného voucheru dosud sjednán ani zahájen termín plnění, právo na odstoupení do 14 dnů trvá v plném rozsahu. Podmínky storna nebo přesunu již sjednaného termínu ze strany zákazníka se řeší individuální dohodou.</p> 
<p><strong>C. Vztahy s podnikateli (B2B):</strong></p> 
<p>Pokud je kupujícím podnikatel (nákup na IČO), právo na odstoupení od smlouvy do 14 dnů bez udání důvodu nevzniká. Jakékoli storno objednávky nebo vrácení zboží podléhá schválení prodávajícího. Tím není dotčeno právo vypovědět smlouvu o opakovaně poskytovaných službách podle článku V.</p> 
</div> 
<div> 
<h2>VII. Práva z vadného plnění</h2> 
<p><strong>Jakost při převzetí.</strong> Prodávající odpovídá kupujícímu, že zboží při převzetí nemá vady — zejména že odpovídá ujednanému popisu, druhu, množství a jakosti, je vhodné k účelu, k němuž se zboží tohoto druhu obvykle používá, je dodáno s ujednaným příslušenstvím a pokyny k použití a odpovídá vlastnostem obvyklým pro zboží téhož druhu, které může kupující rozumně očekávat (§ 2161 občanského zákoníku).</p> 
<p><strong>Domněnka vadnosti.</strong> Projeví-li se vada v průběhu jednoho roku od převzetí, má se za to, že zboží bylo vadné již při převzetí, ledaže to povaha zboží nebo vady vylučuje.</p> 
<p><strong>Lhůta pro uplatnění.</strong> Spotřebitel může vytknout vadu, která se u zboží projeví v době 2 let od převzetí (§ 2165 občanského zákoníku). Vytkl-li kupující vadu oprávněně, tato doba neběží po dobu, po kterou kupující nemůže zboží užívat.</p> 
<p><strong>Práva kupujícího.</strong> Má-li zboží vadu, může kupující požadovat její odstranění, a to podle své volby dodáním nového zboží bez vady nebo opravou zboží — ledaže je zvolený způsob nemožný nebo ve srovnání s druhým nepřiměřeně nákladný (§ 2169 občanského zákoníku). Prodávající odstraní vadu v přiměřené době po jejím vytknutí a bezplatně tak, aby tím kupujícímu nezpůsobil značné obtíže.</p> 
<p><strong>Sleva a odstoupení.</strong> Kupující může požadovat přiměřenou slevu z kupní ceny nebo odstoupit od smlouvy, pokud prodávající vadu odmítl odstranit nebo ji neodstranil řádně, pokud se vada projeví opakovaně, pokud je vada podstatným porušením smlouvy, nebo pokud je z prohlášení prodávajícího či z okolností zjevné, že vada nebude odstraněna v přiměřené době nebo bez značných obtíží pro kupujícího (§ 2171 občanského zákoníku). Od smlouvy nelze odstoupit, je-li vada nevýznamná.</p> 
<p><strong>Kdy práva z vadného plnění nevznikají.</strong> Prodávající neodpovídá za vady vzniklé běžným opotřebením (zejména oděr tkaniny a potisku, opotřebení zipů, spon, suchých zipů a úchytů běžným používáním), mechanickým poškozením, nesprávným používáním v rozporu s návodem a doporučeným účelem, nesprávnou údržbou či praním, přetěžováním nad deklarovanou nosnost, ani za vady způsobené neodbornou úpravou zboží kupujícím nebo třetí osobou.</p> 
<p><strong>Záruka za jakost.</strong> Poskytne-li prodávající nad rámec zákonných práv záruku za jakost, je její rozsah a doba uvedena u konkrétního zboží nebo v záručním listu vydaném v textové podobě. Zárukou nejsou dotčena zákonná práva kupujícího z vadného plnění.</p> 
<p><strong>B2B.</strong> Je-li kupujícím podnikatel, řídí se práva z vadného plnění § 2099 a násl. občanského zákoníku. Kupující je povinen zboží prohlédnout co nejdříve po přechodu nebezpečí škody a zjevné vady vytknout bez zbytečného odkladu, nejpozději do 5 pracovních dnů od převzetí. Skryté vady je kupující povinen vytknout bez zbytečného odkladu poté, co je mohl při dostatečné péči zjistit; strany si výslovně ujednávají, že lhůta pro vytčení skryté vady podle § 2112 odst. 1 občanského zákoníku se zkracuje na 12 měsíců od odevzdání zboží.</p> 
</div> 
<div> 
<h2>VIII. Uplatnění reklamace</h2> 
<p>Reklamaci kupující uplatní u prodávajícího na adrese sídla nebo e-mailem na info@vapesport.cz. Doporučujeme přiložit doklad o koupi, popis vady a uvést preferovaný způsob vyřízení.</p> 
<p>Prodávající vydá kupujícímu písemné potvrzení o uplatnění reklamace, ve kterém uvede datum uplatnění, obsah reklamace, požadovaný způsob vyřízení a kontaktní údaje kupujícího (§ 19 odst. 1 zákona o ochraně spotřebitele).</p> 
<p>Je-li kupujícím spotřebitel, prodávající o reklamaci rozhodne ihned, ve složitých případech do 3 pracovních dnů; do této lhůty se nezapočítává doba přiměřená podle druhu výrobku potřebná k odbornému posouzení vady. Reklamaci včetně odstranění vady prodávající vyřídí a o jejím vyřízení spotřebitele informuje nejpozději do 30 dnů ode dne jejího uplatnění, nedohodnou-li se strany na delší lhůtě. Marné uplynutí této lhůty se považuje za podstatné porušení smlouvy a spotřebitel je oprávněn od smlouvy odstoupit nebo požadovat přiměřenou slevu.</p> 
<p>Prodávající vydá kupujícímu potvrzení o datu a způsobu vyřízení reklamace, včetně potvrzení o provedení opravy a době jejího trvání, případně písemné odůvodnění zamítnutí reklamace.</p> 
<p>Nevyzvedne-li si kupující zboží v přiměřené době poté, co byl vyrozuměn o vyřízení reklamace a možnosti zboží převzít, je prodávající oprávněn požadovat úplatu za uskladnění.</p> 
<p>Kupující má právo na úhradu účelně vynaložených nákladů spojených s uplatněním oprávněné reklamace. Reklamované zboží by mělo být předáno přiměřeně čisté.</p> 
</div> 
<div> 
<h2>IX. Obchodní sdělení</h2> 
<p>Prodávající je oprávněn zasílat kupujícímu, který u něj zakoupil zboží nebo služby, obchodní sdělení týkající se vlastních obdobných výrobků a služeb na e-mailovou adresu poskytnutou v souvislosti s nákupem, a to na základě § 7 odst. 3 zákona č. 480/2004 Sb., o některých službách informační společnosti.</p> 
<p>Kupující má právo zasílání obchodních sdělení kdykoli bezplatně odmítnout, a to jak při uzavření smlouvy, tak při zaslání každé jednotlivé zprávy — prostřednictvím odkazu pro odhlášení v patičce e-mailu nebo zprávou na info@vapesport.cz.</p> 
<p>Osobám, které u prodávajícího dosud nenakoupily, jsou obchodní sdělení zasílána výhradně na základě předchozího souhlasu.</p> 
</div> 
<div> 
<h2>X. Ochrana osobních údajů</h2> 
<p>Ochrana osobních údajů kupujícího je podrobně popsána v samostatném dokumentu  
<a href="https://www.vapesport.cz/ochrana-udaju">Zásady ochrany osobních údajů</a>, který je dostupný rovněž v patičce webu.</p> 
</div> 
<div> 
<h2>XI. Mimosoudní řešení sporů a dozor</h2> 
<p>K mimosoudnímu řešení spotřebitelských sporů z kupní smlouvy je příslušná Česká obchodní inspekce, Ústřední inspektorát — oddělení ADR, Gorazdova 1969/24, 120 00 Praha 2, e-mail adr@coi.gov.cz, internetová adresa coi.gov.cz/informace-o-adr/.</p> 
<p>Řízení lze zahájit na návrh spotřebitele, pokud se mu spor nepodařilo vyřešit přímo s prodávajícím. Návrh lze podat nejpozději do 1 roku ode dne, kdy spotřebitel uplatnil své právo u prodávajícího poprvé. Řízení je pro spotřebitele bezplatné.</p> 
<p>V případě přeshraničního sporu v rámci EU se spotřebitel může obrátit na Evropské spotřebitelské centrum ČR (www.evropskyspotrebitel.cz).</p> 
<p>Dozor nad dodržováním povinností vykonává Česká obchodní inspekce (www.coi.gov.cz), v oblasti ochrany osobních údajů Úřad pro ochranu osobních údajů a v oblasti živnostenského podnikání příslušný živnostenský úřad.</p> 
</div> 
<div> 
<h2>XII. Závěrečná ustanovení</h2> 
<p>Tyto obchodní podmínky jsou účinné od ${UCINNOST_OD}. Pro konkrétní objednávku je vždy rozhodné znění účinné ke dni jejího odeslání.</p> 
<p>Prodávající si vyhrazuje právo tyto obchodní podmínky měnit či doplňovat v závislosti na změně legislativy či obchodní politiky společnosti. Změnou obchodních podmínek nejsou dotčena práva a povinnosti vzniklá po dobu účinnosti předchozího znění.</p> 
<p>Je-li některé ustanovení těchto obchodních podmínek neplatné nebo neúčinné, nastoupí namísto něj ustanovení, jehož smysl se neplatnému ustanovení co nejvíce přibližuje. Neplatností nebo neúčinností jednoho ustanovení není dotčena platnost ostatních ustanovení.</p> 
<p>Vztahuje-li se na smluvní vztah zahraniční prvek, řídí se vztah českým právem; volbou práva není spotřebitel zbaven ochrany, kterou mu poskytují ustanovení právního řádu státu jeho obvyklého bydliště, od nichž se nelze smluvně odchýlit.</p> 
</div>`;

const SELLER_LINE =
  "Vapesport Vlach s.r.o., Paskovská 636/275, 720 00 Ostrava-Hrabová, IČ 05819369, e-mail info@vapesport.cz";

function docShell(title: string, body: string) {
  return `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"><title>${title}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;color:${CHARCOAL};max-width:760px;margin:40px auto;padding:0 24px;line-height:1.6;font-size:14px}
  h1{font-size:24px;margin:0 0 6px} h2{font-size:16px;margin:26px 0 8px;color:${MOSS}}
  p{margin:6px 0} a{color:${MOSS}}
  .line{border-bottom:1px solid #999;height:28px;margin:4px 0 14px}
  @media print{body{margin:0}}
</style></head><body>${body}</body></html>`;
}

function termsDocument() {
  return docShell(
    `Obchodní podmínky Vapesport (účinné od ${UCINNOST_OD})`,
    `<h1>Obchodní podmínky</h1>${TERMS_BODY}`
  );
}

/** Vzorový formulář podle přílohy nařízení vlády č. 363/2013 Sb. */
function withdrawalDocument(orderNumber: string) {
  const field = (label: string, value = "") =>
    `<p>${label}</p>${value ? `<p><strong>${escapeHtml(value)}</strong></p>` : `<div class="line"></div>`}`;
  return docShell(
    "Formulář pro odstoupení od smlouvy",
    `<h1>Formulář pro odstoupení od smlouvy</h1>
     <p>(vyplňte tento formulář a pošlete jej zpět pouze v případě, že chcete odstoupit od smlouvy;
     odstoupit můžete také online na <a href="https://www.vapesport.cz/odstoupeni">www.vapesport.cz/odstoupeni</a>)</p>
     ${field("Adresát:", SELLER_LINE)}
     ${field("Oznamuji/oznamujeme (*), že tímto odstupuji/odstupujeme (*) od smlouvy o nákupu tohoto zboží (*)/o poskytnutí těchto služeb (*):")}
     ${field("Číslo objednávky:", orderNumber)}
     ${field("Datum objednání (*)/datum obdržení (*):")}
     ${field("Jméno a příjmení spotřebitele/spotřebitelů:")}
     ${field("Adresa spotřebitele/spotřebitelů:")}
     ${field("Číslo bankovního účtu pro vrácení peněz:")}
     ${field("Podpis spotřebitele/spotřebitelů (pouze pokud je tento formulář zasílán v listinné podobě):")}
     ${field("Datum:")}
     <p style="font-size:12px;color:${MUTED}">(*) Nehodící se škrtněte nebo údaje doplňte.</p>`
  );
}

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");

function b2cAttachments(orderNumber: string) {
  return [
    {
      filename: `obchodni-podminky-vapesport-${UCINNOST_OD.replace(/\s/g, "")}.html`,
      content: b64(termsDocument()),
    },
    { filename: "formular-odstoupeni-od-smlouvy.html", content: b64(withdrawalDocument(orderNumber)) },
  ];
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
      let dbRow: any = null;
      try {
        const dbOrder = await findOrder(o.orderNumber);
        dbRow = dbOrder;
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
          html: customerOrderEmail({ ...o, customerEmail: recipient, db: dbRow }),
          replyTo: SHOP_EMAIL,
          // Spotřebitel (B2C) musí dostat podmínky na trvalém nosiči; B2B stačí odkaz.
          ...(o.isB2B ? {} : { attachments: b2cAttachments(String(o.orderNumber)) }),
        });
      }

      // 2) Oznámení do obchodu — odejde VŽDY
      await sendEmail({
        to: SHOP_EMAIL,
        subject: recipient
          ? `Nová objednávka${o.isB2B ? " (B2B)" : ""} #${o.orderNumber}`
          : `⚠️ Objednávka BEZ E-MAILU${o.isB2B ? " (B2B)" : ""} #${o.orderNumber}`,
        html:
          shopOrderEmail({ ...o, customerEmail: recipient || "", db: dbRow }) +
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
