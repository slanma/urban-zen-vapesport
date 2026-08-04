/**
 * Jedno místo pro SEO konstanty a skládání absolutních URL.
 * Sdílí PageMeta (statické stránky) i ProductDetail (produkty).
 */
export const SITE = "https://www.vapesport.cz";

export const DEFAULT_TITLE =
  "Vapesport – České cyklobrašny pro e-bike a gravel";

export const DEFAULT_DESCRIPTION =
  "Vapesport – prémiové cyklobrašny a příslušenství pro elektrokola a gravel. Česká značka od roku 1994. B2B velkoobchod i e-shop.";

/** Náhledový obrázek pro sdílení (1200 × 630) – Facebook, Instagram, WhatsApp, X. */
export const DEFAULT_OG_IMAGE = `${SITE}/og/og-default.jpg`;

/** Z relativní cesty („/og/x.jpg", „images/y.png") udělá absolutní URL.
 *  Absolutní adresu (http…) i data URI nechá být. */
export const absoluteUrl = (path: string): string => {
  if (!path) return DEFAULT_OG_IMAGE;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${SITE}${path.startsWith("/") ? "" : "/"}${path}`;
};
