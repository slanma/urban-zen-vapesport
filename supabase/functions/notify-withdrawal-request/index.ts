import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { order_number, email, request_id } = await req.json();
    if (!order_number || !email) {
      return new Response(JSON.stringify({ error: 'order_number and email are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const webhookUrl = Deno.env.get('B2B_NOTIFICATION_WEBHOOK_URL');
    const payload = {
      type: 'withdrawal_request',
      to: 'info@vapesport.cz',
      subject: `Nová žádost o odstoupení od smlouvy – objednávka ${order_number}`,
      text: `Byla přijata nová žádost o odstoupení od smlouvy.\n\nČíslo objednávky: ${order_number}\nE-mail zákazníka: ${email}\nID žádosti: ${request_id ?? '—'}\nDatum: ${new Date().toISOString()}`,
      data: { order_number, email, request_id },
    };

    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((e) => console.error('Webhook error', e));
    } else {
      console.log('Withdrawal notification (no webhook configured):', payload);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
