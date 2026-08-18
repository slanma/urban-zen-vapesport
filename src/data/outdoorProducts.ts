/**
 * OUTDOOR — návleky (gaiters) pro turistiku, trail a běžky.
 *
 * Proč zvláštní soubor a ne feedProducts.ts:
 * feedProducts.ts je AUTO-GENERATED z feedu — cokoli tam dopíšeme ručně,
 * příští generování smaže. Outdoor sortiment je ruční, takže žije tady
 * a do katalogu se přidává v products.ts (concat).
 *
 * ------------------------------------------------------------------
 * CO TU JEŠTĚ MUSÍŠ DOPLNIT (zástupné hodnoty jsou označené TODO):
 *   • name           – finální obchodní název
 *   • price          – MOC s DPH v Kč (celé číslo)
 *   • b2b_price      – VOC bez DPH (nech vynechané, pokud návleky do B2B nejdou)
 *   • specs          – Kód produktu, EAN, materiál, velikosti, hmotnost
 *   • image/images   – cesty k reálným fotkám (viz níže)
 *   • problem/funkce/pouziti – texty, které se zobrazí v pravém panelu
 *
 * FOTKY: nahraj je do  public/images/outdoor/  a odkazuj cestou
 *        "/images/outdoor/nazev-souboru.jpg".
 *        POZOR: produkt bez neprázdného `image` katalog vyfiltruje
 *        (products.ts filtruje p.image.trim().length > 0) a zmizí i z košíku.
 * ------------------------------------------------------------------
 */
import type { Product } from "./products";

/** Velikostní řada návleků. Použitá i v selektoru na /outdoor. */
export const OUTDOOR_SIZES = ["M", "L", "XL"] as const;
export type OutdoorSize = (typeof OUTDOOR_SIZES)[number];

export const OUTDOOR_CATEGORY_LABEL = "NÁVLEKY";

