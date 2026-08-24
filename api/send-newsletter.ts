// api/send-newsletter.ts
// Rozeslání newsletteru. Akce: count | send | contacts | deleteContact.
// Dva zdroje příjemců:
//   1) b2b_profiles  – schválení B2B partneři (mají účet, slevu, portál)
//   2) newsletter_contacts – potenciální partneři (jen adresa, žádný účet)
// Výběr dělá admin a posílá seznam e-mailů; server pustí jen ty, které zná,
// a vyřadí odhlášené. Do HTML nahradí {osloveni} a připojí patičku podle typu.

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

type Kind = "partner" | "contact";
interface Recipient {
  email: string;
  name: string | null; // kontaktní osoba pro {osloveni}
  kind: Kind;
}

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

// Oslovení bez skloňování — holé příjmení (poslední slovo), nebo obecné "Dobrý den,"
function greeting(contactPerson: string | null): string {
  const name = (contactPerson || "").trim();
  if (!name) return "Dobrý den,";
  const words = name.split(/\s+/);
  if (words.length > 4 || name.length > 32) return "Dobrý den,"; // vypadá jako firma
  return `Dobrý den, ${words[words.length - 1]},`;
}

function unsubToken(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase() + SUPABASE_SERVICE_KEY).digest("hex").slice(0, 24);
}

// Patička se liší podle toho, komu píšeme.
// Partner = existující obchodní vztah. Prospekt = obchodní sdělení, musí být
// označené a musí být jasné, odkud adresu máme.
function unsubUrl(email: string): string {
  return `${SITE}/api/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubToken(email)}`;
}

function unsubFooter(email: string, kind: Kind): string {
  const link = unsubUrl(email);
  const intro =
    kind === "partner"
      ? "Tento e-mail jste dostali jako registrovaný B2B partner Vapesport."
      : "Obchodní sdělení společnosti Vapesport Vlach s.r.o., Paskovská 636/275, Ostrava-Hrabová.<br>Vaši adresu máme z veřejně dostupných zdrojů jako na prodejce v oboru cyklistiky.";
  return `<div style="margin-top:28px;padding-top:16px;border-top:1px solid #e0dcd3;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8a8a80;text-align:center;">${intro}<br><a href="${link}" style="color:#6E7B4E;">Odhlásit odběr novinek</a></div>`;
}

// --- zdroje příjemců -------------------------------------------------------

// PostgREST vrací max 1000 řádků na dotaz. Bez stránkování by se při růstu
// seznamu tiše zahodil zbytek — příjemci by prostě zmizeli, bez chyby.
async function fetchAll<T>(path: string): Promise<T[]> {
  const PAGE = 1000;
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { ...svcHeaders, Range: `${from}-${from + PAGE - 1}`, "Range-Unit": "items" },
    });
    if (!r.ok) break;
    const rows: T[] = await r.json();
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}

async function loadApproved(): Promise<Map<string, string | null>> {
  const rows = await fetchAll<{ invoice_email: string; contact_person: string | null }>(
    `b2b_profiles?status=eq.approved&invoice_email=not.is.null&select=invoice_email,contact_person`
  );
  const map = new Map<string, string | null>();
  for (const row of rows) {
    const e = (row.invoice_email || "").trim().toLowerCase();
    if (e && !map.has(e)) map.set(e, row.contact_person);
  }
  return map;
}

async function loadContacts(): Promise<Map<string, string | null>> {
  const rows = await fetchAll<{ email: string; contact_person: string | null }>(
    `newsletter_contacts?unsubscribed=eq.false&bounced=eq.false&select=email,contact_person`
  );
  const map = new Map<string, string | null>();
  for (const row of rows) {
    const e = (row.email || "").trim().toLowerCase();
    if (e && !map.has(e)) map.set(e, row.contact_person);
  }
  return map;
}

async function loadUnsub(): Promise<Set<string>> {
  const rows = await fetchAll<{ email: string }>(`newsletter_unsubscribes?select=email`);
  return new Set(rows.map((x) => x.email.toLowerCase()));
}

