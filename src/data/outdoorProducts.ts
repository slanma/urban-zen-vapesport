/**
 * OUTDOOR — návleky VAPESPORT.
 *
 * Zdroj dat: Hudynavleky_2026.xlsx (velkoobchodní ceník pro síť Hudysport),
 * listy „ceník" a „velikosti", stav k 18. 8. 2026.
 *
 * CENY
 *   price      = doporučená maloobchodní cena S DPH (sloupec „Doporučená MC"),
 *                zaokrouhlená na celé Kč. V ceníku je MC přesně 2× VOC s DPH.
 *   b2b_price  = velkoobchodní cena BEZ DPH (sloupec „bez DPH").
 *   Sleva 10 % pro síť Hudysport NENÍ v ceně — řeší se přes
 *   `discount_percent` na B2B profilu partnera, ne tady.
 *
 * Proč zvláštní soubor a ne feedProducts.ts: ten je AUTO-GENERATED z feedu,
 * ruční zápisy by příští generování smazalo. Do katalogu se produkty
 * přidávají v products.ts (concat).
 *
 * CO JEŠTĚ CHYBÍ (označeno TODO):
 *   • EAN kódy (GS1 prefix 8594182)
 *   • hmotnost a rozměry
 *   • technologie (`features`) — záměrně prázdné, viz komentář níže
 *   • fotky u 4 z 5 produktů
 */
import type { Product } from "./products";

export const OUTDOOR_CATEGORY_LABEL = "NÁVLEKY";

/**
 * Velikostní řady podle listu „velikosti".
 * POZOR: nejsou stejné! „Obyčejný" se dělá jen v L a XL (žádné M),
 * dětský návlek a návlek na běžky jsou jednovelikostní (prázdné pole =
 * na stránce se selektor velikosti vůbec nezobrazí).
 */
export const OUTDOOR_SIZES_BY_ID: Record<string, readonly string[]> = {
  "vs-outdoor-navlek-obycejny-310112": ["L", "XL"],
  "vs-outdoor-navlek-obycejny-detsky-311112": [],
  "vs-outdoor-navlek-na-bezky-211096": [],
  "vs-outdoor-navlek-obycejny-se-zipem-310114": ["M", "L", "XL"],
  "vs-outdoor-navlek-surflex-510114": ["M", "L", "XL"],
};

export const getOutdoorSizes = (id: string): readonly string[] =>
  OUTDOOR_SIZES_BY_ID[id] ?? [];

/**
 * `features` je u všech produktů zatím prázdné. Technologie (RainShield™,
 * 100%HydroGuard™ …) jsou konkrétní tvrzení o výrobku a z ceníku se nedají
 * odvodit — přiřazovat je odhadem by znamenalo psát na web nepravdu.
 * Až potvrdíš, které technologie u kterého návleku platí, doplní se sem.
 */
