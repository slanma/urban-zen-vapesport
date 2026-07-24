// api/poptavka.ts
// Poptávky z kalkulačky. Akce:
//   create  — veřejné (z webu), založí poptávku + pošle upozornění na e-mail
//   list    — admin, seznam poptávek
//   status  — admin, změna stavu (new/handled)
//   delete  — admin, smazání
// Data jdou přes service key (obchází RLS).

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const NOTIFY_TO = "info@vapesport.cz";
const FROM = "Vapesport <info@vapesport.cz>";

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

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function notify(row: any) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const svc = Array.isArray(row.services)
    ? row.services.map((s: any) => `• ${esc(s.name)}${s.price ? ` — ${esc(s.price)}` : ""}`).join("<br>")
    : "";
  const html = `
    <h2 style="font-family:Arial,sans-serif;">Nová poptávka z kalkulačky</h2>
    <table style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;">
      <tr><td><strong>Firma / jméno:</strong></td><td>${esc(row.company) || "—"}</td></tr>
      <tr><td><strong>E-mail:</strong></td><td>${esc(row.email)}</td></tr>
      <tr><td><strong>Telefon:</strong></td><td>${esc(row.phone) || "—"}</td></tr>
      <tr><td><strong>Web:</strong></td><td>${esc(row.web) || "—"}</td></tr>
    </table>
    <p style="font-family:Arial,sans-serif;font-size:14px;"><strong>Vybrané služby:</strong><br>${svc || "—"}</p>
    <p style="font-family:Arial,sans-serif;font-size:14px;">
      <strong>Jednorázově:</strong> ${esc(row.price_once)} Kč bez DPH<br>
      <strong>Měsíčně:</strong> ${esc(row.price_month)} Kč bez DPH
      ${row.has_custom ? "<br><em>+ e-shop na míru (k vyčíslení)</em>" : ""}
    </p>
    ${row.message ? `<p style="font-family:Arial,sans-serif;font-size:14px;"><strong>Zpráva:</strong><br>${esc(row.message)}</p>` : ""}
  `;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [NOTIFY_TO], reply_to: row.email, subject: `Nová poptávka: ${row.company || row.email}`, html }),
    });
  } catch {
    /* upozornění je best-effort */
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Použij POST" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const action = body.action;

    // --- Veřejné: založení poptávky ---
    if (action === "create") {
      const email = String(body.email || "").trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Neplatný e-mail." });
      }
      if (body.hp) return res.status(200).json({ ok: true }); // honeypot proti spamu
      const row = {
        company: String(body.company || "").trim() || null,
        email,
        phone: String(body.phone || "").trim() || null,
        web: String(body.web || "").trim() || null,
        message: String(body.message || "").trim() || null,
        services: Array.isArray(body.services) ? body.services : [],
        price_once: Number(body.price_once) || 0,
        price_month: Number(body.price_month) || 0,
        has_custom: Boolean(body.has_custom),
      };
      const r = await fetch(`${SUPABASE_URL}/rest/v1/poptavky`, {
        method: "POST",
        headers: { ...svcHeaders, Prefer: "return=minimal" },
        body: JSON.stringify(row),
      });
      if (!r.ok) return res.status(400).json({ error: await r.text() });
      await notify(row);
      return res.status(200).json({ ok: true });
    }

    // --- Admin akce ---
    const token = body.token || (req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
    if (!(await verifyAdmin(token))) {
      return res.status(401).json({ error: "Přístup jen pro administrátora." });
    }

    if (action === "list") {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/poptavky?select=*&order=created_at.desc`,
        { headers: svcHeaders },
      );
      return res.status(200).json({ ok: true, poptavky: await r.json() });
    }

    if (action === "status") {
      const id = String(body.id || "");
      const status = body.status === "handled" ? "handled" : "new";
      const r = await fetch(`${SUPABASE_URL}/rest/v1/poptavky?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { ...svcHeaders, Prefer: "return=minimal" },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) return res.status(400).json({ error: await r.text() });
      return res.status(200).json({ ok: true });
    }

    if (action === "delete") {
      const id = String(body.id || "");
      const r = await fetch(`${SUPABASE_URL}/rest/v1/poptavky?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: svcHeaders,
      });
      if (!r.ok) return res.status(400).json({ error: await r.text() });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Neznámá akce." });
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
