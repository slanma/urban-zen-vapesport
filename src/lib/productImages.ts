import type { Product } from "@/data/products";
import type { ProductOverride } from "@/hooks/useProductOverrides";

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