export const outdoorProducts: Product[] = [
  {
    id: "vs-outdoor-navlek-obycejny-310112",
    name: "Návlek obyčejný",
    category: "outdoor",
    categoryLabel: OUTDOOR_CATEGORY_LABEL,
    price: 682, // MC s DPH 682,44
    b2b_price: 282, // VOC bez DPH
    shortDescription:
      "Klasický vysoký návlek z nylonu 210 pro turistiku a trekking. Chrání nohavici i obuv před blátem, mokrou trávou a sněhem. Velikosti L a XL.",
    problem:
      "V mokré trávě, blátě a snehu se voda a nečistoty dostanou do boty i pod nohavici. Mokré nohy znamenají chlad a otlaky.",
    funkce:
      "Vysoký střih přes lýtko z nylonu 210, stahování v horní části a poutko pod podrážku pro pevné dosednutí na obuv.",
    pouziti:
      "Turistika, trekking a práce venku — kdykoli vede cesta mokrým nebo blátivým terénem.",
    features: [],
    specs: [
      { label: "Kategorie", value: "Návleky" },
      { label: "Kód produktu", value: "310112" },
      { label: "Výrobce", value: "VAPESPORT" },
      { label: "Materiál", value: "Nylon 210" },
      { label: "Velikosti", value: "L, XL" },
      { label: "EAN", value: "TODO" },
      { label: "Hmotnost (pár)", value: "TODO" },
    ],
    /* Fotky dodané 18. 8. 2026. `-card` je čtvercový výřez pro dlaždici,
       `-1` je celá kompozice na podstavci pro detail.
       TODO ověřit, že fotka patří opravdu k tomuto kódu (310112), a ne
       k návleku se zipem nebo Surflexu. */
    image: "/images/outdoor/navlek-obycejny-card.jpg",
    images: [
      "/images/outdoor/navlek-obycejny-card.jpg",
      "/images/outdoor/navlek-obycejny-1.jpg",
    ],
  },

  /* ------------------------------------------------------------------
   * Fotky všech pěti návleků dodány 18. 8. 2026, přiřazení podle zadání:
   * běžky / dětský / se zipem / Surflex. Placeholder už se nikde nepoužívá.
   * ------------------------------------------------------------------ */

  {
    id: "vs-outdoor-navlek-obycejny-detsky-311112",
    name: "Návlek obyčejný dětský",
    category: "outdoor",
    categoryLabel: OUTDOOR_CATEGORY_LABEL,
    price: 557, // MC s DPH 556,60
    b2b_price: 230, // VOC bez DPH
    shortDescription:
      "Dětská verze klasického návleku z nylonu 210. Udrží dětskou botu a nohavici v suchu na výletě, na táboře i cestou do školy. Jednovelikostní.",
    problem:
      "Děti si mokro a bláto najdou vždycky. Promočené boty a nohavice pak ukončí výlet dřív, než měl skončit.",
    funkce:
      "Zmenšený střih klasického návleku z nylonu 210 se stahováním, nasadí se rychle i dětskými prsty.",
    pouziti:
      "Rodinné výlety, tábory a vycházky v mokrém či zasněženém terénu.",
    features: [],
    specs: [
      { label: "Kategorie", value: "Návleky" },
      { label: "Kód produktu", value: "311112" },
      { label: "Výrobce", value: "VAPESPORT" },
      { label: "Materiál", value: "Nylon 210" },
      { label: "Velikosti", value: "Jednovelikostní" },
      { label: "EAN", value: "TODO" },
      { label: "Hmotnost (pár)", value: "TODO" },
    ],
    image: "/images/outdoor/navlek-obycejny-detsky-card.jpg",
    images: ["/images/outdoor/navlek-obycejny-detsky-card.jpg"],
  },

  {
    id: "vs-outdoor-navlek-na-bezky-211096",
    name: "Návlek na běžky",
    category: "outdoor",
    categoryLabel: OUTDOOR_CATEGORY_LABEL,
    price: 416, // MC s DPH 416,24
    b2b_price: 172, // VOC bez DPH
    shortDescription:
      "Nízký návlek na běžky z nylonu 210. Úzký profil nekoliduje s běžeckým vázáním a drží sníh mimo botu. Jednovelikostní.",
    problem:
      "Při běžkování se sníh nabaluje na přechod boty a nohavice, taje a stéká dovnitř. Mokrá noha na stopě znamená konec zábavy.",
    funkce:
      "Úzký nízký střih z nylonu 210, který respektuje běžecké vázání a nepřekáží při odrazu.",
    pouziti:
      "Běžecké lyžování na upravené stopě i mimo ni, zimní vycházky v hlubším snehu.",
    features: [],
    specs: [
      { label: "Kategorie", value: "Návleky" },
      { label: "Kód produktu", value: "211096" },
      { label: "Výrobce", value: "VAPESPORT" },
      { label: "Materiál", value: "Nylon 210" },
      { label: "Velikosti", value: "Jednovelikostní" },
      { label: "EAN", value: "TODO" },
      { label: "Hmotnost (pár)", value: "TODO" },
    ],
    image: "/images/outdoor/navlek-na-bezky-card.jpg",
    images: ["/images/outdoor/navlek-na-bezky-card.jpg"],
  },

  {
    id: "vs-outdoor-navlek-obycejny-se-zipem-310114",
    name: "Návlek obyčejný se zipem",
    category: "outdoor",
    categoryLabel: OUTDOOR_CATEGORY_LABEL,
    price: 762, // MC s DPH 762,30
    b2b_price: 315, // VOC bez DPH
    shortDescription:
      "Vysoký návlek z nylonu 210 se zipem — nasadíte a sundáte ho, aniž byste zouvali botu. Velikosti M, L a XL.",
    problem:
      "Návlek bez zipu se musí natahovat přes celou botu. V dešti, v rukavicích nebo s mačkami na nohou je to zdržení.",
    funkce:
      "Zip po straně umožní nasazení a sundání bez zouvání. Jinak stejný vysoký střih z nylonu 210 jako klasický model.",
    pouziti:
      "Turistika a trekking, kde se počasí mění a návleky se během dne opakovaně nasazují a sundávají.",
    features: [],
    specs: [
      { label: "Kategorie", value: "Návleky" },
      { label: "Kód produktu", value: "310114" },
      { label: "Výrobce", value: "VAPESPORT" },
      { label: "Materiál", value: "Nylon 210" },
      { label: "Velikosti", value: "M, L, XL" },
      { label: "EAN", value: "TODO" },
      { label: "Hmotnost (pár)", value: "TODO" },
    ],
    image: "/images/outdoor/navlek-obycejny-se-zipem-card.jpg",
    images: ["/images/outdoor/navlek-obycejny-se-zipem-card.jpg"],
  },

  {
    id: "vs-outdoor-navlek-surflex-510114",
    name: "Návlek Surflex",
    category: "outdoor",
    categoryLabel: OUTDOOR_CATEGORY_LABEL,
    price: 1016, // MC s DPH 1 016,40
    b2b_price: 420, // VOC bez DPH
    shortDescription:
      "Vrcholný model z materiálu Surftex 5000 pro vysokohorskou turistiku a náročné podmínky. Velikosti M, L a XL.",
    problem:
      "Ve vysokých horách, dlouhém snehu a trvalém dešti dojde běžnému nylonu odolnost. Pak je jedno, jak dobrý je střih.",
    funkce:
      "Materiál Surftex 5000 s vyšší odolností proti vodě a mechanickému oděru než nylon 210, ve stejném vysokém střihu.",
    pouziti:
      "Vysokohorská turistika, přechody hřebenů, zimní výstupy a vše, kde je výbava celý den v mokru.",
    features: [],
    specs: [
      { label: "Kategorie", value: "Návleky" },
      { label: "Kód produktu", value: "510114" },
      { label: "Výrobce", value: "VAPESPORT" },
      { label: "Materiál", value: "Surftex 5000" },
      { label: "Velikosti", value: "M, L, XL" },
      { label: "EAN", value: "TODO" },
      { label: "Hmotnost (pár)", value: "TODO" },
    ],
    image: "/images/outdoor/navlek-surflex-card.jpg",
    images: ["/images/outdoor/navlek-surflex-card.jpg"],
  },
];

