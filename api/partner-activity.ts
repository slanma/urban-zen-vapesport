// api/partner-activity.ts
// Vrací adminovi informaci o aktivitě partnerů: mapu user_id -> poslední přihlášení.
// Z toho se v adminu poznají štítky "Registrace" (někdy se přihlásil) a
// "Aktivní" (přihlásil se v posledních 7 dnech).

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
    const ru = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${token}` } });
    if (!ru.ok) return false;
    const user = await ru.json();
    if (!user?.id) return false;
    const rr = await fetch(`${SUPABASE_URL}/rest/v1/rpc/has_role`, { method: "POST", headers: svcHeaders, body: JSON.stringify({ _user_id: user.id, _role: "admin" }) });
    if (!rr.ok) return false;
    return Boolean(await rr.json());
  } catch { return false; }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Použij POST" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const token = body.token || (req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
    if (!(await verifyAdmin(token))) return res.status(401).json({ error: "Přístup jen pro administrátora." });

    // Projdi auth uživatele po stránkách a posbírej last_sign_in_at
    const activity: Record<string, string | null> = {};
    let page = 1;
    const perPage = 1000;
    for (let i = 0; i < 5; i++) {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${perPage}`, { headers: svcHeaders });
      if (!r.ok) break;
      const data = await r.json();
      const users = Array.isArray(data?.users) ? data.users : [];
      for (const u of users) activity[u.id] = u.last_sign_in_at ?? null;
      if (users.length < perPage) break;
      page++;
    }
    return res.status(200).json({ ok: true, activity });
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