// Označí u prospektů, kdy jim naposledy něco odešlo (pro „skrýt už oslovené")
async function markContactsSent(emails: string[]): Promise<void> {
  if (!emails.length) return;
  const CHUNK = 100;
  for (let i = 0; i < emails.length; i += CHUNK) {
    const part = emails.slice(i, i + CHUNK);
    const list = part.map((e) => encodeURIComponent(`"${e}"`)).join(",");
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/newsletter_contacts?email=in.(${list})`, {
        method: "PATCH",
        headers: { ...svcHeaders, Prefer: "return=minimal" },
        body: JSON.stringify({ last_sent_at: new Date().toISOString() }),
      });
    } catch { /* razítko není kritické, rozesílka už proběhla */ }
  }
}

async function sendBatch(items: Array<{ to: string[]; subject: string; html: string; headers?: Record<string, string> }>) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Chybí RESEND_API_KEY.");
  const res = await fetch(RESEND_BATCH, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(items.map((it) => ({ from: FROM, ...it }))) });
  if (!res.ok) throw new Error("Resend batch chyba: " + (await res.text()));
  return res.json();
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Použij POST" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const token = body.token || (req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
    if (!(await verifyAdmin(token))) return res.status(401).json({ error: "Přístup jen pro administrátora." });

    // Seznam potenciálních partnerů pro výběr v adminu
    if (body.action === "contacts") {
      const contacts = await fetchAll(
        `newsletter_contacts?unsubscribed=eq.false&bounced=eq.false&select=id,email,company_name,city,last_sent_at&order=company_name.asc`
      );
      return res.status(200).json({ ok: true, contacts });
    }

    // Smazání kontaktu ze seznamu potenciálních partnerů.
    // Používá se na skutečné duplikáty. Maže natrvalo — proto jen podle id,
    // ne podle e-mailu (na e-mail by šlo omylem trefit víc řádků najednou).
    if (body.action === "deleteContact") {
      const id = String(body.id || "").trim();
      if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ error: "Chybí platné id kontaktu." });

      const r = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_contacts?id=eq.${id}`, {
        method: "DELETE",
        headers: { ...svcHeaders, Prefer: "return=representation" },
      });
      if (!r.ok) return res.status(500).json({ error: "Smazání se nepodařilo: " + (await r.text()) });

      const deleted = await r.json();
      if (!Array.isArray(deleted) || !deleted.length) {
        return res.status(404).json({ error: "Kontakt nenalezen (možná už byl smazaný)." });
      }
      return res.status(200).json({ ok: true, deleted: deleted[0]?.email ?? null });
    }

    const requested: string[] = Array.isArray(body.emails) ? body.emails.map((e: string) => String(e).trim().toLowerCase()) : [];
    const [approved, contacts, unsub] = await Promise.all([loadApproved(), loadContacts(), loadUnsub()]);

    // Partner má přednost před prospektem, kdyby náhodou byla adresa v obou
    const recipients: Recipient[] = [];
    for (const e of new Set(requested)) {
      if (unsub.has(e)) continue;
      if (approved.has(e)) recipients.push({ email: e, name: approved.get(e) ?? null, kind: "partner" });
      else if (contacts.has(e)) recipients.push({ email: e, name: contacts.get(e) ?? null, kind: "contact" });
    }

    if (body.action === "count") {
      return res.status(200).json({
        ok: true,
        count: recipients.length,
        partners: recipients.filter((r) => r.kind === "partner").length,
        contacts: recipients.filter((r) => r.kind === "contact").length,
      });
    }

    if (body.action === "send") {
      const subject = String(body.subject || "").trim();
      const html = String(body.html || "").trim();
      if (!subject || !html) return res.status(400).json({ error: "Chybí předmět nebo obsah." });
      if (!recipients.length) return res.status(400).json({ error: "Žádní příjemci." });

      const CHUNK = 100;
      for (let i = 0; i < recipients.length; i += CHUNK) {
        const items = recipients.slice(i, i + CHUNK).map((r) => ({
          to: [r.email],
          subject,
          html: html.replace(/\{osloveni\}/g, greeting(r.name)) + unsubFooter(r.email, r.kind),
          // Gmail a Yahoo vyžadují u hromadných odesílatelů odhlášení
          // jedním klikem přímo z rozhraní schránky. Bez těchto hlaviček
          // roste pravděpodobnost, že zprávu vyhodnotí jako nevyžádanou.
          headers: {
            "List-Unsubscribe": `<${unsubUrl(r.email)}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        }));
        await sendBatch(items);
      }

      await markContactsSent(recipients.filter((r) => r.kind === "contact").map((r) => r.email));

      await fetch(`${SUPABASE_URL}/rest/v1/newsletter_sends`, {
        method: "POST",
        headers: { ...svcHeaders, Prefer: "return=minimal" },
        body: JSON.stringify({ newsletter_id: body.newsletter_id || null, subject, discount_min: 0, discount_max: 0, recipient_count: recipients.length, segment: String(body.segment || "").slice(0, 200) || null }),
      });

      return res.status(200).json({
        ok: true,
        sent: recipients.length,
        partners: recipients.filter((r) => r.kind === "partner").length,
        contacts: recipients.filter((r) => r.kind === "contact").length,
      });
    }

    return res.status(400).json({ error: "Neznámá akce (count / send / contacts / deleteContact)." });
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
