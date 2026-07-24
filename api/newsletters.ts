// api/newsletters.ts
// Správa newsletterů pro admina (Vercel serverless funkce).
// Akce: list | create | delete | history. Vše smí jen přihlášený admin.
// Data se čtou/zapisují přes service key (obchází RLS), takže tabulky
// zůstávají pro běžný web neviditelné.

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

const svcHeaders = {
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
};

// Ověření, že požadavek poslal přihlášený admin
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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Použij POST" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const token = body.token || (req.headers?.authorization || "").replace(/^Bearer\s+/i, "");

    if (!(await verifyAdmin(token))) {
      return res.status(401).json({ error: "Přístup jen pro administrátora." });
    }

    const { action } = body;

    if (action === "list") {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/newsletters?select=id,subject,html,created_at&order=created_at.desc`,
        { headers: svcHeaders },
      );
      const rows = await r.json();
      return res.status(200).json({ ok: true, newsletters: rows });
    }

    if (action === "create") {
      const subject = String(body.subject || "").trim();
      const html = String(body.html || "").trim();
      if (!subject || !html) return res.status(400).json({ error: "Chybí předmět nebo obsah." });
      const r = await fetch(`${SUPABASE_URL}/rest/v1/newsletters`, {
        method: "POST",
        headers: { ...svcHeaders, Prefer: "return=representation" },
        body: JSON.stringify({ subject, html }),
      });
      if (!r.ok) return res.status(400).json({ error: await r.text() });
      const rows = await r.json();
      return res.status(200).json({ ok: true, newsletter: rows[0] });
    }

    if (action === "delete") {
      const id = String(body.id || "");
      if (!id) return res.status(400).json({ error: "Chybí id." });
      const r = await fetch(`${SUPABASE_URL}/rest/v1/newsletters?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: svcHeaders,
      });
      if (!r.ok) return res.status(400).json({ error: await r.text() });
      return res.status(200).json({ ok: true });
    }

    if (action === "partners") {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/b2b_profiles?status=eq.approved&invoice_email=not.is.null&select=id,company_name,contact_person,invoice_email,discount_percent&order=company_name.asc`,
        { headers: svcHeaders },
      );
      return res.status(200).json({ ok: true, partners: await r.json() });
    }

    if (action === "history") {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/newsletter_sends?select=id,subject,segment,recipient_count,sent_at&order=sent_at.desc&limit=100`,
        { headers: svcHeaders },
      );
      const rows = await r.json();
      return res.status(200).json({ ok: true, history: rows });
    }

    return res.status(400).json({ error: "Neznámá akce (list / create / delete / history)." });
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
