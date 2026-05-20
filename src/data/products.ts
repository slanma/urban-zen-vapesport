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
}

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

export const products: Product[] = feedProducts.filter((product) => product.image.trim().length > 0);

export const resolveProductId = (id?: string) => (id ? legacyProductAliases[id] ?? id : "");

export const getProductById = (id?: string) => {
  const resolvedId = resolveProductId(id);
  return products.find((product) => product.id === resolvedId);
};

export const isMorseoProduct = (product: Product) => MORSEO_PRODUCT_IDS.has(product.id);
