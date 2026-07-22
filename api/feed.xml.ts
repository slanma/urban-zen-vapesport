// api/feed.xml.ts
// Marketingový produktový feed pro Google Shopping / Meta (Facebook & Instagram).
// Běží na https://www.vapesport.cz/api/feed.xml (Vercel serverless funkce, /api).
//
// Formát: RSS 2.0 s namespacem g: (http://base.google.com/ns/1.0) — Google Merchant
// Center i Meta Commerce Manager čtou stejný formát. Jeden <item> = jedna barevná
// varianta; varianty téhož produktu spojuje item_group_id.
//
// POZOR: data produktů jsou VLOŽENÁ přímo zde (snapshot z feedProducts.ts + productGtins.ts
// k datu 2026-07-22). Důvod: Vercel serverless funkce spolehlivě nenaimportuje moduly
// ze složky ../src, proto je feed soběstačný. Když se změní ceny/barvy/EANy produktů
// s GTINem, aktualizuj pole PRODUCTS níže (stačí přegenerovat ze stejných zdrojů).
//
// Do feedu jdou jen varianty s EANem (30 ks: Plochý, Střední, Transformer base+bílá,
// Elektro II, SMB XXL 8"). Produkty bez GTINu tím vypadnou — přesně jak chceme.

const SITE = "https://www.vapesport.cz";
const CONDITION = "new";
const CURRENCY = "CZK";
const GOOGLE_CATEGORY = "Sporting Goods > Outdoor Recreation > Cycling > Bicycle Bags & Panniers";

// MORSEO marketingové slugy -> prostá čeština (malými písmeny).
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
  (MORSEO_CZECH[slug] ?? slug).toLocaleLowerCase("cs");

const brandOf = (cat: string) => (cat === "morseo-evo" ? "MORSEO" : "VAPESPORT");

interface SnapColor { slug: string; gtin: string; image: string; }
interface SnapProduct {
  id: string; name: string; category: string; categoryLabel: string;
  price: number; kod: string; shortDescription: string;
  rozmery: string; objem: string; nosnost: string; colors: SnapColor[];
}

