// api/create-partner.ts
// Založení nového B2B partnera z administrace.
// Vytvoří přihlašovací účet BEZ hesla, založí profil v b2b_profiles
// a pošle partnerovi odkaz, přes který si heslo nastaví sám.
// Heslo tak neputuje e-mailem ani neleží nikomu ve schránce.

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

/**
 * Vyrobí jednorázový odkaz, přes který si partner nastaví heslo.
 * Supabase ho vrací jako action_link — podle verze buď v kořeni odpovědi,
 * nebo pod properties, proto se sahá na obě místa.
 */
async function createSetPasswordLink(email: string): Promise<string | null> {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: svcHeaders,
    body: JSON.stringify({
      type: "recovery",
      email,
      options: { redirect_to: `${SITE}/b2b-heslo` },
      redirect_to: `${SITE}/b2b-heslo`,
    }),
  });
  if (!r.ok) return null;
  const data = await r.json();
  return data?.action_link || data?.properties?.action_link || null;
}

/** Nevyplněné pole → prázdný text. Sloupce v b2b_profiles jsou NOT NULL. */
function txt(v: unknown): string {
  return String(v ?? "").trim();
}

function isEmail(x: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(x);
}

async function sendInvite(email: string, link: string, company: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, error: "Chybí RESEND_API_KEY." };

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#33332e;max-width:560px;">
  <p>Dobrý den,</p>
  <p>založili jsme Vám přístup do velkoobchodního portálu Vapesport pro firmu <strong>${company}</strong>.</p>
  <p>Zbývá poslední krok — nastavit si vlastní heslo:</p>
  <p style="margin:24px 0;">
    <a href="${link}" style="display:inline-block;background:#6E7B4E;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-weight:bold;">Nastavit heslo</a>
  </p>
  <p style="font-size:13px;color:#8a8a80;">
    Odkaz je platný 24 hodin a lze ho použít jednou. Kdyby už nefungoval,
    otevřete <a href="${SITE}/b2b-heslo" style="color:#6E7B4E;">${SITE.replace("https://", "")}/b2b-heslo</a>,
    zadejte svůj e-mail <strong>${email}</strong> a nový odkaz Vám přijde obratem.
  </p>
  <p>Po nastavení hesla uvidíte v portálu své velkoobchodní ceny a můžete rovnou objednávat.</p>
  <p style="margin-top:24px;">S pozdravem<br>Vapesport.cz</p>
</div>`.trim();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      subject: "Vapesport B2B portál — nastavte si heslo",
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

    // 1) Přihlašovací účet BEZ hesla. Potvrzený, aby šel rovnou použít
    //    odkaz na nastavení hesla a partner nemusel potvrzovat e-mail zvlášť.
    let userId: string | null = null;
    let userWasNew = false;

    const cu = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: svcHeaders,
      body: JSON.stringify({ email, email_confirm: true }),
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
      // Účet existuje — heslo mu nepřepisujeme. Kdyby ho už měl nastavené,
      // přišel by o něj. Odkaz na nastavení hesla dostane tak jako tak.
      userId = match.id;
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
        // Nevyplněná pole posíláme jako prázdný text, ne null.
        // Část sloupců v b2b_profiles je NOT NULL a null by je shodil.
        p_contact_person: txt(body.contact_person),
        p_phone: txt(body.phone),
        p_ico: txt(body.ico),
        p_dic: txt(body.dic),
        p_address: txt(body.address),
        p_city: txt(body.city),
        p_zip: txt(body.zip),
        p_discount: Number(body.discount_percent) || 0,
        p_free_shipping: Boolean(body.free_shipping),
        p_notes: txt(body.notes),
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

    // 3) Odkaz na nastavení hesla + odeslání pozvánky
    const link = await createSetPasswordLink(email);

    let mail: { sent: boolean; error?: string } = { sent: false };
    if (body.send_email !== false) {
      if (!link) {
        mail = { sent: false, error: "Odkaz na nastavení hesla se nepodařilo vytvořit." };
      } else {
        mail = await sendInvite(email, link, company);
      }
    }

    return res.status(200).json({
      ok: true,
      user_id: userId,
      email,
      email_sent: mail.sent,
      email_error: mail.error || null,
      // Záložní odkaz pro případ, že e-mail nedorazí. Admin ho může
      // partnerovi předat jinou cestou. Jednorázový, platnost 24 h.
      set_password_link: link,
    });
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
