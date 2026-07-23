// api/unsubscribe.ts
// Veřejný odhlašovací odkaz z newsletteru. Otevře se v prohlížeči.
// Ověří token (aby nešlo odhlásit cizí e-mail) a zapíše e-mail do
// newsletter_unsubscribes. Vrátí jednoduchou potvrzovací stránku.

import crypto from "node:crypto";

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const CONCRETE = "#EFECE6";
const CHARCOAL = "#2E2E2B";
const MOSS = "#6E7B4E";

function unsubToken(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase() + SUPABASE_SERVICE_KEY).digest("hex").slice(0, 24);
}

function page(title: string, message: string): string {
  return `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head>
  <body style="margin:0;background:${CONCRETE};font-family:Arial,Helvetica,sans-serif;color:${CHARCOAL};">
    <div style="max-width:520px;margin:60px auto;padding:32px;background:#fff;border:1px solid #e0dcd3;border-radius:8px;text-align:center;">
      <div style="font-size:12px;letter-spacing:2px;color:${MOSS};text-transform:uppercase;">Vapesport</div>
      <h1 style="font-size:22px;margin:12px 0 16px;">${title}</h1>
      <p style="font-size:15px;line-height:1.6;color:#555;">${message}</p>
      <a href="https://www.vapesport.cz" style="display:inline-block;margin-top:20px;background:${MOSS};color:#fff;text-decoration:none;padding:10px 20px;border-radius:4px;font-weight:700;">Zpět na vapesport.cz</a>
    </div>
  </body></html>`;
}

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  try {
    const url = new URL(req.url, "https://www.vapesport.cz");
    const email = (url.searchParams.get("e") || "").trim().toLowerCase();
    const token = (url.searchParams.get("t") || "").trim();

    if (!email || !token || token !== unsubToken(email)) {
      return res.status(400).send(page("Neplatný odkaz", "Odhlašovací odkaz je neplatný nebo poškozený. Pokud problém přetrvává, napište nám na info@vapesport.cz."));
    }

    // upsert do seznamu odhlášených
    const r = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_unsubscribes`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({ email }),
    });
    if (!r.ok && r.status !== 409) {
      return res.status(500).send(page("Něco se nepovedlo", "Odhlášení se teď nepodařilo uložit. Zkuste to prosím později, nebo napište na info@vapesport.cz."));
    }

    return res.status(200).send(page("Odhlášeno", `E-mail <strong>${email}</strong> byl odhlášen z odběru novinek. Další newslettery vám už posílat nebudeme.`));
  } catch (e: any) {
    return res.status(500).send(page("Něco se nepovedlo", "Zkuste to prosím později."));
  }
}