/**
 * Použití — editoriální zařazení pro filtr na /outdoor.
 * Není to tvrzení o výrobku, jen navigace pro zákazníka. Jeden návlek
 * může spadat do víc kategorií.
 */
export const OUTDOOR_USE_CASES = [
  { id: "vse", label: "Vše" },
  { id: "turistika", label: "Turistika" },
  { id: "hory", label: "Vysoké hory" },
  { id: "bezky", label: "Běžky" },
  { id: "deti", label: "Děti" },
] as const;

export type OutdoorUseCase = (typeof OUTDOOR_USE_CASES)[number]["id"];

export const OUTDOOR_USE_BY_ID: Record<string, readonly OutdoorUseCase[]> = {
  "vs-outdoor-navlek-obycejny-310112": ["turistika"],
  "vs-outdoor-navlek-obycejny-detsky-311112": ["turistika", "deti"],
  "vs-outdoor-navlek-na-bezky-211096": ["bezky"],
  "vs-outdoor-navlek-obycejny-se-zipem-310114": ["turistika", "hory"],
  "vs-outdoor-navlek-surflex-510114": ["hory", "bezky"],
};

export const matchesUseCase = (id: string, use: OutdoorUseCase): boolean =>
  use === "vse" || (OUTDOOR_USE_BY_ID[id] ?? []).includes(use);

export default outdoorProducts;
