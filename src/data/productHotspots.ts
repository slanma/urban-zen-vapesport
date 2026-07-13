// Maps real products from the feed to e-bike visual hotspots.
// Hotspot = position on the bike where the bag attaches. "None" = shown only
// in independent category listings, not on the bike illustration.
// AKTUALIZOVÁNO dle zařazení produktů od Lucie (pozice na kole).
import { products, type Product } from "./products";

export type Hotspot =
  | "Handlebar"
  | "TopTube"
  | "Frame"
  | "UnderSaddle"
  | "RearRack"
  | "BatteryCover"
  | "None";

export const HOTSPOT_LABELS: Record<Hotspot, string> = {
  Handlebar: "Řídítka",
  TopTube: "Horní trubka",
  Frame: "Rám",
  UnderSaddle: "Pod sedlo",
  RearRack: "Nosič",
  BatteryCover: "Kryty baterie",
  None: "Ostatní kategorie",
};

export interface HotspotEntry {
  productId: string;
  hotspot: Hotspot;
  categories: string[];
}

export const productHotspotEntries: HotspotEntry[] = [

  // ── NOVÉ produkty z podkladu FINAL ─────────────────
  { productId: "vs-velky-trojuhelnik-3kapsy-410002", hotspot: "Frame", categories: ["Rámové brašny"] }, // Velký trojúhelník tříkapsý
  { productId: "vs-podsedlo-twist-zralok-led-410121", hotspot: "UnderSaddle", categories: ["Podsedlové brašny"] }, // Podsedlo Twist žralok LED
  { productId: "vs-obal-na-display-na-miru-210604", hotspot: "Handlebar", categories: ["Brašny pro ELEKTROKOLO"] }, // Obal na display na míru

  // ── Handlebar ──────────────────────────────────────
  { productId: "vs-brasna-mala-na-riditka-pe-904688", hotspot: "Handlebar", categories: ["Brašny pro ELEKTROKOLO", "Brašny na řídítka", "Brašny na KOLOBĚŽKY"] }, // Brašna malá na řidítka PE
  { productId: "vs-klickfix-904710", hotspot: "Handlebar", categories: ["Brašny pro ELEKTROKOLO", "Brašny na KOLOBĚŽKY"] }, // Klickfix
  { productId: "vs-klickfix-bottle-941236", hotspot: "Handlebar", categories: ["Brašny na nosič"] }, // Klickfix bottle
  { productId: "vs-brasna-na-mobil-5-5-945205", hotspot: "Handlebar", categories: ["MORSEOVAPE", "Brašny na řídítka", "Brašny na mobilní telefony", "Brašny na KOLOBĚŽKY"] }, // MORSEO Transformer 5,5\
  { productId: "vs-mobil-5-5-pe-904696", hotspot: "Handlebar", categories: ["Brašny pro ELEKTROKOLO", "Brašny na mobilní telefony", "Brašny na KOLOBĚŽKY"] }, // Mobil 5,5\
  { productId: "vs-obal-na-display-prevoz-elektrokola-943568", hotspot: "Handlebar", categories: ["Brašny pro ELEKTROKOLO"] }, // Obal na display - převoz elektrokola
  { productId: "vs-tablet-7-8-pe-904716", hotspot: "Handlebar", categories: ["Brašny pro ELEKTROKOLO", "Brašny na mobilní telefony", "Brašny na KOLOBĚŽKY"] }, // Tablet 7-8\
  { productId: "vs-uni-maxi-twist-904687", hotspot: "Handlebar", categories: ["Brašny pro ELEKTROKOLO", "Brašny na řídítka", "Brašny na KOLOBĚŽKY"] }, // UNI MAXI TWIST

  // ── TopTube ──────────────────────────────────────
  { productId: "vs-lady-s-mobilem-904681", hotspot: "TopTube", categories: ["Brašny na mobilní telefony"] }, // Lady s mobilem
  { productId: "vs-smb-morseo-945206", hotspot: "TopTube", categories: ["MORSEOVAPE", "Brašny na mobilní telefony"] }, // MORSEO SMB 6,7\
  { productId: "vs-smb-morseo-zlata-947383", hotspot: "TopTube", categories: ["MORSEOVAPE", "Brašny na mobilní telefony"] }, // MORSEO SMB XXL 8\
  { productId: "vs-waterproof-bike-bag-bila-945208", hotspot: "TopTube", categories: ["MORSEOVAPE", "Brašny na mobilní telefony"] }, // MORSEO WDB (voděodolná rámová)
  { productId: "vs-smb-vapesport-904678", hotspot: "TopTube", categories: ["Brašny na mobilní telefony", "Brašny na KOLOBĚŽKY"] }, // SMB Vapesport

  // ── Frame ──────────────────────────────────────
  { productId: "vs-brasna-na-miru-951815", hotspot: "Frame", categories: ["Rámové brašny"] }, // Brašna na míru
  { productId: "vs-elektro-ii-vapesport-904683", hotspot: "Frame", categories: ["Brašny pro ELEKTROKOLO"] }, // Elektro II VAPESPORT
  { productId: "vs-ramova-brasna-nepromokavy-zip-947097", hotspot: "Frame", categories: ["MORSEOVAPE"] }, // MORSEO Elektro II
  { productId: "vs-ramova-brasna-nepromokavy-zip-945203", hotspot: "Frame", categories: ["MORSEOVAPE"] }, // MORSEO Plochý trojúhelník 2-kapsý
  { productId: "vs-ramova-brasna-nepromokavy-zip-bila-947404", hotspot: "Frame", categories: ["MORSEOVAPE"] }, // MORSEO Plochý trojúhelník 2-kapsý FLEXI
  { productId: "vs-ramova-brasna-stredni-se-2-zipy-a-sitkou-945204", hotspot: "Frame", categories: ["MORSEOVAPE"] }, // MORSEO Střední trojúhelník 2-kapsý
  { productId: "vs-maly-trojuhlenik-3kapsy-904673", hotspot: "Frame", categories: ["Rámové brašny"] }, // Malý trojúhleník 3kapsý
  { productId: "vs-plochy-trojuhelnik-4kapsy-vape-904677", hotspot: "Frame", categories: ["Brašny pro ELEKTROKOLO", "Rámové brašny"] }, // Plochý trojúhelník 4kapsý VAPE
  { productId: "vs-trojuhelnik-sw-914131", hotspot: "Frame", categories: ["Rámové brašny"] }, // Trojúhelnik SW
  { productId: "vs-trojuhelnik-elektro-i-904682", hotspot: "Frame", categories: ["Brašny pro ELEKTROKOLO", "Rámové brašny"] }, // Trojúhelník Elektro I

  // ── UnderSaddle ──────────────────────────────────────
  { productId: "vs-brasna-pod-sedlo-zralok-twist-904706", hotspot: "UnderSaddle", categories: ["Brašny pod sedlo"] }, // Brašna pod sedlo žralok TWIST
  { productId: "vs-m2-podsedlo-925467", hotspot: "UnderSaddle", categories: ["Brašny pod sedlo"] }, // M2 podsedlo
  { productId: "vs-waterproof-saddle-bag-945209", hotspot: "UnderSaddle", categories: ["MORSEOVAPE"] }, // MORSEO WDS (voděodolná podsedlová)
  { productId: "vs-podsedlo-mala-spe-904708", hotspot: "UnderSaddle", categories: ["Brašny pod sedlo"] }, // Podsedlo malá SPE

  // ── RearRack ──────────────────────────────────────
  { productId: "vs-vapesport-904698", hotspot: "RearRack", categories: ["Brašny na nosič"] }, // Nosičová brašna
  { productId: "vs-vapesport-904699", hotspot: "RearRack", categories: ["Brašny na nosič"] }, // Nosičová brašna LUX
  { productId: "vs-plastenka-na-trojbrasnu-904712", hotspot: "RearRack", categories: ["Doplňky k brašnám"] }, // Pláštěnka na trojbrašnu
  { productId: "vs-street-bag-922789", hotspot: "RearRack", categories: ["Brašny na nosič"] }, // Street bag
  { productId: "vs-vrch-3-brasny-912317", hotspot: "RearRack", categories: ["Brašny na nosič"] }, // Vrch 3-brašny

  // ── BatteryCover ──────────────────────────────────────
  { productId: "vs-neoprenova-sada-na-prevoz-elektrokola-943570", hotspot: "BatteryCover", categories: ["Brašny pro ELEKTROKOLO"] }, // Neoprenová sada na převoz elektrokola
  { productId: "vs-neoprenovy-obal-938229", hotspot: "BatteryCover", categories: ["Brašny pro ELEKTROKOLO", "Kryty baterií"] }, // Neoprenový obal
  { productId: "vs-obal-na-prevoz-elektrokola-943567", hotspot: "BatteryCover", categories: ["Brašny pro ELEKTROKOLO"] }, // Obal na převoz elektrokola
  { productId: "vs-obal-na-tlumic-908656", hotspot: "BatteryCover", categories: ["Brašny pro ELEKTROKOLO"] }, // Obal na tlumič

  // ── None ──────────────────────────────────────
  { productId: "vs-cyklo-batoh-9l-904713", hotspot: "None", categories: ["Batohy", "Brašny pro ELEKTROKOLO", "Brašny na KOLOBĚŽKY"] }, // Cyklo batoh 9l
  { productId: "vs-taska-na-kolo-905504", hotspot: "None", categories: ["Doplňky k brašnám"] }, // Taška na kolo
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

/**
 * Katalog seskupený podle KATEGORIÍ brašen (ne podle pozice na kole).
 * MORSEOVAPE se jako kategorie nepoužívá – MORSEO má vlastní stránku.
 */
const CATEGORY_ALIASES: Record<string, string> = {
  "Podsedlové brašny": "Brašny pod sedlo", // sjednocení duplicitního názvu
};
const normalizeCategory = (c: string) => CATEGORY_ALIASES[c] ?? c;

/** Vrátí všechny produkty spadající do dané kategorie brašen (MORSEO varianty
 *  se rozbalí; deduplikace na jednu kartu řeší až UI podle baseId). */
export const getProductsByCategory = (category: string): Product[] => {
  const ids = productHotspotEntries
    .filter((e) =>
      e.categories.some((c) => normalizeCategory(c) === category),
    )
    .map((e) => e.productId);

  return ids.flatMap((id) => {
    const variants = productsByBaseId.get(id);
    if (variants && variants.length > 0) return variants;
    const single = byId.get(id);
    return single ? [single] : [];
  });
};
