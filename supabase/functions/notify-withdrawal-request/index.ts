// notify-withdrawal-request
//
// Odešle dva e-maily přes Resend:
//   1. potvrzení zákazníkovi (doklad o odstoupení ve lhůtě)
//   2. interní notifikaci na info@vapesport.cz
//
// Vyžaduje secret RESEND_API_KEY v Supabase → Edge Functions → Secrets.
// Odesílací doména vapesport.cz je v Resendu ověřená (DKIM + SPF).

const FROM = "Vapesport <info@vapesport.cz>";
const INTERNAL_TO = "info@vapesport.cz";
const RETURN_ADDRESS = "Vapesport Vlach s.r.o., Paskovská 636/275, 720 00 Ostrava-Hrabová";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function sendEmail(apiKey: string, payload: Record<string, unknown>) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend ${res.status}: ${JSON.stringify(body)}`);
  return body;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("RESEND_API_KEY není nastavený");
      return json({ error: "missing_resend_api_key" }, 500);
    }

    const { order_number, email, full_name, bank_account, items, request_id } = await req.json();

    if (!order_number || !email) {
      return json({ error: "order_number and email are required" }, 400);
    }

    const submittedAt = new Date().toLocaleString("cs-CZ", { timeZone: "Europe/Prague" });
    const scope = items || "celá objednávka";
    const account = bank_account || "neuvedeno — vrátíme stejným způsobem, jakým jsme platbu přijali";

    // 1) Potvrzení zákazníkovi
    await sendEmail(apiKey, {
      from: FROM,
      to: [email],
      reply_to: INTERNAL_TO,
      subject: `Potvrzení odstoupení od smlouvy — objednávka ${order_number}`,
      html: `
        <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1F1F1F;max-width:600px">
          <h2 style="font-size:20px;margin:0 0 16px">Potvrzujeme přijetí odstoupení od smlouvy</h2>
          <p>Dobrý den${full_name ? ` ${esc(full_name)}` : ""},</p>
          <p>přijali jsme vaše odstoupení od kupní smlouvy. Tento e-mail si uschovejte — je dokladem o tom,
             že jste od smlouvy odstoupili ve čtrnáctidenní lhůtě.</p>
          <table style="border-collapse:collapse;margin:20px 0">
            <tr><td style="padding:4px 16px 4px 0;color:#6b6b6b">Číslo objednávky</td><td><strong>${esc(String(order_number))}</strong></td></tr>
            <tr><td style="padding:4px 16px 4px 0;color:#6b6b6b">Rozsah odstoupení</td><td>${esc(String(scope))}</td></tr>
            <tr><td style="padding:4px 16px 4px 0;color:#6b6b6b">Účet pro vrácení</td><td>${esc(String(account))}</td></tr>
            <tr><td style="padding:4px 16px 4px 0;color:#6b6b6b">Přijato</td><td>${esc(submittedAt)}</td></tr>
          </table>
          <h3 style="font-size:16px;margin:24px 0 8px">Co bude dál</h3>
          <ol style="padding-left:20px;margin:0">
            <li>Zboží nám zašlete nebo předejte nejpozději do 14 dnů na adresu ${RETURN_ADDRESS}.</li>
            <li>Náklady na vrácení zboží nesete vy.</li>
            <li>Peníze včetně nákladů na dodání (ve výši nejlevnějšího nabízeného způsobu) vám vrátíme
                do 14 dnů od odstoupení. Vrácení můžeme pozdržet do chvíle, než zboží obdržíme
                nebo než nám prokážete jeho odeslání.</li>
          </ol>
          <p style="margin-top:24px;color:#6b6b6b;font-size:13px">
            Vapesport Vlach s.r.o. · info@vapesport.cz · +420 606 080 922
          </p>
        </div>`,
    });

    // 2) Interní notifikace. Selhání tohohle e-mailu nesmí ovlivnit odpověď zákazníkovi.
    try {
      await sendEmail(apiKey, {
        from: FROM,
        to: [INTERNAL_TO],
        reply_to: email,
        subject: `Nové odstoupení od smlouvy — objednávka ${order_number}`,
        text: [
          "Byla přijata nová žádost o odstoupení od smlouvy.",
          "",
          `Číslo objednávky: ${order_number}`,
          `Jméno: ${full_name ?? "—"}`,
          `E-mail zákazníka: ${email}`,
          `Účet pro vrácení: ${bank_account ?? "—"}`,
          `Rozsah: ${scope}`,
          `ID žádosti: ${request_id ?? "—"}`,
          `Přijato: ${submittedAt}`,
        ].join("\n"),
      });
    } catch (e) {
      console.error("Interní notifikace selhala:", e);
    }

    return json({ ok: true });
  } catch (e) {
    console.error("notify-withdrawal-request error:", e);
    return json({ error: String(e) }, 500);
  }
});
