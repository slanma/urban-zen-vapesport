// Maps real products from the XML feed to e-bike visual hotspots.
// Hotspot = position on the bike where the bag attaches. "None" = shown only
// in independent category listings, not on the bike illustration.
import { products, type Product } from "./products";

export type Hotspot =
  | "Handlebar"
  | "TopTube"
  | "Frame"
  | "BatteryCover"
  | "UnderSaddle"
  | "RearRack"
  | "None";

export const HOTSPOT_LABELS: Record<Hotspot, string> = {
  Handlebar: "Řídítka",
  TopTube: "Horní rámová trubka",
  Frame: "Rámový trojúhelník",
  BatteryCover: "Kryt baterie",
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

  // ── Frame (Part 2 — Rámové brašny & ochrana) ──────────────────────────────
  {
    productId: "vs-trojuhelnik-sw-914131",
    hotspot: "Frame",
    categories: ["Rámové brašny"],
  },
  {
    productId: "vs-trojuhelnik-elektro-i-904682",
    hotspot: "Frame",
    categories: ["Brašny pro ELEKTROKOLO", "Rámové brašny"],
  },
  {
    productId: "vs-plochy-trojuhelnik-4kapsy-vape-904677", // Plochý trojúhelník 4-ti kapsý
    hotspot: "Frame",
    categories: ["Brašny pro ELEKTROKOLO", "Rámové brašny"],
  },
  {
    productId: "vs-maly-trojuhlenik-3kapsy-904673", // Malý trojúhelník tříkapsý
    hotspot: "Frame",
    categories: ["Rámové brašny"],
  },
  {
    productId: "vs-neoprenovy-obal-938229", // Neopren na míru — kryt baterie
    hotspot: "BatteryCover",
    categories: ["Brašny pro ELEKTROKOLO", "Kryty baterií"],
  },
  {
    productId: "vs-obal-na-tlumic-908656",
    hotspot: "Frame",
    categories: ["Brašny pro ELEKTROKOLO"],
  },

  // ── Handlebar (Part 2) ────────────────────────────────────────────────────
  {
    productId: "vs-obal-na-display-prevoz-elektrokola-943568",
    hotspot: "Handlebar",
    categories: ["Brašny pro ELEKTROKOLO"],
  },

  // ── UnderSaddle (Pod sedlo) ───────────────────────────────────────────────
  {
    productId: "vs-m2-podsedlo-925467",
    hotspot: "UnderSaddle",
    categories: ["Brašny pod sedlo"],
  },
  {
    productId: "vs-podsedlo-mala-spe-904708",
    hotspot: "UnderSaddle",
    categories: ["Brašny pod sedlo"],
  },
  {
    productId: "vs-brasna-pod-sedlo-zralok-twist-904706",
    hotspot: "UnderSaddle",
    categories: ["Brašny pod sedlo"],
  },
  {
    productId: "vs-wasabi-podsedlo-velka-904700",
    hotspot: "UnderSaddle",
    categories: ["Brašny pod sedlo"],
  },

  // ── RearRack (Zadní nosič) ────────────────────────────────────────────────
  {
    productId: "vs-street-bag-922789",
    hotspot: "RearRack",
    categories: ["Brašny na nosič"],
  },
  {
    productId: "vs-vrch-3-brasny-912317",
    hotspot: "RearRack",
    categories: ["Brašny na nosič"],
  },

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
  {
    productId: "vs-taska-na-kolo-905504",
    hotspot: "None",
    categories: ["Doplňky k brašnám"],
  },
  {
    productId: "vs-plastenka-na-trojbrasnu-904712",
    hotspot: "None",
    categories: ["Doplňky k brašnám"],
  },
];

import { productsByBaseId } from "./products";

const byId = new Map(products.map((p) => [p.id, p]));

export const getProductsByHotspot = (hotspot: Hotspot): Product[] =>
  productHotspotEntries
    .filter((e) => e.hotspot === hotspot)
    .flatMap((e) => {
      // MORSEO base ids expand into all 8 color variants; everything else
      // resolves to a single product.
      const variants = productsByBaseId.get(e.productId);
      if (variants && variants.length > 0) return variants;
      const single = byId.get(e.productId);
      return single ? [single] : [];
    });

export const getHotspotForProduct = (productId: string): Hotspot => {
  const e = productHotspotEntries.find((x) => x.productId === productId);
  return e?.hotspot ?? "None";
};

export const getCategoriesForProduct = (productId: string): string[] => {
  const e = productHotspotEntries.find((x) => x.productId === productId);
  return e?.categories ?? [];
};
