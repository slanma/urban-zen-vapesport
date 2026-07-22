// api/feed.xml.ts
// Marketingový produktový feed pro Google Shopping / Meta (Facebook & Instagram).
// Běží na https://www.vapesport.cz/api/feed.xml (Vercel serverless funkce, složka /api).
//
// Formát: RSS 2.0 s namespacem g: (http://base.google.com/ns/1.0) — Google Merchant
// Center i Meta Commerce Manager čtou stejný formát.
//
// Do feedu jdou JEN varianty, které mají EAN (getGtin) — Google/Meta vyžadují GTIN
// pro nejlepší dohledatelnost. Produkty bez GTINu (SMB 6,7", WDB, WDS, FLEXI,
// Transformer bez base+bílé) tím z feedu vypadnou — přesně jak chceme.
//
// Jeden <item> = jedna barevná varianta. Varianty téhož produktu spojuje item_group_id.

import { feedProducts } from "../src/data/feedProducts";
import { getGtin } from "../src/data/productGtins";
import { resolveColor } from "../src/lib/colorPalette";

// --- konfigurace (uprav dle potřeby) -----------------------------------
const SITE = "https://www.vapesport.cz";
// Kondice a dostupnost jsou zatím napevno. Sklad lze později napojit na
// product_overrides.in_stock / stock_qty (viz TODO u availability níže).
const CONDITION = "new";
const CURRENCY = "CZK";
// Google product category (textová cesta z oficiální taxonomie). Cyklobrašny:
const GOOGLE_CATEGORY = "Sporting Goods > Outdoor Recreation > Cycling > Bicycle Bags & Panniers";

// MORSEO marketingové slugy -> prostá čeština (stejné jako v B2B feedu).
const MORSEO_CZECH: Record<string, string> = {
  "blackout-g": "šedá",
  "arctic-white": "bílá",
  "coral-code": "červená",
  "flamingo-luxe": "růžová",
  "dandelite-yellow": "žlutá",
  "lime-spark": "zelená",
  "lazurite-blue": "modrá",
  "golden-wheat": "zlatá",
};
const czechColor = (slug: string) =>
  (MORSEO_CZECH[slug] ?? resolveColor(slug).label).toLocaleLowerCase("cs");

// Značka: MORSEO řada -> "MORSEO", ostatní -> "VAPESPORT".
const brandOf = (cat: string) => (cat === "morseo-evo" ? "MORSEO" : "VAPESPORT");

type FeedProduct = (typeof feedProducts)[number];

const abs = (u?: string) => (!u ? "" : u.startsWith("http") ? u : SITE + u);

const specVal = (p: FeedProduct, needle: string) => {
  if (!Array.isArray(p.specs)) return "";
  const hit = p.specs.find((s: { label: string; value: string }) =>
    s.label.toLowerCase().includes(needle.toLowerCase()),
  );
  return hit?.value ?? "";
};

// Souvislý popis: krátký popis + věta s parametry (rozměry / objem / nosnost).
const buildDescription = (p: FeedProduct) => {
  const base = (p.shortDescription || "").trim();
  const parts: string[] = [];
  const r = specVal(p, "rozměr");
  const o = specVal(p, "objem");
  const n = specVal(p, "nosnost");
  if (r) parts.push(`rozměry ${r}`);
  if (o) parts.push(`objem ${o}`);
  if (n) parts.push(`nosnost ${n}`);
  const paramy = parts.length ? `Parametry: ${parts.join(", ")}.` : "";
  return [base, paramy].filter(Boolean).join(" ").trim();
};

// Fotka konkrétní barvy (obrázek s "barva-<slug>" v názvu), jinak hlavní foto.
const colorImage = (p: FeedProduct, slug: string) => {
  const imgs = Array.isArray(p.images) ? p.images : [];
  const hit = imgs.find((u) => u.toLowerCase().includes(`barva-${slug.toLowerCase()}`));
  return abs(hit || p.image);
};

const kodOf = (p: FeedProduct) =>
  (Array.isArray(p.specs)
    ? p.specs.find((s: { label: string; value: string }) => s.label === "Kód produktu")?.value
    : undefined) || p.id;

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

interface FeedItem {
  id: string;
  groupId: string;
  title: string;
  description: string;
  link: string;
  image: string;
  price: string;
  brand: string;
  gtin: string;
  color: string;
  mpn: string;
  productType: string;
}

function buildItems(): FeedItem[] {
  const items: FeedItem[] = [];
  for (const p of feedProducts) {
    const colors = Array.isArray(p.available_colors) ? p.available_colors : [];
    for (const slug of colors) {
      const gtin = getGtin(p.id, slug);
      if (!gtin) continue; // jen varianty s EANem
      const price = p.price;
      if (price == null) continue;
      const barva = czechColor(slug);
      items.push({
        id: `${p.id}-${slug}`,
        groupId: p.id,
        title: `${p.name} – ${barva}`,
        description: buildDescription(p),
        link: `${SITE}/produkt/${p.id}`,
        image: colorImage(p, slug),
        price: `${Math.round(price)}.00 ${CURRENCY}`,
        brand: brandOf(p.category),
        gtin,
        color: barva,
        mpn: kodOf(p),
        productType: p.categoryLabel || p.category,
      });
    }
  }
  return items;
}

function buildXml(items: FeedItem[]): string {
  const now = new Date().toUTCString();
  const body = items
    .map(
      (it) => `    <item>
      <g:id>${esc(it.id)}</g:id>
      <g:item_group_id>${esc(it.groupId)}</g:item_group_id>
      <g:title>${esc(it.title)}</g:title>
      <g:description>${esc(it.description)}</g:description>
      <g:link>${esc(it.link)}</g:link>
      <g:image_link>${esc(it.image)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:condition>${esc(CONDITION)}</g:condition>
      <g:price>${esc(it.price)}</g:price>
      <g:brand>${esc(it.brand)}</g:brand>
      <g:gtin>${esc(it.gtin)}</g:gtin>
      <g:mpn>${esc(it.mpn)}</g:mpn>
      <g:color>${esc(it.color)}</g:color>
      <g:product_type>${esc(it.productType)}</g:product_type>
      <g:google_product_category>${esc(GOOGLE_CATEGORY)}</g:google_product_category>
      <g:identifier_exists>yes</g:identifier_exists>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>VAPESPORT / MORSEO</title>
    <link>${SITE}</link>
    <description>Cyklobrašny a příslušenství pro e-bike a gravel — česká značka od roku 1994.</description>
    <lastBuildDate>${now}</lastBuildDate>
${body}
  </channel>
</rss>`;
}

// --- handler ---
export default async function handler(_req: unknown, res: any) {
  try {
    const items = buildItems();
    const xml = buildXml(items);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    // CDN cache: čerstvé max hodinu, poté revalidace na pozadí.
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).send(xml);
  } catch (e: any) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(500).send("Feed error: " + String(e?.message || e));
  }
}

// TODO (napojení skladu): až budeš chtít, availability lze počítat z Supabase
// product_overrides (in_stock / color_stock[slug]) místo napevno "in_stock".
// Vyžadovalo by to načíst overrides přes SUPABASE_URL + SUPABASE_SERVICE_KEY
// (stejné env jako send-email) a zohlednit je v buildItems().
