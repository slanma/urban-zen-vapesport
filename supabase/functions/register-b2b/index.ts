import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, code: "method", message: "Nepovolená metoda." }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) throw new Error("Backend registration is not configured.");

    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const companyName = String(body.companyName ?? "").trim();
    const ico = String(body.ico ?? "").trim();
    const dic = String(body.dic ?? "").trim();
    const contactName = String(body.contactName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const address = String(body.address ?? "").trim();
    const city = String(body.city ?? "").trim();
    const zip = String(body.zip ?? "").trim();

    if (!isEmail(email)) return json({ ok: false, code: "invalid_email", message: "Neplatný formát e-mailu." });
    if (password.length < 8) return json({ ok: false, code: "weak_password", message: "Heslo musí mít alespoň 8 znaků." });
    if (!companyName || !contactName || !phone || !address || !city || !zip) {
      return json({ ok: false, code: "missing_fields", message: "Vyplňte všechna povinná pole." });
    }
    if (!/^\d{8}$/.test(ico)) return json({ ok: false, code: "invalid_ico", message: "IČO musí mít 8 číslic." });

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        b2b_registration: { companyName, ico, dic, contactName, phone, address, city, zip },
        company_name: companyName,
        contact_name: contactName,
      },
    });

    if (createError || !created.user) {
      const message = createError?.message ?? "Účet se nepodařilo vytvořit.";
      const lower = message.toLowerCase();
      if (lower.includes("already") || lower.includes("registered") || lower.includes("exists")) {
        return json({ ok: false, code: "email_exists", message: "Tento e-mail je již zaregistrován. Přihlaste se prosím." });
      }
      if (lower.includes("password") || lower.includes("weak") || lower.includes("pwned")) {
        return json({ ok: false, code: "weak_password", message });
      }
      return json({ ok: false, code: "auth_error", message });
    }

    const { error: profileError } = await admin.from("b2b_profiles").insert({
      user_id: created.user.id,
      company_name: companyName,
      ico,
      dic: dic || null,
      contact_person: contactName,
      phone,
      address,
      city,
      zip,
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id).catch(() => undefined);
      return json({ ok: false, code: "profile_error", message: profileError.message });
    }

    const webhookUrl = Deno.env.get("B2B_NOTIFICATION_WEBHOOK_URL");
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "new_b2b_registration",
          timestamp: new Date().toISOString(),
          notify_emails: ["lucie.vlach@gmail.com", "martin.slany@gmail.com"],
          registration: { company_name: companyName, ico, dic: dic || null, contact_person: contactName, email, phone, address, city, zip },
        }),
      }).catch((error) => console.error("B2B registration webhook failed:", error));
    }

    return json({ ok: true, status: "pending" });
  } catch (error) {
    console.error("register-b2b error:", error);
    return json({ ok: false, code: "unexpected", message: "Registrace se nezdařila. Zkuste to prosím znovu." }, 500);
  }
});