// --- VLOŽENÁ DATA (snapshot 2026-07-22) --------------------------------
const PRODUCTS: SnapProduct[] = [
  {
    "id": "vs-ramova-brasna-nepromokavy-zip-945203",
    "name": "MORSEO Plochý trojúhelník 2-kapsý",
    "category": "morseo-evo",
    "categoryLabel": "BRAŠNY NA KOLO",
    "price": 619,
    "kod": "M311055",
    "shortDescription": "Kompaktní rámová brašna s nízkým profilem a šířkou pouhých 6 cm – ideální na menší a dámské rámy, kde velká brašna nesedí. Silikonové pásky drží pevně a chrání lak.",
    "rozmery": "25 × 6 × 16 cm",
    "objem": "0,8 l",
    "nosnost": "0,8 kg",
    "colors": [
      {
        "slug": "blackout-g",
        "gtin": "8594182511253",
        "image": "/images/produkty-morseo/plochy-2k-morseo/barva-blackout-g-seda.png"
      },
      {
        "slug": "arctic-white",
        "gtin": "8594182511321",
        "image": "/images/produkty-morseo/plochy-2k-morseo/barva-arctic-white-bila.png"
      },
      {
        "slug": "coral-code",
        "gtin": "8594182511260",
        "image": "/images/produkty-morseo/plochy-2k-morseo/barva-coral-code-cervena.png"
      },
      {
        "slug": "flamingo-luxe",
        "gtin": "8594182511307",
        "image": "/images/produkty-morseo/plochy-2k-morseo/barva-flamingo-luxe-ruzova.png"
      },
      {
        "slug": "dandelite-yellow",
        "gtin": "8594182511284",
        "image": "/images/produkty-morseo/plochy-2k-morseo/barva-dandelite-yellow-zluta.png"
      },
      {
        "slug": "lime-spark",
        "gtin": "8594182511291",
        "image": "/images/produkty-morseo/plochy-2k-morseo/barva-lime-spark-zelena.png"
      },
      {
        "slug": "lazurite-blue",
        "gtin": "8594182511277",
        "image": "/images/produkty-morseo/plochy-2k-morseo/barva-lazurite-blue-modra.png"
      },
      {
        "slug": "golden-wheat",
        "gtin": "8594182511314",
        "image": "/images/produkty-morseo/plochy-2k-morseo/barva-golden-wheat-zlata.png"
      }
    ]
  },
  {
    "id": "vs-ramova-brasna-stredni-se-2-zipy-a-sitkou-945204",
    "name": "MORSEO Střední trojúhelník 2-kapsý",
    "category": "morseo-evo",
    "categoryLabel": "BRAŠNY NA KOLO",
    "price": 640,
    "kod": "M410102",
    "shortDescription": "Největší rámovka do e-kola – pobere rychlonabíječku Fast Charger i bidon. Šířka 7,5 cm neodírá stehna, upne se dopředu i dozadu.",
    "rozmery": "35 × 7,5 × 18,5 cm",
    "objem": "2 l",
    "nosnost": "1,4 kg",
    "colors": [
      {
        "slug": "blackout-g",
        "gtin": "8594182511338",
        "image": "/images/produkty-morseo/stredni-2k-morseo/barva-blackout-g-seda.png"
      },
      {
        "slug": "arctic-white",
        "gtin": "8594182511406",
        "image": "/images/produkty-morseo/stredni-2k-morseo/barva-arctic-white-bila.png"
      },
      {
        "slug": "flamingo-luxe",
        "gtin": "8594182511383",
        "image": "/images/produkty-morseo/stredni-2k-morseo/barva-flamingo-luxe-ruzova.png"
      },
      {
        "slug": "lime-spark",
        "gtin": "8594182511376",
        "image": "/images/produkty-morseo/stredni-2k-morseo/barva-lime-spark-zelena.jpeg"
      },
      {
        "slug": "golden-wheat",
        "gtin": "8594182511390",
        "image": "/images/produkty-morseo/stredni-2k-morseo/barva-golden-wheat-zlata.png"
      }
    ]
  },
  {
    "id": "vs-brasna-na-mobil-5-5-945205",
    "name": "MORSEO Transformer 5,5\"",
    "category": "morseo-evo",
    "categoryLabel": "BRAŠNY NA KOLO",
    "price": 531,
    "kod": "M411104",
    "shortDescription": "Svislá brašna na řídítka a představec pro e-kola s ovládáním na horní trubce a bez displeje uprostřed. Dotyková fólie 16,5 × 9 cm – navigace za jízdy. Tenký profil nepřekáží.",
    "rozmery": "18 × 10 × 4 cm",
    "objem": "0,8 l",
    "nosnost": "0,8 kg",
    "colors": [
      {
        "slug": "blackout-g",
        "gtin": "8594182511574",
        "image": "/images/produkty-morseo/transformer-morseo/barva-blackout-g-seda.jpeg"
      },
      {
        "slug": "arctic-white",
        "gtin": "8594182511581",
        "image": "/images/produkty-morseo/transformer-morseo/barva-arctic-white-bila.jpeg"
      }
    ]
  },
  {
    "id": "vs-ramova-brasna-nepromokavy-zip-947097",
    "name": "MORSEO Elektro II",
    "category": "morseo-evo",
    "categoryLabel": "RÁMOVÉ BRAŠNY",
    "price": 620,
    "kod": "M410006",
    "shortDescription": "Rámová brašna na elektrokolo, do které se pohodlně vejde i těžká nabíječka Bosch nebo Yamaha. Díky úzkému profilu (6–7 cm) se schová do prostoru nad integrovanou baterií a nepřekáží při šlapání. Prodloužené silikonové pásky drží pevně a chrání lak před podřením.",
    "rozmery": "24 × 6 × 20 cm",
    "objem": "2,5 l",
    "nosnost": "2 kg",
    "colors": [
      {
        "slug": "coral-code",
        "gtin": "8594182511505",
        "image": "/images/produkty-morseo/elektro-ii-morseo/barva-coral-code-cervena.png"
      },
      {
        "slug": "arctic-white",
        "gtin": "8594182511567",
        "image": "/images/produkty-morseo/elektro-ii-morseo/barva-arctic-white-bila.png"
      },
      {
        "slug": "flamingo-luxe",
        "gtin": "8594182511543",
        "image": "/images/produkty-morseo/elektro-ii-morseo/barva-flamingo-luxe-ruzova.png"
      },
      {
        "slug": "dandelite-yellow",
        "gtin": "8594182511529",
        "image": "/images/produkty-morseo/elektro-ii-morseo/barva-dandelite-yellow-zluta.png"
      },
      {
        "slug": "lime-spark",
        "gtin": "8594182511536",
        "image": "/images/produkty-morseo/elektro-ii-morseo/barva-lime-spark-zelena.png"
      },
      {
        "slug": "lazurite-blue",
        "gtin": "8594182511512",
        "image": "/images/produkty-morseo/elektro-ii-morseo/barva-lazurite-blue-modra.png"
      },
      {
        "slug": "golden-wheat",
        "gtin": "8594182511550",
        "image": "/images/produkty-morseo/elektro-ii-morseo/barva-golden-wheat-zlata.png"
      }
    ]
  },
  {
    "id": "vs-smb-morseo-zlata-947383",
    "name": "MORSEO SMB XXL 8\"",
    "category": "morseo-evo",
    "categoryLabel": "BRAŠNY NA KOLO",
    "price": 640,
    "kod": "M310073-1",
    "shortDescription": "Velká brašna na horní trubku e-biku. Vejde se i ten největší telefon v krytu (iPhone Pro Max, Galaxy Ultra), powerbanka i svačina. Přes slídu 10 × 19 cm ovládáš telefon bez vyndávání. Pásky drží jako přibité a nepodřou lak.",
    "rozmery": "20 × 8 × 8–5 cm",
    "objem": "1,2 l",
    "nosnost": "0,5 kg",
    "colors": [
      {
        "slug": "blackout-g",
        "gtin": "8594182511413",
        "image": "/images/produkty-morseo/smb-xxl/barva-blackout-g-seda.png"
      },
      {
        "slug": "arctic-white",
        "gtin": "8594182511482",
        "image": "/images/produkty-morseo/smb-xxl/barva-arctic-white-bila.png"
      },
      {
        "slug": "coral-code",
        "gtin": "8594182511420",
        "image": "/images/produkty-morseo/smb-xxl/barva-coral-code-cervena.png"
      },
      {
        "slug": "flamingo-luxe",
        "gtin": "8594182511468",
        "image": "/images/produkty-morseo/smb-xxl/barva-flamingo-luxe-ruzova.png"
      },
      {
        "slug": "dandelite-yellow",
        "gtin": "8594182511444",
        "image": "/images/produkty-morseo/smb-xxl/barva-dandelite-yellow-zluta.png"
      },
      {
        "slug": "lime-spark",
        "gtin": "8594182511451",
        "image": "/images/produkty-morseo/smb-xxl/barva-lime-spark-zelena.png"
      },
      {
        "slug": "lazurite-blue",
        "gtin": "8594182511437",
        "image": "/images/produkty-morseo/smb-xxl/barva-lazurite-blue-modra.png"
      },
      {
        "slug": "golden-wheat",
        "gtin": "8594182511475",
        "image": "/images/produkty-morseo/smb-xxl/barva-golden-wheat-zlata.png"
      }
    ]
  }
];

