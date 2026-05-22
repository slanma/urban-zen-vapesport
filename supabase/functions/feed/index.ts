// B2B XML feed generator. Public endpoint, no auth required.
// Endpoints (served via Supabase Edge Functions):
//   GET <FUNCTIONS_URL>/feed/morseovape
//   GET <FUNCTIONS_URL>/feed/vape-legends
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

type BaseProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  shortDescription: string;
  code: string;
};

const MORSEO_COLORS = [
  "Černá",
  "Bílá",
  "Neon zelená",
  "Modrá",
  "Růžová",
  "Červená",
  "Zlatá",
  "Neon žlutá",
] as const;

const VAPE_LEGENDS_COLORS = [
  "Černá",
  "Šedá",
  "Neon žlutá",
  "Neon zelená",
  "Růžová",
  "Modrá",
  "Červená",
  "Tyrkysová světlá",
  "Tyrkysová tmavá",
] as const;

const MORSEO_BASE: BaseProduct[] = JSON.parse(
  `[{"id":"vs-ramova-brasna-nepromokavy-zip-945203","name":"Rámová brašna nepromokavý zip","price":599,"image":"https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/3-2116001.png","shortDescription":"Kompaktní brašna do klasických rámů i na celoodpružená elektrokola. Vejde se i do malých rámů (S/M). 2 kapsy.","code":"311055-M"},{"id":"vs-ramova-brasna-stredni-se-2-zipy-a-sitkou-945204","name":"Rámová brašna střední se 2 zipy a síťkou","price":620,"image":"https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/200b61b1-f6a6-4aae-b260-e00f4b37e7c8-1-105-c-2116933.jpeg","shortDescription":"Rámová brašna střední se 2 zipy a síťkou.","code":"410102-M"},{"id":"vs-brasna-na-mobil-5-5-945205","name":"MORSEO Transformer 5,5\\"","price":531,"image":"https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/transformer-5-5-morseo-013-2116957.jpeg","shortDescription":"Designová nepromokavá brašna na řídítka a představec s dotykovou slídou (16,5 × 9 cm) pro e-bike a koloběžky.","code":"M411104"},{"id":"vs-smb-morseo-945206","name":"SMB MORSEO","price":599,"image":"https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/13-2116939.png","shortDescription":"MORSEO SMB brašna na mobilní telefon do 7\\"","code":"M310073"},{"id":"vs-waterproof-bike-bag-bila-945208","name":"Waterproof bike bag bílá","price":1055,"image":"https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/27-2116026.png","shortDescription":"MORSEO WDB nepromokavá brašna na rám","code":"50001"},{"id":"vs-waterproof-saddle-bag-945209","name":"Waterproof saddle bag","price":950,"image":"https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/21-2116037.png","shortDescription":"MORSEO WDS nepromokavá brašna pod sedlo","code":"50002"},{"id":"vs-ramova-brasna-nepromokavy-zip-947097","name":"Rámová brašna nepromokavý zip","price":600,"image":"https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/m410006-001-2116908.jpeg","shortDescription":"Rámová brašna s nepromokavým zipem se 2 kapsami.","code":"M410006"},{"id":"vs-smb-morseo-zlata-947383","name":"SMB MORSEO zlatá","price":610,"image":"https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/17-2116063.png","shortDescription":"E-bike speciál: XXL brašna na široké rámy. I pro iPhone Max/Ultra v odolném krytu. Dlouhé pásky v ceně. Drží na Crussis i Cube.","code":"M310073 XXL"},{"id":"vs-ramova-brasna-nepromokavy-zip-bila-947404","name":"Rámová brašna nepromokavý zip bílá","price":620,"image":"https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/3-2116892.png","shortDescription":"Rámová brašna s nepromokavým zipem se 2 kapsami s flexibilním uchopením na popruhy.","code":"M311055-F"}]`,
);

const VAPE_LEGENDS_BASE: BaseProduct[] = JSON.parse(
  `[{"id":"vs-maly-trojuhlenik-3kapsy-904673","name":"Malý trojúhleník 3kapsý","price":378,"image":"https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/maly-troj-012-2116775.jpeg","shortDescription":"Brašna se 2 kapsami na zip a jednou síťkou.","code":"410001"},{"id":"vs-plochy-trojuhelnik-4kapsy-vape-904677","name":"Plochý trojúhelník 4kapsý VAPE","price":411,"image":"https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/plochy4k-007-2116779.jpeg","shortDescription":"4kapsý trojúhelník do rámu kola. Je vhodný i na určité rámy elektrokol.","code":"311055"},{"id":"vs-smb-vapesport-904678","name":"SMB Vapesport","price":400,"image":"https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/040/smb-004-2039648.jpeg","shortDescription":"Brašna na rám za představec kola s uchopením na suché zipy. Slída 6,7\\" je dotyková.","code":"310073"},{"id":"vs-lady-s-mobilem-904681","name":"Lady s mobilem","price":490,"image":"https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/lady-009-2116961.jpeg","shortDescription":"2kapsá brašna přes rámovou trubku na kola, elektrokola i koloběžky.","code":"410048"},{"id":"vs-uni-maxi-twist-904687","name":"UNI MAXI TWIST","price":695,"image":"https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/uni-maxi-twist-010-2116824.jpeg","shortDescription":"Malá brašna na řídítka na uchycení KLICKFIX adaptér i suchý zip. Vhodnost na kolo, koloběžku, elektrokola i dětská kola.","code":"410057"},{"id":"vs-brasna-pod-sedlo-zralok-twist-904706","name":"Brašna pod sedlo žralok TWIST","price":393,"image":"https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/zralok-004-2116878.jpeg","shortDescription":"Podsedlová brašna s rozšířením. 2 zipy pro zvětšení objemu brašny.","code":"310121"},{"id":"vs-m2-podsedlo-925467","name":"M2 podsedlo","price":354,"image":"https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/001/987/pozadi-obrazku-img-7357-1729140-bylo-odstraneno-1986588.png","shortDescription":"Malá podsedlo s uchopením na klip","code":"411046"}]`,
);

