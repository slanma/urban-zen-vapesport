export interface Product {
  id: string;
  name: string;
  category: "morseo-evo" | "vape-legends";
  categoryLabel: string;
  price: number;
  shortDescription: string;
  features: string[];
  specs: { label: string; value: string }[];
  image: string;
}

export const products: Product[] = [
  // MORSEO EVO
  {
    id: "morseo-elektro-ii",
    name: "MORSEO Elektro II",
    category: "morseo-evo",
    categoryLabel: "MORSEO EVO",
    price: 1890,
    shortDescription: "Rámová brašna s vyšším profilem pro elektrokola.",
    features: [
      "Vyšší profil speciálně navržený pro e-bike rámy",
      "Voděodolný zip AquaLock™",
      "Vysoce citlivá slída UltraTouch™ pro ovládání telefonu",
      "Kompatibilní s bolt-on montážním systémem",
    ],
    specs: [
      { label: "Rozměry", value: "24 × 6 × 20 cm" },
      { label: "Kompatibilita", value: "E-bike rámy, gravel" },
      { label: "Materiál", value: "HydroGuard™ prémiový materiál" },
      { label: "Hmotnost", value: "185 g" },
    ],
    image: "/placeholder.svg",
  },
  {
    id: "morseo-stredni-trojuhelnik",
    name: "MORSEO Střední trojúhelník 2kapsý",
    category: "morseo-evo",
    categoryLabel: "MORSEO EVO",
    price: 2290,
    shortDescription: "Nejobjemnější model, oboustranné uchycení.",
    features: [
      "Oboustranné uchycení pro maximální stabilitu",
      "2 kapsy pro organizaci vybavení",
      "100% HydroGuard™ ochrana proti vodě",
      "AeroFlow™ aerodynamický tvar",
    ],
    specs: [
      { label: "Rozměry", value: "38 × 7 × 22 cm" },
      { label: "Kompatibilita", value: "Univerzální rámové trubky" },
      { label: "Materiál", value: "HydroGuard™ prémiový materiál" },
      { label: "Hmotnost", value: "310 g" },
    ],
    image: "/placeholder.svg",
  },
  {
    id: "morseo-smb-xxl",
    name: 'MORSEO SMB XXL 8"',
    category: "morseo-evo",
    categoryLabel: "MORSEO EVO",
    price: 1490,
    shortDescription: "Brašna na mobil pro velké telefony a e-bike rámy.",
    features: [
      'Pojme telefony až do 8" – modely Ultra/Max',
      "UltraTouch™ vysoce citlivá slída",
      "Voděodolný zip AquaLock™",
      "Rychlé uchycení Flexible Touch™",
    ],
    specs: [
      { label: "Rozměry", value: '18 × 10 × 4 cm (pro 8" displej)' },
      { label: "Kompatibilita", value: "E-bike, gravel, silniční kola" },
      { label: "Materiál", value: "HydroGuard™ prémiový materiál" },
      { label: "Hmotnost", value: "120 g" },
    ],
    image: "/placeholder.svg",
  },
  {
    id: "morseo-wdb",
    name: "MORSEO WDB",
    category: "morseo-evo",
    categoryLabel: "MORSEO EVO",
    price: 2590,
    shortDescription: "100% vodotěsná aerodynamická brašna pro gravel.",
    features: [
      "100% vodotěsná konstrukce",
      "AeroFlow™ aerodynamický design",
      "E-bikeReady™ – navrženo pro elektrokola a gravel",
      "MorseoColors™ – 8 barev pro dokonalý match",
    ],
    specs: [
      { label: "Rozměry", value: "32 × 8 × 18 cm" },
      { label: "Kompatibilita", value: "Gravel, e-bike, adventure" },
      { label: "Materiál", value: "100% HydroGuard™" },
      { label: "Hmotnost", value: "245 g" },
    ],
    image: "/placeholder.svg",
  },
  // VAPE LEGENDS
  {
    id: "velky-trojuhelnik",
    name: "Velký trojúhelník tříkapsý",
    category: "vape-legends",
    categoryLabel: "VAPE LEGENDS",
    price: 1690,
    shortDescription: "Prostorná brašna, klasický rám, 3 kapsy.",
    features: [
      "3 oddělené kapsy pro přehlednou organizaci",
      "Klasický trojúhelníkový tvar",
      "Odolný materiál pro každodenní použití",
      "Univerzální uchycení na suchý zip",
    ],
    specs: [
      { label: "Rozměry", value: "42 × 8 × 24 cm" },
      { label: "Kompatibilita", value: "Klasické rámy 26–29\"" },
      { label: "Materiál", value: "Ripstop nylon 600D" },
      { label: "Hmotnost", value: "280 g" },
    ],
    image: "/placeholder.svg",
  },
  {
    id: "brasna-mala-riditka",
    name: "Brašna malá na řídítka PE",
    category: "vape-legends",
    categoryLabel: "VAPE LEGENDS",
    price: 990,
    shortDescription: "Pevná vyztužená konstrukce s Klickfix adaptérem.",
    features: [
      "Klickfix adaptér pro rychlé nasazení a sundání",
      "Vyztužená konstrukce drží tvar",
      "Reflexní prvky pro bezpečnost",
      "Kompaktní rozměry pro městské ježdění",
    ],
    specs: [
      { label: "Rozměry", value: "22 × 12 × 16 cm" },
      { label: "Kompatibilita", value: "Řídítka 22–32 mm (Klickfix)" },
      { label: "Materiál", value: "Polyester s PE výztuhou" },
      { label: "Hmotnost", value: "340 g" },
    ],
    image: "/placeholder.svg",
  },
  {
    id: "podsedlo-twist",
    name: "Podsedlo Twist (Žralok)",
    category: "vape-legends",
    categoryLabel: "VAPE LEGENDS",
    price: 790,
    shortDescription: "Sportovní podsedlová brašna s expandérem pro zvětšení objemu.",
    features: [
      "Expandér pro zvětšení objemu až o 50 %",
      'Sportovní aerodynamický tvar „Žralok"',
      "Bezpečnostní smyčka na zadní světlo",
      "Snadné uchycení na sedlovku",
    ],
    specs: [
      { label: "Rozměry", value: "18 × 9 × 8 cm (rozloženo až 12 cm)" },
      { label: "Kompatibilita", value: "Sedlovky 27.2–34.9 mm" },
      { label: "Materiál", value: "Ripstop nylon 420D" },
      { label: "Hmotnost", value: "95 g" },
    ],
    image: "/placeholder.svg",
  },
  {
    id: "neopren-baterie",
    name: "Neopren na baterii",
    category: "vape-legends",
    categoryLabel: "VAPE LEGENDS",
    price: 590,
    shortDescription: "Ochrana baterie pro tepelný komfort a delší dojezd.",
    features: [
      "Neoprenový obal chrání baterii před chladem",
      "Prodlužuje dojezd v zimních měsících",
      "Snadné nasazení a sundání",
      "Univerzální velikost pro většinu e-bike baterií",
    ],
    specs: [
      { label: "Rozměry", value: "40 × 12 × 8 cm (pružný)" },
      { label: "Kompatibilita", value: "Integrované i externí baterie" },
      { label: "Materiál", value: "Neopren 3 mm" },
      { label: "Hmotnost", value: "150 g" },
    ],
    image: "/placeholder.svg",
  },
];
