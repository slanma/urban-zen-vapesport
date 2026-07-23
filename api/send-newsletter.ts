// api/send-newsletter.ts
// Rozeslání newsletteru B2B partnerům podle rozsahu slevy (Vercel serverless).
// Akce: count | send. Vše smí jen přihlášený admin.
//  - count: vrátí, kolika partnerům by se poslalo (bez odeslání)
//  - send:  rozešle po dávkách přes Resend, přidá odhlašovací patičku,
//           zapíše záznam do historie (newsletter_sends)

import crypto from "node:crypto";

const SITE = "https://www.vapesport.cz";
const FROM = "Vapesport <info@vapesport.cz>";
const RESEND_BATCH = "https://api.resend.com/emails/batch";

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

// Token pro odhlašovací odkaz (aby nešlo odhlásit cizí e-mail bez znalosti tajného klíče)
function unsubToken(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase() + SUPABASE_SERVICE_KEY).digest("hex").slice(0, 24);
}

function unsubFooter(email: string): string {
  const link = `${SITE}/api/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubToken(email)}`;
  return `<div style="margin-top:28px;padding-top:16px;border-top:1px solid #e0dcd3;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8a8a80;text-align:center;">
    Tento e-mail jste dostali jako registrovaný B2B partner Vapesport.<br>
    <a href="${link}" style="color:#6E7B4E;">Odhlásit odběr novinek</a>
  </div>`;
}

// Načti příjemce: schválení partneři s e-mailem v rozsahu slevy, mimo odhlášené
async function loadRecipients(min: number, max: number): Promise<string[]> {
  const url =
    `${SUPABASE_URL}/rest/v1/b2b_profiles` +
    `?status=eq.approved&invoice_email=not.is.null` +
    `&discount_percent=gte.${min}&discount_percent=lte.${max}` +
    `&select=invoice_email`;
  const r = await fetch(url, { headers: svcHeaders });
  if (!r.ok) throw new Error("Načtení příjemců selhalo: " + (await r.text()));
  const rows: Array<{ invoice_email: string | null }> = await r.json();

  // odhlášení
  const ur = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_unsubscribes?select=email`, { headers: svcHeaders });
  const unsub = new Set<string>(
    ur.ok ? ((await ur.json()) as Array<{ email: string }>).map((x) => x.email.toLowerCase()) : [],
  );

  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of rows) {
    const e = (row.invoice_email || "").trim().toLowerCase();
    if (!e || seen.has(e) || unsub.has(e)) continue;
    seen.add(e);
    out.push(e);
  }
  return out;
}

async function sendBatch(items: Array<{ to: string[]; subject: string; html: string }>) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Chybí RESEND_API_KEY.");
  const res = await fetch(RESEND_BATCH, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(items.map((it) => ({ from: FROM, ...it }))),
  });
  if (!res.ok) throw new Error("Resend batch chyba: " + (await res.text()));
  return res.json();
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Použij POST" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const token = body.token || (req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
    if (!(await verifyAdmin(token))) {
      return res.status(401).json({ error: "Přístup jen pro administrátora." });
    }

    const min = Math.max(0, Math.min(100, Number(body.discount_min ?? 0)));
    const max = Math.max(0, Math.min(100, Number(body.discount_max ?? 100)));
    const recipients = await loadRecipients(min, max);

    if (body.action === "count") {
      return res.status(200).json({ ok: true, count: recipients.length });
    }

    if (body.action === "send") {
      const subject = String(body.subject || "").trim();
      const html = String(body.html || "").trim();
      if (!subject || !html) return res.status(400).json({ error: "Chybí předmět nebo obsah." });
      if (!recipients.length) return res.status(400).json({ error: "Žádní příjemci pro zvolený rozsah slevy." });

      // Sestav e-maily (každý s vlastní odhlašovací patičkou), pošli po dávkách po 100
      const CHUNK = 100;
      for (let i = 0; i < recipients.length; i += CHUNK) {
        const slice = recipients.slice(i, i + CHUNK);
        const items = slice.map((email) => ({
          to: [email],
          subject,
          html: html + unsubFooter(email),
        }));
        await sendBatch(items);
      }

      // Zápis do historie
      await fetch(`${SUPABASE_URL}/rest/v1/newsletter_sends`, {
        method: "POST",
        headers: { ...svcHeaders, Prefer: "return=minimal" },
        body: JSON.stringify({
          newsletter_id: body.newsletter_id || null,
          subject,
          discount_min: min,
          discount_max: max,
          recipient_count: recipients.length,
        }),
      });

      return res.status(200).json({ ok: true, sent: recipients.length });
    }

    return res.status(400).json({ error: "Neznámá akce (count / send)." });
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
