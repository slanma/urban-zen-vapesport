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
  /** Cena není pevná — upřesníme po konzultaci. */
  priceTbd?: boolean;
}

export interface Swatch {
  id: string;
  label: string;
  /** Barva náhledu. U vzorovaných látek je to hlavní tón. */
  hex: string;
  /** Vzor přes barvu (mřížka / tečky). */
  pattern?: "grid" | "dots" | "grid-white";
  /** Výřez ze skutečné fotky látky. */
  img?: string;
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
      { id: "tmave-modra", label: "Tmavě modrá", hex: "#1F3A8A", img: "/images/produkty-vapesport/brasna-na-miru/latky/m1-tmave-modra.webp" },
      { id: "svetle-modra", label: "Světle modrá", hex: "#8DB4DA", img: "/images/produkty-vapesport/brasna-na-miru/latky/m1-svetle-modra.webp" },
      { id: "zluta", label: "Žlutá", hex: "#D9B21E", img: "/images/produkty-vapesport/brasna-na-miru/latky/m1-zluta.webp" },
      { id: "cervena", label: "Červená", hex: "#A51C2E", img: "/images/produkty-vapesport/brasna-na-miru/latky/m1-cervena.webp" },
    ],
  },
  {
    id: "material-2",
    label: "Materiál 2",
    extra: 50,
    colors: [
      { id: "vinova-jemna", label: "Vínová jemná", hex: "#9E1438", img: "/images/produkty-vapesport/brasna-na-miru/latky/m2-vinova-jemna.webp" },
      { id: "kremove-bila", label: "Krémově bílá", hex: "#D9DCD6", img: "/images/produkty-vapesport/brasna-na-miru/latky/m2-kremove-bila.webp" },
    ],
  },
  {
    id: "material-3",
    label: "Materiál 3",
    extra: 50,
    colors: [
      { id: "okrova", label: "Okrová", hex: "#D18A12", img: "/images/produkty-vapesport/brasna-na-miru/latky/m3-okrova.webp" },
      { id: "fialova", label: "Fialová", hex: "#6A2FC4", img: "/images/produkty-vapesport/brasna-na-miru/latky/m3-fialova.webp" },
      { id: "neonove-zelena", label: "Neonově zelená", hex: "#7CF02C", img: "/images/produkty-vapesport/brasna-na-miru/latky/m3-neonove-zelena.webp" },
    ],
  },
  {
    id: "material-4",
    label: "Materiál 4",
    extra: 50,
    colors: [
      { id: "cervena", label: "Červená", hex: "#C8123C", img: "/images/produkty-vapesport/brasna-na-miru/latky/m4-cervena.webp" },
      { id: "tmave-zelena", label: "Tmavě zelená", hex: "#1E403E", img: "/images/produkty-vapesport/brasna-na-miru/latky/m4-tmave-zelena.webp" },
      { id: "oranzova", label: "Oranžová", hex: "#F0661E", img: "/images/produkty-vapesport/brasna-na-miru/latky/m4-oranzova.webp" },
      { id: "modra", label: "Modrá", hex: "#1E40C8", img: "/images/produkty-vapesport/brasna-na-miru/latky/m4-modra.webp" },
      { id: "vinova", label: "Vínová", hex: "#5E1626", img: "/images/produkty-vapesport/brasna-na-miru/latky/m4-vinova.webp" },
      { id: "bezova", label: "Béžová", hex: "#C9C5B4", img: "/images/produkty-vapesport/brasna-na-miru/latky/m4-bezova.webp" },
      { id: "khaki", label: "Khaki", hex: "#4A4C3E", img: "/images/produkty-vapesport/brasna-na-miru/latky/m4-khaki.webp" },
      { id: "cerna", label: "Černá", hex: "#16171B", img: "/images/produkty-vapesport/brasna-na-miru/latky/m4-cerna.webp" },
      { id: "modra-mrizka", label: "Modrá s mřížkou", hex: "#1530B0", img: "/images/produkty-vapesport/brasna-na-miru/latky/m4-modra-mrizka.webp" },
      { id: "cerna-teckovana", label: "Černá tečkovaná", hex: "#111111", img: "/images/produkty-vapesport/brasna-na-miru/latky/m4-cerna-teckovana.webp" },
    ],
  },
  {
    id: "material-5",
    label: "Materiál 5",
    extra: 50,
    colors: [
      { id: "seda-struktura", label: "Šedá struktura", hex: "#7E8790", img: "/images/produkty-vapesport/brasna-na-miru/latky/m5-seda-struktura.webp" },
      { id: "cervena-struktura", label: "Červená struktura", hex: "#C8202E", img: "/images/produkty-vapesport/brasna-na-miru/latky/m5-cervena-struktura.webp" },
      { id: "cerna-ctverecky", label: "Černá se čtverečky", hex: "#202020", img: "/images/produkty-vapesport/brasna-na-miru/latky/m5-cerna-ctverecky.webp" },
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
  { id: "dve-kapsy", label: "Dvě kapsy", extra: 0, priceTbd: true },
];

/** Doplňky — lze víc. Cenu určíme podle rozměrů a složitosti. */
export const EXTRAS: Choice[] = [
  { id: "zip-obe-strany", label: "Zip z obou stran", extra: 0 },
  { id: "pruchod-hadicka", label: "Průchod pro hadičku", extra: 0 },
  { id: "kapsa-telefon", label: "Kapsa na telefon", extra: 0 },
];
