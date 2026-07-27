// api/create-partner.ts
// Založení nového B2B partnera z administrace.
// Vytvoří přihlašovací účet (rovnou s heslem, bez čekání na e-mailový odkaz),
// založí profil v b2b_profiles a volitelně pošle partnerovi přístupové údaje.

import crypto from "node:crypto";

const SITE = "https://www.vapesport.cz";
const FROM = "Vapesport <info@vapesport.cz>";
const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

const svcHeaders = {
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
};

async function verifyAdmin(token: string): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !token) return false;
  try {
    const ru = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${token}` },
    });
    if (!ru.ok) return false;
    const user = await ru.json();
    if (!user?.id) return false;
    const rr = await fetch(`${SUPABASE_URL}/rest/v1/rpc/has_role`, {
      method: "POST",
      headers: svcHeaders,
      body: JSON.stringify({ _user_id: user.id, _role: "admin" }),
    });
    if (!rr.ok) return false;
    return Boolean(await rr.json());
  } catch {
    return false;
  }
}

/** Heslo, které se dá nadiktovat po telefonu — bez znaků, co se pletou (0/O, 1/l/I). */
function generatePassword(): string {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const num = "23456789";
  const pick = (set: string, n: number) =>
    Array.from({ length: n }, () => set[crypto.randomInt(set.length)]).join("");
  return `${pick(abc, 4)}-${pick(num, 4)}-${pick(abc, 4)}`;
}

function isEmail(x: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(x);
}

async function sendCredentials(email: string, password: string, company: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, error: "Chybí RESEND_API_KEY." };

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#33332e;max-width:560px;">
  <p>Dobrý den,</p>
  <p>založili jsme Vám přístup do velkoobchodního portálu Vapesport pro firmu <strong>${company}</strong>.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #e0dcd3;border-radius:6px;">
    <tr><td style="padding:14px 18px;">
      <div style="margin-bottom:6px;"><span style="color:#8a8a80;">Adresa:</span> <a href="${SITE}/b2b-login" style="color:#6E7B4E;">${SITE.replace("https://", "")}/b2b-login</a></div>
      <div style="margin-bottom:6px;"><span style="color:#8a8a80;">Přihlašovací e-mail:</span> <strong>${email}</strong></div>
      <div><span style="color:#8a8a80;">Heslo:</span> <strong style="font-family:monospace;font-size:16px;">${password}</strong></div>
    </td></tr>
  </table>
  <p>Heslo si prosím při nejbližší příležitosti změňte na <a href="${SITE}/b2b-heslo" style="color:#6E7B4E;">${SITE.replace("https://", "")}/b2b-heslo</a>.</p>
  <p>V portálu uvidíte své velkoobchodní ceny a můžete rovnou objednávat. Kdyby cokoliv nefungovalo, dejte nám prosím vědět.</p>
  <p style="margin-top:24px;">S pozdravem<br>Vapesport.cz</p>
</div>`.trim();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      subject: "Vapesport B2B portál — přístupové údaje",
      html,
    }),
  });
  if (!res.ok) return { sent: false, error: await res.text() };
  return { sent: true };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Použij POST" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const token = body.token || (req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
    if (!(await verifyAdmin(token))) {
      return res.status(401).json({ error: "Přístup jen pro administrátora." });
    }

    const email = String(body.invoice_email || "").trim().toLowerCase();
    const company = String(body.company_name || "").trim();

    if (!company) return res.status(400).json({ error: "Vyplňte název firmy." });
    if (!isEmail(email)) return res.status(400).json({ error: "E-mail nemá správný tvar." });

    // Už takový profil existuje?
    const dup = await fetch(
      `${SUPABASE_URL}/rest/v1/b2b_profiles?invoice_email=eq.${encodeURIComponent(email)}&select=id,company_name`,
      { headers: svcHeaders }
    );
    const dupRows = dup.ok ? await dup.json() : [];
    if (Array.isArray(dupRows) && dupRows.length) {
      return res.status(409).json({ error: `Partner s e-mailem ${email} už existuje (${dupRows[0].company_name}).` });
    }

    const password = generatePassword();

    // 1) Přihlašovací účet. Rovnou potvrzený, aby nemusel nic klikat.
    let userId: string | null = null;
    let userWasNew = false;

    const cu = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: svcHeaders,
      body: JSON.stringify({ email, password, email_confirm: true }),
    });

    if (cu.ok) {
      const created = await cu.json();
      userId = created?.id || null;
      userWasNew = true;
    } else {
      // Účet už existuje (profil ale ne) — najdi ho a nastav mu heslo.
      const find = await fetch(
        `${SUPABASE_URL}/auth/v1/admin/users?filter=${encodeURIComponent(email)}`,
        { headers: svcHeaders }
      );
      const found = find.ok ? await find.json() : null;
      const match = (found?.users || []).find(
        (u: any) => String(u.email || "").toLowerCase() === email
      );
      if (!match?.id) {
        return res.status(400).json({ error: "Účet se nepodařilo založit: " + (await cu.text()) });
      }
      userId = match.id;
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: "PUT",
        headers: svcHeaders,
        body: JSON.stringify({ password, email_confirm: true }),
      });
    }

    if (!userId) return res.status(500).json({ error: "Účet se nepodařilo založit." });

    // 2) Profil (přes funkci, která obejde trigger b2b_guard)
    const rpc = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_create_b2b_partner`, {
      method: "POST",
      headers: svcHeaders,
      body: JSON.stringify({
        p_user_id: userId,
        p_company_name: company,
        p_invoice_email: email,
        p_contact_person: body.contact_person || null,
        p_phone: body.phone || null,
        p_ico: body.ico || null,
        p_dic: body.dic || null,
        p_address: body.address || null,
        p_city: body.city || null,
        p_zip: body.zip || null,
        p_discount: Number(body.discount_percent) || 0,
        p_free_shipping: Boolean(body.free_shipping),
        p_notes: body.notes || null,
      }),
    });

    if (!rpc.ok) {
      const detail = await rpc.text();
      // Když jsme účet právě vytvořili a profil selhal, ať nezůstane sirotek.
      if (userWasNew) {
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
          method: "DELETE",
          headers: svcHeaders,
        }).catch(() => {});
      }
      return res.status(500).json({ error: "Profil se nepodařilo založit: " + detail });
    }

    // 3) Volitelně poslat údaje partnerovi
    let mail: { sent: boolean; error?: string } = { sent: false };
    if (body.send_email) {
      mail = await sendCredentials(email, password, company);
    }

    return res.status(200).json({
      ok: true,
      user_id: userId,
      email,
      password,
      email_sent: mail.sent,
      email_error: mail.error || null,
    });
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
