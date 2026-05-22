// Maps real products from the XML feed to e-bike visual hotspots.
// Hotspot = position on the bike where the bag attaches. "None" = shown only
// in independent category listings, not on the bike illustration.
import { products, type Product } from "./products";

export type Hotspot =
  | "Handlebar"
  | "TopTube"
  | "Frame"
  | "UnderSaddle"
  | "RearRack"
  | "None";

export const HOTSPOT_LABELS: Record<Hotspot, string> = {
  Handlebar: "Řídítka",
  TopTube: "Horní rámová trubka",
  Frame: "Rámový trojúhelník",
  UnderSaddle: "Pod sedlo",
  RearRack: "Zadní nosič",
  None: "Ostatní kategorie",
};

// Each entry: real product id from feedProducts → assigned hotspot + categories.
// Only products that actually exist in the feed are included (no fakes).
export interface HotspotEntry {
  productId: string;
  hotspot: Hotspot;
  categories: string[];
}

export const productHotspotEntries: HotspotEntry[] = [
  // ── Handlebar ─────────────────────────────────────────────────────────────
  {
    productId: "vs-brasna-na-mobil-5-5-945205", // MORSEO Transformer 5,5"
    hotspot: "Handlebar",
    categories: ["MORSEOVAPE", "Brašny na řídítka", "Brašny na mobilní telefony", "Brašny na KOLOBĚŽKY"],
  },
  {
    productId: "vs-brasna-mala-na-riditka-pe-904688",
    hotspot: "Handlebar",
    categories: ["Brašny pro ELEKTROKOLO", "Brašny na řídítka", "Brašny na KOLOBĚŽKY"],
  },
  {
    productId: "vs-uni-maxi-twist-904687",
    hotspot: "Handlebar",
    categories: ["Brašny pro ELEKTROKOLO", "Brašny na řídítka", "Brašny na KOLOBĚŽKY"],
  },
  {
    productId: "vs-klickfix-904710",
    hotspot: "Handlebar",
    categories: ["Brašny pro ELEKTROKOLO", "Brašny na KOLOBĚŽKY"],
  },

  // ── TopTube ───────────────────────────────────────────────────────────────
  {
    productId: "vs-smb-morseo-zlata-947383", // MORSEO SMB XXL 8"
    hotspot: "TopTube",
    categories: ["MORSEOVAPE", "Brašny na mobilní telefony"],
  },
  {
    productId: "vs-smb-morseo-945206", // MORSEO SMB 6,7"
    hotspot: "TopTube",
    categories: ["MORSEOVAPE", "Brašny na mobilní telefony"],
  },
  {
    productId: "vs-waterproof-bike-bag-bila-945208", // MORSEO WDB
    hotspot: "TopTube",
    categories: ["MORSEOVAPE", "Brašny na mobilní telefony"],
  },
  {
    productId: "vs-waterproof-saddle-bag-945209", // MORSEO WDS
    hotspot: "TopTube",
    categories: ["MORSEOVAPE"],
  },
  {
    productId: "vs-mobil-5-5-pe-904696",
    hotspot: "TopTube",
    categories: ["Brašny pro ELEKTROKOLO", "Brašny na mobilní telefony", "Brašny na KOLOBĚŽKY"],
  },
  {
    productId: "vs-tablet-7-8-pe-904716",
    hotspot: "TopTube",
    categories: ["Brašny pro ELEKTROKOLO", "Brašny na mobilní telefony", "Brašny na KOLOBĚŽKY"],
  },
  {
    productId: "vs-smb-vapesport-904678",
    hotspot: "TopTube",
    categories: ["Brašny na mobilní telefony", "Brašny na KOLOBĚŽKY"],
  },
  {
    productId: "vs-lady-s-mobilem-904681",
    hotspot: "TopTube",
    categories: ["Brašny na mobilní telefony"],
  },

  // ── Frame ─────────────────────────────────────────────────────────────────
  {
    productId: "vs-ramova-brasna-stredni-se-2-zipy-a-sitkou-945204", // MORSEO Střední trojúhelník 2kapsy
    hotspot: "Frame",
    categories: ["MORSEOVAPE"],
  },
  {
    productId: "vs-ramova-brasna-nepromokavy-zip-947097", // MORSEO Elektro II
    hotspot: "Frame",
    categories: ["MORSEOVAPE"],
  },
  {
    productId: "vs-elektro-ii-vapesport-904683", // Trojúhelník Elektro II
    hotspot: "Frame",
    categories: ["Brašny pro ELEKTROKOLO"],
  },

  // ── RearRack ──────────────────────────────────────────────────────────────
  // (Currently no matching "Brašna na nosič" products exist in the feed —
  //  intentionally left empty rather than fabricating fake products.)

  // ── None (independent categories only) ────────────────────────────────────
  {
    productId: "vs-cyklo-batoh-9l-904713",
    hotspot: "None",
    categories: ["Batohy", "Brašny pro ELEKTROKOLO", "Brašny na KOLOBĚŽKY"],
  },
  {
    productId: "vs-mini-sportovni-ledvinka-944096",
    hotspot: "None",
    categories: ["Brašny na mobilní telefony"],
  },
];

const byId = new Map(products.map((p) => [p.id, p]));

export const getProductsByHotspot = (hotspot: Hotspot): Product[] =>
  productHotspotEntries
    .filter((e) => e.hotspot === hotspot)
    .map((e) => byId.get(e.productId))
    .filter((p): p is Product => Boolean(p));

export const getHotspotForProduct = (productId: string): Hotspot => {
  const e = productHotspotEntries.find((x) => x.productId === productId);
  return e?.hotspot ?? "None";
};

export const getCategoriesForProduct = (productId: string): string[] => {
  const e = productHotspotEntries.find((x) => x.productId === productId);
  return e?.categories ?? [];
};
