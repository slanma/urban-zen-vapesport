/**
 * Brašna na míru — volby konfigurátoru a příplatky (Kč s DPH).
 * Ceny schválené kolegou (říjen 2026). Konečnou cenu potvrzujeme
 * po konzultaci, proto konfigurátor posílá poptávku, ne objednávku.
 */

export const CUSTOM_BAG_ID = "vs-brasna-na-miru-951815";
export const CUSTOM_BAG_BASE_PRICE = 2500;

export interface Choice {
  id: string;
  label: string;
  extra: number;
  hint?: string;
}

export interface Swatch {
  id: string;
  label: string;
  /** Barva náhledu. U vzorovaných látek je to hlavní tón. */
  hex: string;
  /** Vzor přes barvu (mřížka / tečky). */
  pattern?: "grid" | "dots" | "grid-white";
}

/** Krok 1 — kam na kole brašna patří. */
export const PLACES: Choice[] = [
  { id: "ram", label: "Do rámu", extra: 0 },
  { id: "horni-trubka", label: "Na horní trubku", extra: 0 },
  { id: "nosic", label: "Na nosič", extra: 0 },
  { id: "jine", label: "Něco jiného", extra: 0, hint: "Popište nám to dole ve zprávě." },
];

/** Tvar — jen když je brašna do rámu. */
export const FRAME_SHAPES: Choice[] = [
  { id: "cely-trojuhelnik", label: "Celý trojúhelník rámu", extra: 0 },
  { id: "horni-polovina", label: "Horní polovina rámu", extra: 0 },
  { id: "uzka", label: "Úzká, láhve zůstanou", extra: 0 },
  { id: "nevim", label: "Nevím, poraďte mi", extra: 0 },
];

export const BLACK: Swatch = { id: "klasicka-cerna", label: "Klasická černá", hex: "#1F1F1F" };

export interface MaterialGroup {
  id: string;
  label: string;
  extra: number;
  colors: Swatch[];
}

/** Barevné materiály. Celá brašna má jednu barvu z vybrané skupiny. */
export const MATERIAL_GROUPS: MaterialGroup[] = [
  {
    id: "material-1",
    label: "Materiál 1",
    extra: 50,
    colors: [
      { id: "tmave-modra", label: "Tmavě modrá", hex: "#1F3A6B" },
      { id: "svetle-modra", label: "Světle modrá", hex: "#7FB2DE" },
      { id: "zluta", label: "Žlutá", hex: "#E8C34A" },
      { id: "cervena", label: "Červená", hex: "#C8302B" },
    ],
  },
  {
    id: "material-2",
    label: "Materiál 2",
    extra: 50,
    colors: [
      { id: "malinova", label: "Malinová", hex: "#B02A5B" },
      { id: "bezova", label: "Béžová", hex: "#D6C3A3" },
    ],
  },
  {
    id: "material-3",
    label: "Materiál 3",
    extra: 50,
    colors: [
      { id: "horcicova", label: "Hořčicová", hex: "#C99A2E" },
      { id: "fialova", label: "Fialová", hex: "#6A3F8F" },
      { id: "neon-zelena", label: "Neonově zelená", hex: "#9BE23C" },
    ],
  },
  {
    id: "material-4",
    label: "Materiál 4",
    extra: 50,
    colors: [
      { id: "cerna", label: "Černá", hex: "#222222" },
      { id: "cervena", label: "Červená", hex: "#B8312B" },
      { id: "tmave-zelena", label: "Tmavě zelená", hex: "#2F4B36" },
      { id: "oranzova", label: "Oranžová", hex: "#E0702A" },
      { id: "kralovska-modra", label: "Královská modrá", hex: "#2F5EA8" },
      { id: "vinova", label: "Vínová", hex: "#6B2232" },
      { id: "piskova", label: "Písková", hex: "#C9B48A" },
      { id: "olivova", label: "Olivová", hex: "#6B6B3A" },
      { id: "modra-mrizka", label: "Modrá s mřížkou", hex: "#2F5EA8", pattern: "grid" },
      { id: "cerna-tecky", label: "Černá s tečkami", hex: "#222222", pattern: "dots" },
    ],
  },
  {
    id: "material-5",
    label: "Materiál 5",
    extra: 50,
    colors: [
      { id: "seda", label: "Šedá", hex: "#8A8A88" },
      { id: "cervena", label: "Červená", hex: "#B8312B" },
      { id: "cerna-bila-mrizka", label: "Černá s bílou mřížkou", hex: "#222222", pattern: "grid-white" },
    ],
  },
];

export const VELCRO: Choice[] = [
  { id: "klasicky", label: "Klasický", extra: 0 },
  { id: "pogumovany", label: "Pogumovaný", extra: 100, hint: "Lépe drží a nekloužou." },
];

export const ZIP_PLAIN: Choice = { id: "cerny", label: "Černý", extra: 0 };
export const ZIP_WATERPROOF: Choice = { id: "nepromokavy-cerny", label: "Nepromokavý černý", extra: 50 };
export const ZIP_COLORED_ID = "barevny";
export const ZIP_COLORED_EXTRA = 50;

/** Barvy zipů — pořadí podle vzorníku (zdola nahoru). */
export const ZIP_COLORS: Swatch[] = [
  { id: "neon-oranzova", label: "Neon oranžová", hex: "#FF6A1A" },
  { id: "neon-ruzova", label: "Neon růžová", hex: "#FF3EA5" },
  { id: "neon-zluta", label: "Neon žlutá", hex: "#E9F23A" },
  { id: "neon-zelena", label: "Neon zelená", hex: "#4CE04A" },
  { id: "cervena", label: "Červená", hex: "#D22B2B" },
  { id: "oranzova-ktm", label: "Oranžová KTM", hex: "#F47A00" },
  { id: "tmave-tyrkysova", label: "Tmavě tyrkysová", hex: "#0E8C8C" },
  { id: "svetle-tyrkysova", label: "Světle tyrkysová", hex: "#5FD3CF" },
  { id: "seda", label: "Šedá", hex: "#9A9A9A" },
  { id: "modra", label: "Modrá", hex: "#2D6FD2" },
];

export const STIFFENER: Choice[] = [
  { id: "bez", label: "Bez výztuhy", extra: 0 },
  { id: "s-vyztuhou", label: "S výztuhou", extra: 100, hint: "Brašna drží tvar i poloprázdná." },
];

/** Kapsy — jedna možnost. */
export const POCKETS: Choice[] = [
  { id: "jedna-hluboka", label: "Jedna hluboká kapsa", extra: 0 },
  { id: "dve-kapsy", label: "Dvě kapsy", extra: 0 },
];

/** Doplňky — lze víc. Cenu určíme podle rozměrů a složitosti. */
export const EXTRAS: Choice[] = [
  { id: "zip-obe-strany", label: "Zip z obou stran", extra: 0 },
  { id: "pruchod-hadicka", label: "Průchod pro hadičku", extra: 0 },
  { id: "kapsa-telefon", label: "Kapsa na telefon", extra: 0 },
];
