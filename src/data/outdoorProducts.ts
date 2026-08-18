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
 * TEXTY: formulace vycházejí z popisů na starším webu vapesport.cz
 *   (háček za tkaničky, pásek pro seřízení dle typu boty, stahování horního
 *   okraje na gumičku, zip na zadní části, výška 20 cm u běžkového modelu)
 *   a z dodaných fotek. Nic není domyšlené — co nebylo potvrzené, tam není.
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
      "Klasický vysoký návlek z nylonu 210 pro všechna roční období. Chrání nohavici i obuv před blátem, mokrou trávou a sněhem. Velikosti L a XL.",
    problem:
      "V mokré trávě, blátě a sněhu se voda a nečistoty dostanou do boty i pod nohavici. Mokré nohy znamenají chlad a otlaky.",
    funkce:
      "Vysoký střih z nylonu 210. Háček pro zachycení za tkaničky, pásek pro seřízení velikosti podle typu boty a horní okraj stahovaný na gumičku.",
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
      "Lehký dětský návlek z nylonu 210 určený pro všechna roční období. Udrží dětskou botu a nohavici v suchu na výletě, na táboře i cestou do školy.",
    problem:
      "Děti si mokro a bláto najdou vždycky. Promočené boty a nohavice pak ukončí výlet dřív, než měl skončit.",
    funkce:
      "Lehký dětský návlek z nylonu 210. Háček pro zachycení za tkaničky, vrchní vstup, pásek pro seřízení podle typu boty a horní okraj na gumičku.",
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
      "Návlek na běžky z nylonu 210 o výšce 20 cm. Chrání boty proti zapadání sněhu, s háčkem pro upevnění na botu.",
    problem:
      "Při běžkování zapadává sníh do boty přes okraj a taje. Mokrá noha na stopě znamená konec zábavy.",
    funkce:
      "Výška 20 cm, guma v horním i spodním okraji, takže se šířka přizpůsobí botě. Háček pro upevnění na botu drží návlek na místě.",
    pouziti:
      "Běžecké lyžování na upravené stopě i mimo ni, zimní vycházky v hlubším sněhu.",
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
      "Lehký vysoký návlek z nylonu 210 se zipem na zadní části. Nasazení i sundání bez zdlouhavého natahování. Velikosti M, L a XL.",
    problem:
      "Návlek bez zipu se musí natahovat přes celou botu. V dešti nebo v rukavicích je to zdržení.",
    funkce:
      "Zip na zadní části pro rychlé nasazení. Háček pro zachycení za tkaničky, pásek pro seřízení velikosti podle typu boty a horní okraj na gumičku.",
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
      "Vysoký, lehký a voděodolný návlek z materiálu Surftex 5000. Prodyšný a větruvzdorný, se zipem na zadní části. Velikosti M, L a XL.",
    problem:
      "V trvalém dešti a mokrém sněhu potřebujete návlek, který vodu udrží venku a přitom nechá nohu dýchat. Jinak se zapotíte zvnitřku.",
    funkce:
      "Materiál Surftex 5000 — voděodolný, prodyšný a větruvzdorný. Zip na zadní části, háček pro zachycení za tkaničky a pásek pro seřízení podle typu boty.",
    pouziti:
      "Vysokohorská turistika, přechody hřebenů a zimní výstupy — všude, kde je výbava celý den v mokru.",
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
