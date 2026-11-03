/**
 * Pravidla pro síť HUDY sport (ceník Hudynavleky_2026, listopad 2026).
 *
 *  - Hudy vidí a objednává v B2B jen návleky (kategorie "outdoor").
 *  - Sleva 10 % se bere z `b2b_profiles.discount_percent` (odečítá se z VOC).
 *  - Dopravné 180 Kč při objednávce pod 10 000 Kč bez DPH, od 10 000 Kč
 *    bez DPH doprava zdarma. Osobní odběr je vždy zdarma.
 *
 * Partnera ze sítě poznáme podle `b2b_profiles.segment = 'hudy'`
 * (nastavuje DB trigger podle domény @hudy.cz / @hudysport.sk).
 */

export const HUDY_SHIPPING_PRICE = 180;
export const HUDY_FREE_SHIPPING_FROM_NET = 10000;

export const isHudyProfile = (p: { segment?: string | null } | null | undefined): boolean =>
  p?.segment === "hudy";

/** Cena dopravy pro Hudy před uplatněním dopravy zdarma. */
export const hudyOptionPrice = (standardPrice: number): number =>
  standardPrice > 0 ? HUDY_SHIPPING_PRICE : 0;

/** True, když má Hudy objednávka dopravu zdarma. */
export const hudyHasFreeShipping = (itemsSubtotalNet: number): boolean =>
  itemsSubtotalNet >= HUDY_FREE_SHIPPING_FROM_NET;

/** Kolik Kč bez DPH chybí do dopravy zdarma. */
export const hudyMissingForFreeShipping = (itemsSubtotalNet: number): number =>
  Math.max(0, HUDY_FREE_SHIPPING_FROM_NET - itemsSubtotalNet);

/** Domény sítě HUDY – registrace z nich se v DB schválí automaticky. */
export const HUDY_EMAIL_DOMAINS = ["@hudy.cz", "@hudysport.sk"] as const;

export const isHudyEmail = (email: string): boolean => {
  const e = email.trim().toLowerCase();
  return HUDY_EMAIL_DOMAINS.some((d) => e.endsWith(d));
};

/**
 * Hudy musí po nastavení hesla vyplnit fakturační údaje (firma, IČO,
 * ulice, město, PSČ). Dokud je nemá, B2B katalog se jim neotevře.
 */
export const hudyNeedsBilling = (
  p: { company_name?: string | null; ico?: string | null; address?: string | null; city?: string | null; zip?: string | null } | null | undefined,
): boolean =>
  !p ||
  !(p.company_name ?? "").trim() ||
  !(p.ico ?? "").trim() ||
  !(p.address ?? "").trim() ||
  !(p.city ?? "").trim() ||
  !(p.zip ?? "").trim();
