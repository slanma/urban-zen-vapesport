/**
 * Shared color palette used by both the admin product editor and the
 * storefront (PDP, B2B catalogue, cart). The admin persists `slug` values
 * into `product_overrides.colors_override`; the storefront resolves them
 * back to a human label + hex swatch via `resolveColor`.
 */
export interface ColorOption {
  /** Stable identifier persisted in the database. */
  slug: string;
  /** Czech display label. */
  label: string;
  /** Swatch color. */
  hex: string;
}

export const COLOR_PALETTE: ReadonlyArray<ColorOption> = [
  { slug: "white",          label: "Bílá",              hex: "#FFFFFF" },
  { slug: "grey",           label: "Šedá",              hex: "#8A8A8A" },
  { slug: "black",          label: "Černá",             hex: "#111111" },
  { slug: "neon-green",     label: "Neonová zelená",    hex: "#39FF14" },
  { slug: "neon-yellow",    label: "Neonová žlutá",     hex: "#D7FF1A" },
  { slug: "yellow",         label: "Žlutá",             hex: "#FFD400" },
  { slug: "gold",           label: "Zlatá",             hex: "#C9A227" },
  { slug: "orange",         label: "Oranžová",          hex: "#FF8A00" },
  { slug: "neon-orange",    label: "Neonová oranžová",  hex: "#FF6A1A" },
  { slug: "red",            label: "Červená",           hex: "#D7263D" },
  { slug: "neon-red",       label: "Neonová červená",   hex: "#FF1744" },
  { slug: "pink",           label: "Růžová",            hex: "#FF4FA3" },
  { slug: "blue",           label: "Modrá",             hex: "#1E66FF" },
  { slug: "turquoise",      label: "Tyrkysová",         hex: "#1ED6C2" },
  { slug: "dark-turquoise", label: "Tmavě tyrkysová",   hex: "#0E8C82" },
  // ── MORSEO (marketingové názvy) – hexy doladit z produktových fotek ──
  { slug: "coral-code",       label: "Coral Code",       hex: "#E35C40" },
  { slug: "arctic-white",     label: "Arctic White",     hex: "#E0E4E4" },
  { slug: "flamingo-luxe",    label: "Flamingo Luxe",    hex: "#FD2ED3" },
  { slug: "dandelite-yellow", label: "Dandelite Yellow", hex: "#EEF80E" },
  { slug: "lime-spark",       label: "Lime Spark",       hex: "#A3F34A" },
  { slug: "lazurite-blue",    label: "Lazurite Blue",    hex: "#3A8AE1" },
  { slug: "golden-wheat",     label: "Golden Wheat",     hex: "#FDCE5C" },
  { slug: "blackout-g",       label: "Blackout G.",      hex: "#858A8A" },
] as const;

const BY_SLUG = new Map(COLOR_PALETTE.map((c) => [c.slug.toLowerCase(), c]));
const BY_LABEL = new Map(COLOR_PALETTE.map((c) => [c.label.toLowerCase(), c]));

/** Resolve a stored token (slug OR legacy label) into a display option. */
export const resolveColor = (token: string): ColorOption => {
  const key = token.trim().toLowerCase();
  return (
    BY_SLUG.get(key) ??
    BY_LABEL.get(key) ?? {
      slug: token,
      label: token,
      hex: "#CCCCCC",
    }
  );
};
