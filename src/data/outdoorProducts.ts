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
 * Návlek na míru ZÁMĚRNĚ NENÍ katalogový produkt.
 *
 * Cena je „od" a finální se určí až podle rozměrů, takže objednávka za fixní
 * částku by zavazovala k ceně, kterou ještě nikdo nespočítal. Řeší se proto
 * poptávkou (sekce na /outdoor → /api/poptavka → Admin → Poptávky).
 * Zároveň tím nespadne do B2B matice, kde by ho partner mohl naskládat
 * do objednávky po kusech.
 */
export const CUSTOM_GAITER = {
  title: "Návlek na míru",
  subtitle: "Zakázková výroba",
  /** Výchozí cena bez DPH; s DPH se dopočítá přes grossFromNet. */
  fromNet: 1000,
  materials: ["Nylon 210", "Surftex 5000"] as const,
  problem:
    "Běžná konfekce nesedí každému. Širší či asymetrická lýtka, nošení ortéz nebo robustní expediční boty často způsobují, že standardní návleky škrtí, nejdou dopnout, nebo naopak sjíždějí a propouštějí vlhkost.",
  funkce:
    "Úprava střihu, výšky i obvodu přesně podle vašich parametrů. Volba materiálu (nepromokavý Nylon 210 nebo prodyšný Surftex 5000), zapínání na míru (se zipem i bez), individuální délka podvlekového popruhu a přesné umístění fixačního háčku.",
  pouziti:
    "Turisté s nekonfekčními proporcemi, uživatelé zdravotních pomůcek/ortéz, majitelé masivní obuvi a všichni, kdo vyžadují 100% padnoucí vybavení bez kompromisů.",
  popis:
    "Protože máme celou výrobu pod vlastní střechou v Ostravě, nejsme vázáni pouze na tabulkové velikosti. Stačí nám poslat obvod lýtka, výšku a typ obuvi – ušijeme vám návleky, které budou sedět na milimetr přesně.",
  image: "/images/outdoor/navlek-na-miru-card.jpg",
} as const;

/**
 * Varianty jednotlivých návleků.
 *
 * Velikostní řady podle listu „velikosti" v ceníku — POZOR, nejsou stejné!
 * „Obyčejný" se dělá jen v L a XL (žádné M), dětský a běžkový jsou
 * jednovelikostní (prázdné pole = selektor se vůbec nezobrazí).
 *
 * Návlek na míru je výjimka: nevybírá se velikost (tu určí míry zákazníka),
 * ale materiál. Proto má varianta u každého produktu vlastní popisek —
 * jinak by u zakázkové výroby svítilo „Velikost: Nylon 210".
 */
export interface OutdoorVariants {
  /** Popisek v jednotném čísle, např. „Velikost" nebo „Materiál". */
  label: string;
  values: readonly string[];
}

export const OUTDOOR_VARIANTS_BY_ID: Record<string, OutdoorVariants> = {
  "vs-outdoor-navlek-obycejny-310112": { label: "Velikost", values: ["L", "XL"] },
  "vs-outdoor-navlek-obycejny-detsky-311112": { label: "Velikost", values: [] },
  "vs-outdoor-navlek-na-bezky-211096": { label: "Velikost", values: [] },
  "vs-outdoor-navlek-obycejny-se-zipem-310114": { label: "Velikost", values: ["M", "L", "XL"] },
  "vs-outdoor-navlek-surftex-510114": { label: "Velikost", values: ["M", "L", "XL"] },
};

export const getOutdoorSizes = (id: string): readonly string[] =>
  OUTDOOR_VARIANTS_BY_ID[id]?.values ?? [];

/** Popisek varianty (jednotné číslo) — „Velikost" u konfekce, „Materiál" na míru. */
export const getOutdoorVariantLabel = (id: string): string =>
  OUTDOOR_VARIANTS_BY_ID[id]?.label ?? "Velikost";

