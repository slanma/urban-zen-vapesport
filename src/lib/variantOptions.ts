import type { Product } from "@/data/products";
import type { ProductOverride } from "@/hooks/useProductOverrides";
import {
  getOutdoorSizes,
  getOutdoorVariantLabel,
  getOutdoorVariantLabelPlural,
} from "@/data/outdoorProducts";

/**
 * Varianty produktu na jednom místě.
 *
 * Proč to vzniklo: katalog brašen má varianty barevné, návleky (kategorie
 * „outdoor") velikostní. Košík, pokladna i objednávky mají jediný variantní
 * klíč — pole `color` — a ten je odladěný, takže velikosti jím jdou taky.
 * Chybělo jen jedno místo, kde se rozhodne, CO je pro daný produkt varianta,
 * a jak se to má pojmenovat v UI.
 *
 * Pořadí priorit odpovídá zbytku aplikace:
 *   1) colors_override z administrace (ruční nastavení vždy vyhrává)
 *   2) velikostní řada u outdoor produktů
 *   3) available_colors z katalogu
 */
export const getVariantValues = (
  product: Pick<Product, "id" | "category" | "available_colors">,
  override?: Pick<ProductOverride, "colors_override"> | null,
): readonly string[] => {
  const fromAdmin = override?.colors_override;
  if (Array.isArray(fromAdmin) && fromAdmin.length > 0) return fromAdmin;

  if (product.category === "outdoor") {
    const sizes = getOutdoorSizes(product.id);
    if (sizes.length > 0) return sizes;
    /* Jednovelikostní návlek (dětský, běžkový) — žádná varianta. */
    return [];
  }

  return product.available_colors ?? [];
};

/** True u produktů, jejichž varianta je velikost, ne barva. */
export const isSizeVariant = (
  product: Pick<Product, "category">,
): boolean => product.category === "outdoor";

/** Popisek varianty do UI — jednotné číslo. U outdoor produktů se liší
 *  podle kusu: konfekce má „Velikost", zakázková výroba „Materiál". */
export const variantLabel = (
  product: Pick<Product, "id" | "category">,
): string =>
  isSizeVariant(product) ? getOutdoorVariantLabel(product.id) : "Barva";

/** Popisek varianty do UI — množné číslo (nadpisy, aria-label). */
export const variantLabelPlural = (
  product: Pick<Product, "id" | "category">,
): string =>
  isSizeVariant(product) ? getOutdoorVariantLabelPlural(product.id) : "Barvy";
