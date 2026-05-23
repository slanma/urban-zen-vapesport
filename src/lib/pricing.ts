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
  /** Unit price WITH VAT. Used for legacy components that want gross. */
  unitGross: number;
  /** Unit price WITHOUT VAT. */
  unitNet: number;
  /** True when the price came from the B2B (VOC) price slot. */
  isB2B: boolean;
}

export const getEffectiveUnitPricing = (
  product: MinimalProduct,
  override: MinimalOverride | null | undefined,
  isPartner: boolean,
): UnitPricing => {
  const retailGross = override?.price_override ?? product.price;

  if (isPartner && override?.b2b_price != null && override.b2b_price > 0) {
    const net = override.b2b_price; // stored as net
    return {
      unitNet: net,
      unitGross: grossFromNet(net),
      isB2B: true,
    };
  }

  return {
    unitNet: netFromGross(retailGross),
    unitGross: retailGross,
    isB2B: false,
  };
};

export { VAT_RATE };
