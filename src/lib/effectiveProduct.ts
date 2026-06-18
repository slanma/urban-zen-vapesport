import type { Product } from "@/data/products";
import type { ProductOverride, SpecRow } from "@/hooks/useProductOverrides";

export const PRODUCT_CODE_LABEL = "Kód produktu";

const specValue = (specs: ReadonlyArray<SpecRow> | undefined | null, label: string) =>
  specs?.find((spec) => spec.label.trim().toLowerCase() === label.toLowerCase())?.value.trim() ?? "";

export const getProductCode = (product: Pick<Product, "specs" | "id">): string =>
  specValue(product.specs, PRODUCT_CODE_LABEL) || product.id;

export const getEffectiveProductCode = (
  product: Pick<Product, "specs" | "id">,
  override?: Pick<ProductOverride, "sku_override" | "specs_override"> | null,
): string =>
  override?.sku_override?.trim() ||
  specValue(override?.specs_override, PRODUCT_CODE_LABEL) ||
  getProductCode(product);

export const withProductCodeSpec = (
  specs: ReadonlyArray<SpecRow>,
  code: string,
): SpecRow[] => {
  const next = specs.map((spec) => ({ ...spec }));
  const index = next.findIndex(
    (spec) => spec.label.trim().toLowerCase() === PRODUCT_CODE_LABEL.toLowerCase(),
  );
  if (index >= 0) {
    next[index] = { ...next[index], value: code };
  } else {
    next.unshift({ label: PRODUCT_CODE_LABEL, value: code });
  }
  return next;
};

export const getSpecsOverrideForSave = (
  product: Pick<Product, "specs" | "id">,
  override: Pick<ProductOverride, "specs_override"> | null | undefined,
  sku: string,
): SpecRow[] => withProductCodeSpec(override?.specs_override ?? product.specs, sku || getProductCode(product));

export const applyProductOverride = (
  product: Product,
  override?: ProductOverride | null,
): Product => {
  if (!override) return product;

  const code = getEffectiveProductCode(product, override);
  const specs = withProductCodeSpec(override.specs_override ?? product.specs, code);

  return {
    ...product,
    name: override.name_override !== null ? override.name_override : product.name,
    categoryLabel: override.category_override !== null ? override.category_override : product.categoryLabel,
    price: override.price_override ?? product.price,
    shortDescription:
      override.short_description_override !== null
        ? override.short_description_override
        : product.shortDescription,
    features: Array.isArray(override.features_override) ? override.features_override : product.features,
    specs,
    available_colors: Array.isArray(override.colors_override)
      ? override.colors_override
      : undefined,
  };
};