const stripDiacritics = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** PascalCase, no spaces, no diacritics — e.g. "Neon zelená" -> "NeonZelena" */
const colorSkuToken = (color: string) =>
  stripDiacritics(color)
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");

/** url-safe slug used for the product variant id (matches frontend colorSlug). */
const colorSlug = (color: string) =>
  stripDiacritics(color).toLowerCase().replace(/\s+/g, "-");

const escapeXml = (raw: string) =>
  raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const cdata = (raw: string) =>
  `<![CDATA[${String(raw).replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

type Override = {
  visible: boolean;
  in_stock: boolean;
  price_override: number | null;
};

const renderItem = (
  base: BaseProduct,
  color: string,
  override: Override,
  siteOrigin: string,
): string => {
  const cleanCode = base.code.replace(/\s+/g, "");
  const itemId = `${cleanCode}-${colorSkuToken(color)}`; // e.g. M411104-NeonZelena
  const groupId = cleanCode;                              // base code groups all colors
  const variantUrl = `${base.id}-${colorSlug(color)}`;
  const url = `${siteOrigin}/produkt/${variantUrl}`;
  const price = override.price_override ?? base.price;    // MOC s DPH only — never B2B VOC
  const deliveryDate = override.in_stock ? "0" : "14";
  const availability = override.in_stock ? "in stock" : "out of stock";

  return `  <ITEM>
    <ITEM_ID>${escapeXml(itemId)}</ITEM_ID>
    <ITEMGROUP_ID>${escapeXml(groupId)}</ITEMGROUP_ID>
    <CODE>${escapeXml(itemId)}</CODE>
    <SKU>${escapeXml(itemId)}</SKU>
    <PRODUCTNAME>${cdata(`${base.name} - ${color}`)}</PRODUCTNAME>
    <DESCRIPTION>${cdata(base.shortDescription)}</DESCRIPTION>
    <MANUFACTURER>VAPESPORT</MANUFACTURER>
    <URL>${escapeXml(url)}</URL>
    <IMGURL>${escapeXml(base.image)}</IMGURL>
    <PRICE_VAT>${price}</PRICE_VAT>
    <CURRENCY>CZK</CURRENCY>
    <PARAM>
      <PARAM_NAME>Barva</PARAM_NAME>
      <VAL>${escapeXml(color)}</VAL>
    </PARAM>
    <DELIVERY_DATE>${deliveryDate}</DELIVERY_DATE>
    <AVAILABILITY>${availability}</AVAILABILITY>
  </ITEM>`;
};

const buildFeed = (
  title: string,
  bases: BaseProduct[],
  colors: readonly string[],
  overrides: Map<string, Override>,
  siteOrigin: string,
): string => {
  const items: string[] = [];
  for (const base of bases) {
    for (const color of colors) {
      const variantId = `${base.id}-${colorSlug(color)}`;
      const ov = overrides.get(variantId) ?? {
        visible: true,
        in_stock: true,
        price_override: null,
      };
      if (!ov.visible) continue;
      items.push(renderItem(base, color, ov, siteOrigin));
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<SHOP generator="Vapesport B2B Feed" collection="${escapeXml(title)}">
${items.join("\n")}
</SHOP>`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  // Strip the function name prefix; accept both `/feed/<slug>` and bare `/<slug>`.
  const segments = url.pathname.split("/").filter(Boolean);
  const slug = (segments[segments.length - 1] ?? "").toLowerCase();

  let bases: BaseProduct[];
  let colors: readonly string[];
  let title: string;

  if (slug === "morseovape" || slug === "morseo") {
    bases = MORSEO_BASE;
    colors = MORSEO_COLORS;
    title = "MORSEOVAPE";
  } else if (slug === "vape-legends" || slug === "vapelegends") {
    bases = VAPE_LEGENDS_BASE;
    colors = VAPE_LEGENDS_COLORS;
    title = "Vape Legends";
  } else {
    return new Response(
      JSON.stringify({
        error: "Unknown feed",
        available: ["/feed/morseovape", "/feed/vape-legends"],
      }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Pull all overrides in one query (public-read policy permits anon access).
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const variantIds: string[] = [];
  for (const base of bases) {
    for (const color of colors) {
      variantIds.push(`${base.id}-${colorSlug(color)}`);
    }
  }

  const overrides = new Map<string, Override>();
  const { data, error } = await supabase
    .from("product_overrides")
    .select("product_id, visible, in_stock, price_override")
    .in("product_id", variantIds);

  if (error) {
    console.error("override fetch failed", error);
  } else if (data) {
    for (const row of data) {
      overrides.set(row.product_id as string, {
        visible: row.visible as boolean,
        in_stock: row.in_stock as boolean,
        price_override: row.price_override as number | null,
      });
    }
  }

  const siteOrigin =
    req.headers.get("origin") ?? "https://urban-zen-vapesport.lovable.app";
  const xml = buildFeed(title, bases, colors, overrides, siteOrigin);

  return new Response(xml, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
});
