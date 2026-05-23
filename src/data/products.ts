import { feedProducts } from "./feedProducts";

export interface Product {
  id: string;
  name: string;
  category: "morseo-evo" | "vape-legends" | "vapesport";
  categoryLabel: string;
  price: number;
  shortDescription: string;
  features: string[];
  specs: { label: string; value: string }[];
  image: string;
  images?: string[];
  /** Color variant name (only set for MORSEO color variants). */
  color?: string;
  /** Original feed id this variant was derived from (only set for variants). */
  baseId?: string;
  /** Base products that ship as a single card with a color picker on PDP. */
  available_colors?: readonly string[];
}

/** Base MORSEO products that render as a single product card with color
 *  swatches on the PDP. ALL MORSEO bases are kept here so we never split
 *  the same bag into per-color rows in the catalogue. Feed generation still
 *  unpacks them into separate XML <ITEM> blocks. */
export const MORSEO_BASE_ONLY_IDS = new Set([
  "vs-ramova-brasna-nepromokavy-zip-945203",
  "vs-ramova-brasna-stredni-se-2-zipy-a-sitkou-945204",
  "vs-brasna-na-mobil-5-5-945205",
  "vs-smb-morseo-945206",
  "vs-waterproof-bike-bag-bila-945208",
  "vs-waterproof-saddle-bag-945209",
  "vs-ramova-brasna-nepromokavy-zip-947097",
  "vs-smb-morseo-zlata-947383",
  "vs-ramova-brasna-nepromokavy-zip-bila-947404",
]);

/** Canonical MORSEO base products from the feed. */
export const MORSEO_PRODUCT_IDS = new Set(MORSEO_BASE_ONLY_IDS);

/** Exact 8 color variants generated for every MORSEO base product. */
export const MORSEO_COLORS = [
  "Černá",
  "Bílá",
  "Neon zelená",
  "Modrá",
  "Růžová",
  "Červená",
  "Zlatá",
  "Neon žlutá",
] as const;
export type MorseoColor = (typeof MORSEO_COLORS)[number];

/** Vape Legends base products that render as a single product card with
 *  color swatches on the PDP. */
export const VAPE_LEGENDS_BASE_ONLY_IDS = new Set([
  "vs-lady-s-mobilem-904681",
  "vs-plochy-trojuhelnik-4kapsy-vape-904677",
  "vs-maly-trojuhlenik-3kapsy-904673",
  "vs-m2-podsedlo-925467",
  "vs-brasna-pod-sedlo-zralok-twist-904706",
  "vs-smb-vapesport-904678",
  "vs-uni-maxi-twist-904687",
]);

/** Vape Legends base products from the feed. */
export const VAPE_LEGENDS_PRODUCT_IDS = new Set(VAPE_LEGENDS_BASE_ONLY_IDS);

/** Exact 9 color variants for Vape Legends base products. */
export const VAPE_LEGENDS_COLORS = [
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
export type VapeLegendsColor = (typeof VAPE_LEGENDS_COLORS)[number];

/** Union of all color names recognized by the search engine. */
export const ALL_COLOR_NAMES: readonly string[] = Array.from(
  new Set<string>([...MORSEO_COLORS, ...VAPE_LEGENDS_COLORS]),
);

export const colorSlug = (c: string) =>
  c
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");

export const legacyProductAliases: Record<string, string> = {
  "morseo-elektro-ii": "vs-ramova-brasna-nepromokavy-zip-947097",
  "morseo-stredni-trojuhelnik": "vs-ramova-brasna-stredni-se-2-zipy-a-sitkou-945204",
  "morseo-smb-xxl": "vs-smb-morseo-zlata-947383",
  "morseo-smb": "vs-smb-morseo-945206",
  "morseo-wdb": "vs-waterproof-bike-bag-bila-945208",
  "velky-trojuhelnik": "vs-plochy-trojuhelnik-4kapsy-vape-904677",
  "brasna-mala-riditka": "vs-brasna-mala-na-riditka-pe-904688",
  "podsedlo-twist": "vs-brasna-pod-sedlo-zralok-twist-904706",
  "neopren-baterie": "vs-neoprenovy-obal-938229",
};

/** Public product catalogue. MORSEO and Vape Legends base entries stay as a
 *  single card with available_colors so the PDP renders a color picker
 *  instead of one card per color. */
export const products: Product[] = feedProducts
  .filter((p) => p.image.trim().length > 0)
  .map((p) => {
    if (MORSEO_BASE_ONLY_IDS.has(p.id)) {
      return { ...p, available_colors: MORSEO_COLORS };
    }
    if (VAPE_LEGENDS_BASE_ONLY_IDS.has(p.id)) {
      return { ...p, available_colors: VAPE_LEGENDS_COLORS };
    }
    return p;
  });

/** Variants keyed by their base id (kept for hotspot/admin compatibility). */
export const productsByBaseId: Map<string, Product[]> = (() => {
  const map = new Map<string, Product[]>();
  for (const p of products) {
    const key = p.baseId ?? p.id;
    const arr = map.get(key) ?? [];
    arr.push(p);
    map.set(key, arr);
  }
  return map;
})();

export const resolveProductId = (id?: string) => {
  if (!id) return "";
  const aliased = legacyProductAliases[id] ?? id;
  // Collapse legacy color-suffixed URLs onto the single base product card.
  for (const baseId of [...MORSEO_BASE_ONLY_IDS, ...VAPE_LEGENDS_BASE_ONLY_IDS]) {
    if (aliased.startsWith(baseId + "-")) return baseId;
  }
  return aliased;
};


export const getProductById = (id?: string) => {
  const resolvedId = resolveProductId(id);
  // Direct (variant) match first
  const direct = products.find((p) => p.id === resolvedId);
  if (direct) return direct;
  // Fallback: if a legacy/base id was requested, return the first variant
  const fromBase = productsByBaseId.get(resolvedId);
  return fromBase?.[0];
};

export const isMorseoProduct = (product: Product) =>
  Boolean(product.color) || MORSEO_PRODUCT_IDS.has(product.baseId ?? product.id);
