import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WEBHOOK_URL = Deno.env.get('B2B_NOTIFICATION_WEBHOOK_URL');
    if (!WEBHOOK_URL) {
      throw new Error('B2B_NOTIFICATION_WEBHOOK_URL is not configured');
    }

    const payload = await req.json();

    const webhookData = {
      event: 'new_b2b_registration',
      timestamp: new Date().toISOString(),
      notify_emails: ['lucie.vlach@gmail.com', 'martin.slany@gmail.com'],
      registration: {
        company_name: payload.companyName,
        ico: payload.ico,
        dic: payload.dic || null,
        contact_person: payload.contactPerson,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        city: payload.city,
        zip: payload.zip,
      },
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'no-cors',
      body: JSON.stringify(webhookData),
    });

    console.log('Webhook sent, status:', response.status);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in notify-b2b-registration:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
