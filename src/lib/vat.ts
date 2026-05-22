/** VAT helpers. All catalog prices in this project are stored *with* VAT
 *  (Czech standard 21%). These helpers do the rounded conversions used
 *  across the cart, checkout and order summary. */

export const VAT_RATE = 0.21;

export const fmtCZK = (n: number): string =>
  `${Math.round(n).toLocaleString("cs-CZ")} Kč`;

/** Strip VAT from a gross (with-VAT) price. */
export const netFromGross = (gross: number): number => gross / (1 + VAT_RATE);

/** Add VAT to a net (without-VAT) price. */
export const grossFromNet = (net: number): number => net * (1 + VAT_RATE);

/** Just the VAT portion of a gross price. */
export const vatOfGross = (gross: number): number =>
  gross - netFromGross(gross);
