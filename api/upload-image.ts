// api/upload-image.ts
// Nahrání obrázku do Supabase Storage (veřejný bucket) a vrácení trvalého odkazu.
// Jen pro administrátora. Přijímá JSON { filename, contentType, dataBase64 }.

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const BUCKET = "newsletter-images";

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

async function ensureBucket() {
  // vytvoř veřejný bucket, pokud ještě neexistuje (chybu "už existuje" ignorujeme)
  try {
    await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: "POST",
      headers: svcHeaders,
      body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
    });
  } catch { /* ignore */ }
}

function safeName(name: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  const base = (dot >= 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "obrazek";
  return `${Date.now()}-${base}.${ext || "jpg"}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Použij POST" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const token = body.token || (req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
    if (!(await verifyAdmin(token))) return res.status(401).json({ error: "Přístup jen pro administrátora." });

    const dataBase64 = String(body.dataBase64 || "");
    const contentType = String(body.contentType || "image/jpeg");
    if (!dataBase64) return res.status(400).json({ error: "Chybí data obrázku." });
    if (!contentType.startsWith("image/")) return res.status(400).json({ error: "Nahraj prosím obrázek." });

    const bytes = Buffer.from(dataBase64, "base64");
    if (bytes.length > 5 * 1024 * 1024) return res.status(400).json({ error: "Obrázek je příliš velký (max 5 MB)." });

    await ensureBucket();

    const path = safeName(body.filename || "obrazek.jpg");
    const up = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: bytes,
    });
    if (!up.ok) return res.status(400).json({ error: "Nahrání selhalo: " + (await up.text()) });

    const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
    return res.status(200).json({ ok: true, url });
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