export const outdoorProducts: Product[] = [
  {
    id: "vs-outdoor-navlek-horsky-vysoky",
    name: "Návlek Horský vysoký", // TODO finální název
    category: "outdoor",
    categoryLabel: OUTDOOR_CATEGORY_LABEL,
    price: 950, // TODO MOC s DPH
    shortDescription:
      "Vysoký návlek pro vysokohorskou turistiku a trekking. Chrání nohavici i obuv před blátem, sněhem a vlhkostí i v náročném terénu.",
    problem:
      "V blátě, mokré trávě a sněhu se voda a nečistoty dostanou do boty i pod nohavici. Mokré nohy znamenají chlad, otlaky a zkrácený výšlap.",
    funkce:
      "Vysoký střih přes lýtko, vodoodpudivý materiál s podlepenými švy, spodní poutko pod podrážku a stahovací šňůra s brzdičkou pro pevné dosednutí na obuv.",
    pouziti:
      "Vysokohorská turistika, trekking a přechody hřebenů — kdykoli jde cesta mokrým, blátivým nebo zasněženým terénem.",
    features: ["RainShield™", "100%HydroGuard™", "QuickClip™"],
    specs: [
      { label: "Kategorie", value: "Návleky" },
      { label: "Kód produktu", value: "TODO" },
      { label: "Výrobce", value: "VAPESPORT" },
      { label: "Velikosti", value: OUTDOOR_SIZES.join(" / ") },
      { label: "Materiál", value: "TODO" },
      { label: "Hmotnost (pár)", value: "TODO" },
    ],
    /* Fotky dodané 18. 8. 2026. `-card` je čtvercový výřez pro dlaždici,
       `-1` je celá kompozice na podstavci pro detail. */
    image: "/images/outdoor/navlek-horsky-vysoky-card.jpg",
    images: [
      "/images/outdoor/navlek-horsky-vysoky-card.jpg",
      "/images/outdoor/navlek-horsky-vysoky-1.jpg",
    ],
  },

  /* ------------------------------------------------------------------
   * ZBÝVAJÍCÍ 4 NÁVLEKY — ZATÍM VYPNUTÉ
   *
   * Produkt bez existující fotky by na webu ukázal rozbitý obrázek,
   * takže jsou zakomentované. Jak dodáš fotky do public/images/outdoor/,
   * odkomentuj příslušný blok a přepiš cesty + TODO hodnoty.
   * ------------------------------------------------------------------ */
  // {
  //   id: "vs-outdoor-navlek-horsky-nizky",
  //   name: "Návlek Horský nízký", // TODO
  //   category: "outdoor",
  //   categoryLabel: OUTDOOR_CATEGORY_LABEL,
  //   price: 750, // TODO
  //   shortDescription:
  //     "Nízký návlek ke kotníku pro trail a rychlou turistiku. Zabrání vnikání kamínků, prachu a vody do obuvi, aniž by omezoval pohyb.",
  //   problem:
  //     "Na suti a lesních cestách se do nízké obuvi sype drť a jehličí. Zastavovat se a vysypávat botu je otrava a dřou z toho puchýře.",
  //   funkce:
  //     "Nízký kotníkový střih z lehkého odolného materiálu, pružný lem a poutko pod podrážku. Skoro se nepocítí, ale obuv zůstane čistá.",
  //   pouziti:
  //     "Trailový běh, rychlá turistika a suché letní hory, kde jde hlavně o drť a prach, ne o hluboký sníh.",
  //   features: ["RainShield™", "QuickClip™"],
  //   specs: [
  //     { label: "Kategorie", value: "Návleky" },
  //     { label: "Kód produktu", value: "TODO" },
  //     { label: "Výrobce", value: "VAPESPORT" },
  //     { label: "Velikosti", value: OUTDOOR_SIZES.join(" / ") },
  //     { label: "Materiál", value: "TODO" },
  //     { label: "Hmotnost (pár)", value: "TODO" },
  //   ],
  //   image: "/images/outdoor/navlek-horsky-nizky-1.jpg", // TODO
  //   images: [
  //     "/images/outdoor/navlek-horsky-nizky-1.jpg",
  //     "/images/outdoor/navlek-horsky-nizky-2.jpg",
  //   ],
  // },
  // {
  //   id: "vs-outdoor-navlek-bezky-classic",
  //   name: "Návlek na běžky Classic", // TODO
  //   category: "outdoor",
  //   categoryLabel: OUTDOOR_CATEGORY_LABEL,
  //   price: 850, // TODO
  //   shortDescription:
  //     "Návlek na běžky s úzkým profilem, který nekoliduje s vázáním. Drží sníh mimo botu i při klasické technice a dlouhých přejezdech.",
  //   problem:
  //     "Při běžkování se sníh nabaluje na přechod boty a nohavice, taje a stéká dovnitř. Mokrá noha na stopě znamená konec zábavy.",
  //   funkce:
  //     "Úzký střih respektující běžecké vázání, vodoodpudivý povrch a stahování v horní i dolní části. Nabalený sníh se neudrží.",
  //   pouziti:
  //     "Klasická běžecká technika na strojově upravené stopě i mimo ni, zimní vycházky a přejezdy v hlubším snehu.",
  //   features: ["RainShield™", "100%HydroGuard™"],
  //   specs: [
  //     { label: "Kategorie", value: "Návleky" },
  //     { label: "Kód produktu", value: "TODO" },
  //     { label: "Výrobce", value: "VAPESPORT" },
  //     { label: "Velikosti", value: OUTDOOR_SIZES.join(" / ") },
  //     { label: "Materiál", value: "TODO" },
  //     { label: "Hmotnost (pár)", value: "TODO" },
  //   ],
  //   image: "/images/outdoor/navlek-bezky-classic-1.jpg", // TODO
  //   images: [
  //     "/images/outdoor/navlek-bezky-classic-1.jpg",
  //     "/images/outdoor/navlek-bezky-classic-2.jpg",
  //   ],
  // },
  // {
  //   id: "vs-outdoor-navlek-bezky-skate",
  //   name: "Návlek na běžky Skate", // TODO
  //   category: "outdoor",
  //   categoryLabel: OUTDOOR_CATEGORY_LABEL,
  //   price: 890, // TODO
  //   shortDescription:
  //     "Návlek pro skatovou techniku — tvarovaný tak, aby nepřekážel při odrazu do strany a nedřel o protilehlou lyži.",
  //   problem:
  //     "Při skatingu jde noha do strany a běžný návlek se mačká, dře o druhou lyži nebo se stočí. Sníh se pak dostane dovnitř stejně.",
  //   funkce:
  //     "Anatomický střih pro bruslení, zpevněná vnitřní strana proti odírání a nízká hmotnost, aby nohu nezatěžoval.",
  //   pouziti:
  //     "Skatová technika na upravené stopě, zimní tréninky a závody, kdy je potřeba čistý a rychlý pohyb nohy.",
  //   features: ["RainShield™", "QuickClip™"],
  //   specs: [
  //     { label: "Kategorie", value: "Návleky" },
  //     { label: "Kód produktu", value: "TODO" },
  //     { label: "Výrobce", value: "VAPESPORT" },
  //     { label: "Velikosti", value: OUTDOOR_SIZES.join(" / ") },
  //     { label: "Materiál", value: "TODO" },
  //     { label: "Hmotnost (pár)", value: "TODO" },
  //   ],
  //   image: "/images/outdoor/navlek-bezky-skate-1.jpg", // TODO
  //   images: [
  //     "/images/outdoor/navlek-bezky-skate-1.jpg",
  //     "/images/outdoor/navlek-bezky-skate-2.jpg",
  //   ],
  // },
  // {
  //   id: "vs-outdoor-navlek-univerzalni",
  //   name: "Návlek Univerzál", // TODO
  //   category: "outdoor",
  //   categoryLabel: OUTDOOR_CATEGORY_LABEL,
  //   price: 690, // TODO
  //   shortDescription:
  //     "Univerzální návlek pro turistiku, práci na zahradě i psí vycházky. Jeden pár, který zvládne bláto, rosu i mokrý sníh.",
  //   problem:
  //     "Na většinu výšlapů a venkovní práce není potřeba specializovaná výbava — jen něco, co spolehlivě udrží nohavici a botu v suchu.",
  //   funkce:
  //     "Střední výška, odolný vodoodpudivý materiál a jednoduché stahování bez zbytečných doplňků. Snadné nasazení i v rukavicích.",
  //   pouziti:
  //     "Turistika, práce venku, houbaření a vycházky se psem — celoročně, kdykoli je pod nohama mokro nebo bláto.",
  //   features: ["RainShield™", "FlexVolume™"],
  //   specs: [
  //     { label: "Kategorie", value: "Návleky" },
  //     { label: "Kód produktu", value: "TODO" },
  //     { label: "Výrobce", value: "VAPESPORT" },
  //     { label: "Velikosti", value: OUTDOOR_SIZES.join(" / ") },
  //     { label: "Materiál", value: "TODO" },
  //     { label: "Hmotnost (pár)", value: "TODO" },
  //   ],
  //   image: "/images/outdoor/navlek-univerzalni-1.jpg", // TODO
  //   images: [
  //     "/images/outdoor/navlek-univerzalni-1.jpg",
  //     "/images/outdoor/navlek-univerzalni-2.jpg",
  //   ],
  // },
];

export default outdoorProducts;
