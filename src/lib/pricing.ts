/**
 * Pricing semantics across the eshop:
 *
 *  - `product.price` and `product_overrides.price_override` are RETAIL GROSS
 *    (s DPH 21 %).
 *  - `product_overrides.b2b_price` is WHOLESALE NET (VOC bez DPH) — entered
 *    by admin in the "VOC cena bez DPH" field.
 *
 *  Use `getEffectiveUnitPricing` everywhere we render a price for the cart,
 *  drawer, checkout or product card so the rules stay consistent.
 *
 *  B2B partners additionally have an individual `discount_percent` on their
 *  b2b_profile. The discount is applied to the WHOLESALE (VOC) net price; if
 *  the product has no b2b_price, the discount falls back to the retail gross.
 */

import { VAT_RATE, netFromGross, grossFromNet } from "@/lib/vat";

export interface MinimalProduct {
  price: number; // retail gross
}

export interface MinimalOverride {
  price_override: number | null;
  b2b_price: number | null;
}

export interface UnitPricing {
  /** Unit price WITH VAT (final, after discount). */
  unitGross: number;
  /** Unit price WITHOUT VAT (final, after discount). */
  unitNet: number;
  /** True when the price came from the B2B (VOC) price slot. */
  isB2B: boolean;
  /** Original wholesale NET before discount (for strike-through display). */
  baseB2BNet?: number;
  /** Original retail GROSS before discount (only when fallback retail used). */
  baseRetailGross?: number;
  /** Effective discount percent that was applied (0–100). */
  appliedDiscount: number;
}

/**
 * @param discountPercent Approved B2B partner's discount, 0–100. Ignored when
 * `isPartner` is false.
 */
export const getEffectiveUnitPricing = (
  product: MinimalProduct,
  override: MinimalOverride | null | undefined,
  isPartner: boolean,
  discountPercent: number = 0,
): UnitPricing => {
  const retailGross = override?.price_override ?? product.price;
  const discount = isPartner ? Math.max(0, Math.min(100, discountPercent || 0)) : 0;
  const factor = 1 - discount / 100;

  if (isPartner && override?.b2b_price != null && override.b2b_price > 0) {
    const baseNet = override.b2b_price;
    const net = Math.round(baseNet * factor);
    return {
      unitNet: net,
      unitGross: grossFromNet(net),
      isB2B: true,
      baseB2BNet: baseNet,
      appliedDiscount: discount,
    };
  }

  // Retail fallback. For partners without a VOC price, apply discount to the
  // retail gross so they still get their individual rate.
  if (isPartner && discount > 0) {
    const gross = Math.round(retailGross * factor);
    return {
      unitNet: netFromGross(gross),
      unitGross: gross,
      isB2B: false,
      baseRetailGross: retailGross,
      appliedDiscount: discount,
    };
  }

  return {
    unitNet: netFromGross(retailGross),
    unitGross: retailGross,
    isB2B: false,
    appliedDiscount: 0,
  };
};

export { VAT_RATE };
