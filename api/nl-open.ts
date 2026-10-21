// api/nl-open.ts
// Počítání otevření newsletteru bez Resendu a bez DNS.
// Každý newsletter obsahuje neviditelný obrázek 1×1 px s adresou
//   https://www.vapesport.cz/api/nl-open?e=<email>&t=<podpis>
// Když se mail otevře, schránka obrázek stáhne → zapíše se „otevřeno"
// a adresa se tím „probudí" (počítadlo neotevřených = 0).
// Podpis t je stejný jako u odhlašovacího odkazu, takže si nikdo nemůže
// „otevřít" cizí adresu.

import crypto from "node:crypto";

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

// průhledný GIF 1×1
const GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

function token(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase() + SUPABASE_SERVICE_KEY).digest("hex").slice(0, 24);
}

export default async function handler(req: any, res: any) {
  // Obrázek vrátíme vždycky — i když je odkaz špatný, ať se v mailu nic nerozbije.
  try {
    const q = req.query || {};
    const email = String(q.e || "").trim().toLowerCase();
    const t = String(q.t || "");
    if (email && t && t === token(email) && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/newsletter_udalost`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ p_email: email, p_typ: "opened", p_detail: null }),
      });
    }
  } catch { /* nic, obrázek pošleme stejně */ }

  res.setHeader("Content-Type", "image/gif");
  res.setHeader("Content-Length", String(GIF.length));
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  return res.status(200).send(GIF);
}
