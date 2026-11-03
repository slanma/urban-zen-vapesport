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
/** Doprava na Slovensko pro síť HUDY (s DPH). */
export const HUDY_SHIPPING_PRICE_SK = 200;
export const HUDY_FREE_SHIPPING_FROM_NET = 10000;

export const isHudyProfile = (p: { segment?: string | null } | null | undefined): boolean =>
  p?.segment === "hudy";

/** Cena dopravy pro Hudy před uplatněním dopravy zdarma (ČR 180 Kč, Slovensko 200 Kč). */
export const hudyOptionPrice = (opt: { id: string; price: number }): number => {
  if (opt.price <= 0) return 0;
  return opt.id === "slovensko" ? HUDY_SHIPPING_PRICE_SK : HUDY_SHIPPING_PRICE;
};

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

/**
 * Má se tomuto zákazníkovi u daného produktu ukázat B2B (VOC) cena?
 * Hudy mají B2B ceny jen u návleků (kategorie "outdoor"). U brašen a
 * ostatního zboží vidí běžnou cenu pro zákazníky, i když jsou přihlášení.
 */
export const usesPartnerPrice = (
  isPartner: boolean,
  profile: { segment?: string | null } | null | undefined,
  category: string | null | undefined,
): boolean => isPartner && !(isHudyProfile(profile) && category !== "outdoor");
