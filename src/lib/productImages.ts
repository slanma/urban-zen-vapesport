import type { Product } from "@/data/products";
import type { ProductOverride } from "@/hooks/useProductOverrides";
import { resolveColor } from "@/lib/colorPalette";

/** Malé písmo, bez diakritiky, nealfanumerické znaky → pomlčka. Pro porovnávání v URL. */
const asciiSlug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Vrátí index obrázku v galerii, který odpovídá dané barvě, nebo -1.
 * Hledá barvu v názvu souboru několika způsoby (od nejpřesnějšího):
 *   1) konvence `barva-{slug}-` (např. barva-turquoise-)
 *   2) slug kdekoliv v URL (např. "turquoise", "neon-orange")
 *   3) český label bez diakritiky kdekoliv (např. "tyrkysova", "neonova-oranzova")
 * Záměrně nedělá slepé mapování podle pořadí — to u některých produktů vede k záměně.
 */
export const imageIndexForColor = (gallery: string[], color: string): number => {
  const slug = color.trim().toLowerCase();
  const label = asciiSlug(resolveColor(color).label);
  const needles = [`barva-${slug}-`, slug, label].filter(Boolean);
  const haystacks = gallery.map((src) => {
    let s = src;
    try {
      s = decodeURIComponent(src);
    } catch {
      /* ponech původní */
    }
    return asciiSlug(s);
  });
  for (const needle of needles) {
    const idx = haystacks.findIndex((h) => h.includes(needle));
    if (idx >= 0) return idx;
  }
  return -1;
};

/** Resolve the effective image gallery for a product, preferring admin overrides. */
export const getEffectiveGallery = (
  product: Pick<Product, "image" | "images">,
  override?: Pick<ProductOverride, "images_override"> | null,
): string[] => {
  const adminImgs = (override?.images_override ?? []).filter(Boolean);
  if (adminImgs.length > 0) return adminImgs;
  if (product.images && product.images.length > 0) return product.images;
  return product.image ? [product.image] : [];
};

/** Resolve the primary (card) image for a product. */
export const getPrimaryImage = (
  product: Pick<Product, "image" | "images">,
  override?: Pick<ProductOverride, "images_override"> | null,
): string => getEffectiveGallery(product, override)[0] ?? product.image;