/** Popisek varianty v množném čísle pro nadpisy a aria-label. */
export const getOutdoorVariantLabelPlural = (id: string): string => {
  const label = getOutdoorVariantLabel(id);
  return label === "Materiál" ? "Materiály" : "Velikosti";
};

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
      "Jednoduchá a maximálně spolehlivá mechanická ochrana z nepromokavého Nylonu 210. Díky absenci zipu se na návleku nemá co pokazit. Vyrábíme přímo v Ostravě ve velikostech L a XL, případně ušijeme úpravu na míru pro širší či asymetrická lýtka.",
    problem:
      "Mokrá tráva při ranní rose, hluboké bláto i sníh, který padá vrchem do bot. Běžné zipové návleky se v těžkém terénu navíc často zanesou nečistotami a zadrhávají.",
    funkce:
      "Vysoký bezzipový střih pod koleno kryje celé lýtko. Natahuje se přímo přes botu, spodní popruh s bočními sponami drží návlek na podrážce, přední háček fixuje tkaničky a horní lem těsně uzavře stahovací gumička.",
    pouziti:
      "Podzimní houbaření ve vysoké trávě, nenáročná turistika (Beskydy, Lysá hora), lesní práce a chůze ve sněhu.",
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
      "Poctivý dětský návlek z nepromokavého Nylonu 210 šitý v Ostravě. Žádný zip, který by se mohl rozbít nebo skřípnout nohavici – návlek stačí jednoduše přetáhnout a utáhnout. Udrží dětské nožky v teple a suchu po celý den. Jednovelikostní provedení.",
    problem:
      "Děti mokro, bláto ani hluboký sníh neobcházejí. Promočené boty a studené nohy pak spolehlivě ukončí výlet dřív, než jste plánovali.",
    funkce:
      "Bezzipový střih z odolného Nylonu 210 se snadno natáhne přes botu. Spodní nastavitelný pásek s bočními sponami, přední ocelový háček do tkaniček a horní stahovací gumička spolehlivě uzavřou prostor proti vodě i sněhu.",
    pouziti:
      "Rodinné výlety, lesní školky, podzimní houbaření, tábory a zimní sáňkování v mokrém terénu.",
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
      "Lehký bariérový návlek z mrazuvzdorného Nylonu 210. Spolehlivě zabrání vniknutí sněhu a namrzání obuvi bez omezení kotníku při sportovním pohybu. Šijeme v Ostravě v univerzální velikosti.",
    problem:
      "Jemný prašan padající kolem kotníku přímo do běžkařské boty, kde taje a studí. Dlouhé turistické návleky jsou na běžky zbytečně těžké a omezují nohu v pohybu.",
    funkce:
      "Kompaktní nízký profil navržený přesně nad běžeckou obuv, který nekoliduje s běžeckým vázáním. Dvojité stažení pružnou gumičkou nahoře i dole a přední háček pro stabilní zakotvení za tkaničky při odrazu.",
    pouziti:
      "Běžecké lyžování (klasika i skate), trénink i turistika v bílé stopě a v hlubším sněhu.",
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
      "Vysoký turistický návlek z odolného a 100% nepromokavého Nylonu 210 kryjící celou holeň. Praktický zip šetří čas při obouvání. Vyrábíme v Ostravě ve velikostech M, L a XL s možností zakázkové úpravy střihu na míru.",
    problem:
      "Potřeba bleskově nasadit nebo sundat návleky během túry na těžké, zablácené či sněhem obalené pohorky, aniž byste se museli zouvat.",
    funkce:
      "Celorozepínací zip podél lýtka pro rychlé obléknutí. Podvlekový popruh pod podrážku nastavitelný bočními sponami, přední kovový háček do tkaniček a horní elastická šňůrka s brzdičkou proti propadávání nečistot.",
    pouziti:
      "Celoroční turistika, horské výstupy, chůze v blátě, mokrém sněhu i vysokém lesním podrostu.",
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
    id: "vs-outdoor-navlek-surftex-510114",
    name: "Návlek Surftex – membránový",
    category: "outdoor",
    categoryLabel: OUTDOOR_CATEGORY_LABEL,
    price: 1016, // MC s DPH 1 016,40
    b2b_price: 420, // VOC bez DPH
    shortDescription:
      "Technický návlek pro náročné podmínky ušitý v naší ostravské dílně. Udrží nohy v suchu zvenku i zevnitř i při celodenní zátěži a díky zadnímu reflexnímu pruhu budete bezpečně vidět při dešti i za svitu čelovky. Dostupné velikosti M, L, XL nebo šití na míru.",
    problem:
      "Při celodenním výstupu ve sněhu se noha v neprodyšném materiálu zapaří („upeče“) a promočí vlastním potem. Vánice, mlha a šero navíc zásadně zhoršují viditelnost v terénu.",
    funkce:
      "Funkční membrána Surftex (5 000 mm H₂O / 5 000 g/m²/24 h) nepustí vodu ani sníh dovnitř a odvádí tělesnou vlhkost ven. Celorozepínací zip, nastavitelné spodní uchycení sponami, háček do tkaniček a výrazný reflexní pás po celé zadní délce.",
    pouziti:
      "Vysokohorská turistika, náročný zimní trekking, Alpy, Tatry, Roháče a celodenní brodění v hlubokém sněhu.",
    features: [],
    specs: [
      { label: "Kategorie", value: "Návleky" },
      { label: "Kód produktu", value: "510114" },
      { label: "Výrobce", value: "VAPESPORT" },
      { label: "Materiál", value: "Membrána Surftex 5000" },
      { label: "Vodní sloupec / prodyšnost", value: "5 000 mm H₂O / 5 000 g/m²/24 h" },
      { label: "Velikosti", value: "M, L, XL" },
      { label: "EAN", value: "TODO" },
      { label: "Hmotnost (pár)", value: "TODO" },
    ],
    image: "/images/outdoor/navlek-surftex-card.jpg",
    images: ["/images/outdoor/navlek-surftex-card.jpg"],
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
  "vs-outdoor-navlek-surftex-510114": ["hory", "bezky"],
};

export const matchesUseCase = (id: string, use: OutdoorUseCase): boolean =>
  use === "vse" || (OUTDOOR_USE_BY_ID[id] ?? []).includes(use);

export default outdoorProducts;