const abs = (u: string) => (!u ? "" : u.startsWith("http") ? u : SITE + u);

const buildDescription = (p: SnapProduct) => {
  const base = (p.shortDescription || "").trim();
  const parts: string[] = [];
  if (p.rozmery) parts.push(`rozměry ${p.rozmery}`);
  if (p.objem) parts.push(`objem ${p.objem}`);
  if (p.nosnost) parts.push(`nosnost ${p.nosnost}`);
  const paramy = parts.length ? `Parametry: ${parts.join(", ")}.` : "";
  return [base, paramy].filter(Boolean).join(" ").trim();
};

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

function buildXml(): string {
  const now = new Date().toUTCString();
  const items: string[] = [];
  for (const p of PRODUCTS) {
    if (p.price == null) continue;
    const desc = buildDescription(p);
    const brand = brandOf(p.category);
    const price = `${Math.round(p.price)}.00 ${CURRENCY}`;
    for (const c of p.colors) {
      const barva = czechColor(c.slug);
      items.push(`    <item>
      <g:id>${esc(p.kod + "-" + c.slug)}</g:id>
      <g:item_group_id>${esc(p.id)}</g:item_group_id>
      <g:title>${esc(p.name + " – " + barva)}</g:title>
      <g:description>${esc(desc)}</g:description>
      <g:link>${esc(SITE + "/produkt/" + p.id)}</g:link>
      <g:image_link>${esc(abs(c.image))}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:condition>${esc(CONDITION)}</g:condition>
      <g:price>${esc(price)}</g:price>
      <g:brand>${esc(brand)}</g:brand>
      <g:gtin>${esc(c.gtin)}</g:gtin>
      <g:mpn>${esc(p.kod)}</g:mpn>
      <g:color>${esc(barva)}</g:color>
      <g:product_type>${esc(p.categoryLabel)}</g:product_type>
      <g:google_product_category>${esc(GOOGLE_CATEGORY)}</g:google_product_category>
      <g:identifier_exists>yes</g:identifier_exists>
    </item>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>VAPESPORT / MORSEO</title>
    <link>${SITE}</link>
    <description>Cyklobrašny a příslušenství pro e-bike a gravel — česká značka od roku 1994.</description>
    <lastBuildDate>${now}</lastBuildDate>
${items.join("\n")}
  </channel>
</rss>`;
}

export default function handler(_req: unknown, res: any) {
  try {
    const xml = buildXml();
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).send(xml);
  } catch (e: any) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(500).send("Feed error: " + String(e?.message || e));
  }
}
