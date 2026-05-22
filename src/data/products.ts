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

/** Base MORSEO products that are NOT expanded into per-color rows. They
 *  render as a single product card and expose color swatches on the PDP.
 *  Feed generation still unpacks them into separate XML <ITEM> blocks. */
export const MORSEO_BASE_ONLY_IDS = new Set([
  "vs-brasna-na-mobil-5-5-945205",
]);

/** Canonical MORSEO base products from the feed. Each is exploded into the 8
 *  color variants defined in `MORSEO_COLORS`. */
export const MORSEO_PRODUCT_IDS = new Set([
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

/** Vape Legends base products from the feed that get the 9-color expansion. */
export const VAPE_LEGENDS_PRODUCT_IDS = new Set([
  "vs-lady-s-mobilem-904681",
  "vs-plochy-trojuhelnik-4kapsy-vape-904677",
  "vs-maly-trojuhlenik-3kapsy-904673",
  "vs-m2-podsedlo-925467",
  "vs-brasna-pod-sedlo-zralok-twist-904706",
  "vs-smb-vapesport-904678",
  "vs-uni-maxi-twist-904687",
]);

/** Exact 9 color variants generated for every Vape Legends base product. */
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

const isMorseoBase = (p: Product) => MORSEO_PRODUCT_IDS.has(p.id);
const isVapeLegendsBase = (p: Product) => VAPE_LEGENDS_PRODUCT_IDS.has(p.id);

const expandColors = (p: Product, colors: readonly string[]): Product[] =>
  colors.map((color) => ({
    ...p,
    id: `${p.id}-${colorSlug(color)}`,
    name: `${p.name} - ${color}`,
    color,
    baseId: p.id,
    specs: [
      ...p.specs.filter((s) => s.label !== "Barva"),
      { label: "Barva", value: color },
    ],
  }));

/** Public product catalogue. MORSEO and Vape Legends base entries are replaced
 *  by their color variants so each color appears as a distinct item. */
export const products: Product[] = feedProducts
  .filter((p) => p.image.trim().length > 0)
  .flatMap((p) => {
    if (isMorseoBase(p)) return expandColors(p, MORSEO_COLORS);
    if (isVapeLegendsBase(p)) return expandColors(p, VAPE_LEGENDS_COLORS);
    return [p];
  });

/** Variants keyed by their MORSEO base id, for hotspot expansion. */
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

export const resolveProductId = (id?: string) => (id ? legacyProductAliases[id] ?? id : "");

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
