// api/resend-webhook.ts
// Resend sem posílá, co se s odeslanými maily stalo. Podle toho se v databázi:
//   email.opened / email.clicked  → vynuluje počítadlo neotevřených (adresa „se probudí")
//   email.delivered               → vynuluje počítadlo dočasných odrazů
//   email.bounced  (Permanent)    → adresa se hned vyřadí z newsletterů
//   email.bounced  (jiný typ)     → přičte se dočasný odraz, po 3 v řadě se vyřadí
//   email.complained              → označil jako spam: newslettery se mu už neposílají
// Veškerá logika je v SQL funkci public.newsletter_udalost (soubor 01-newsletter-pravidla.sql).
//
// PROMĚNNÉ PROSTŘEDÍ (ve Vercelu):
//   RESEND_WEBHOOK_SECRET – „Signing secret" z Resendu (začíná whsec_)
//   SUPABASE_URL, SUPABASE_SERVICE_KEY – stejné jako u ostatních funkcí

import crypto from "node:crypto";

export const config = { api: { bodyParser: false } };

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || "";

async function readRaw(req: any): Promise<string> {
  const chunks: Buffer[] = [];
  try {
    for await (const c of req) chunks.push(typeof c === "string" ? Buffer.from(c) : c);
  } catch { /* stream už mohl být přečtený */ }
  if (chunks.length) return Buffer.concat(chunks).toString("utf8");
  if (typeof req.body === "string") return req.body;
  if (req.body) return JSON.stringify(req.body);
  return "";
}

// Ověření podpisu (Resend používá Svix): HMAC-SHA256 z "id.timestamp.body"
function verifySignature(raw: string, headers: any): boolean {
  const h = (n: string) => String(headers?.[n] || "");
  const id = h("svix-id"), ts = h("svix-timestamp"), sig = h("svix-signature");
  if (!WEBHOOK_SECRET || !id || !ts || !sig) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false; // starší než 5 minut
  const key = Buffer.from(WEBHOOK_SECRET.replace(/^whsec_/, ""), "base64");
  const expected = crypto.createHmac("sha256", key).update(`${id}.${ts}.${raw}`).digest();
  return sig.split(" ").some((part) => {
    const [ver, value] = part.split(",");
    if (ver !== "v1" || !value) return false;
    const got = Buffer.from(value, "base64");
    return got.length === expected.length && crypto.timingSafeEqual(got, expected);
  });
}

async function zapis(email: string, typ: string, detail: string | null) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/newsletter_udalost`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_email: email, p_typ: typ, p_detail: detail }),
  });
  return r.ok ? await r.json() : `chyba DB: ${await r.text()}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Použij POST" });

  const raw = await readRaw(req);
  if (!verifySignature(raw, req.headers)) {
    console.error("resend-webhook: Neplatný podpis (zkontroluj RESEND_WEBHOOK_SECRET ve Vercelu)");
    return res.status(401).json({ error: "Neplatný podpis" });
  }

  let event: any;
  try { event = JSON.parse(raw); } catch { return res.status(400).json({ error: "Neplatný JSON" }); }

  const type = String(event?.type || "");
  const data = event?.data || {};
  const to: string[] = Array.isArray(data.to) ? data.to : data.to ? [data.to] : [];

  let typ: string | null = null;
  let detail: string | null = null;

  if (type === "email.opened" || type === "email.clicked") typ = "opened";
  else if (type === "email.delivered") typ = "delivered";
  else if (type === "email.complained") typ = "complained";
  else if (type === "email.bounced") {
    const b = data.bounce || {};
    typ = String(b.type || "").toLowerCase() === "permanent" ? "bounce_trvaly" : "bounce_docasny";
    detail = [b.type, b.subType, b.message].filter(Boolean).join(" · ").slice(0, 300) || null;
  }

  // Ostatní události (odesláno, zpožděno…) jen potvrdíme, ať je Resend neposílá znovu.
  if (!typ || !to.length) return res.status(200).json({ ok: true, ignored: type });

  const vysledky: any[] = [];
  for (const email of to) {
    const v = await zapis(String(email).trim().toLowerCase(), typ, detail);
    vysledky.push(v);
    console.log(`resend-webhook: ${email} → ${typ}${detail ? " (" + detail + ")" : ""} → ${JSON.stringify(v)}`);
  }
  return res.status(200).json({ ok: true, typ, vysledky });
}
