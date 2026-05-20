import { feedProducts } from "./feedProducts";

export interface Product {
  id: string;
  name: string;
  category: "morseo-evo" | "vape-legends" | "vapesport";
  categoryLabel: string;
  price: number;
  shortDescription: string;
  features: string[];
  specs: { label: string; value: string }[];
  image: string;
  images?: string[];
}

export const products: Product[] = [
  {
    id: "morseo-elektro-ii",
    name: "MORSEO Elektro II",
    category: "morseo-evo",
    categoryLabel: "MORSEO EVO",
    price: 399,
    shortDescription: "Rámová brašna s vyšším profilem pro elektrokola.",
    features: ["Vyšší profil specifický pro e-bike rámy", "Voděodolný zip AquaLock™", "UltraTouch™ slída pro ovládání telefonu", "Kompatibilní s bolt-on systémem"],
    specs: [{ label: "Originál", value: "VAPESPORT, Česká výroba" }],
    image: "https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/tlustoch-001-2116855.jpeg",
    images: ["https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/tlustoch-001-2116855.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/tlustoch-001-2116855.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/001/570/13308587-1215327541824432-2637036126679989605-o-1569290.jpg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/001/570/13330914-1215327468491106-3128574960037113432-n-1569291.jpg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/001/992/souhrn-bras-en-web-002-1991953.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/001/729/img-6755-1728794.jpg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/tlustoch-005-2116856.jpeg"],
  },
  {
    id: "morseo-stredni-trojuhelnik",
    name: "MORSEO Střední trojúhledník 2kapsý",
    category: "morseo-evo",
    categoryLabel: "MORSEO EVO",
    price: 620,
    shortDescription: "Rámová brašna se dvěma zipy a síťkou.",
    features: ["Oboustranné uchycení", "2 kapsy + síťka", "HydroGuard™ ochrana proti vodě", "AeroFlow™ aerodynamický tvar"],
    specs: [{ label: "Originál", value: "VAPESPORT, Česká výroba" }],
    image: "https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/200b61b1-f6a6-4aae-b260-e00f4b37e7c8-1-105-c-2116933.jpeg",
    images: ["https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/200b61b1-f6a6-4aae-b260-e00f4b37e7c8-1-105-c-2116933.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/200b61b1-f6a6-4aae-b260-e00f4b37e7c8-1-105-c-2116933.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/stredni-morseo-005-2116922.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/stredni-morseo-004-2116923.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/stredni-morseo-003-2116924.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/1771f3e3-3ce9-4dc9-aff2-9ecb23ad9729-1-105-c-2116916.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/83d40489-e156-4c74-8261-e8594a3a5544-1-105-c-2116915.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/43-2116910.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/45-2116909.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/46-2116913.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/47-2116911.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/44-2116912.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/42-2116914.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/2-2116931.png"],
  },
  {
    id: "morseo-smb-xxl",
    name: "MORSEO SMB 7”",
    category: "morseo-evo",
    categoryLabel: "MORSEO EVO",
    price: 599,
    shortDescription: "Brašna na mobil pro velké telefony.",
    features: ["Telefony až do 7”", "UltraTouch™ slída", "AquaLock™ zip", "Flexible Touch™ uchycení"],
    specs: [{ label: "Originál", value: "VAPESPORT, Česká výroba" }],
    image: "https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/13-2116939.png",
    images: ["https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/13-2116939.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/13-2116939.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/18-2116934.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/cce771ca-7738-451e-b6b3-10bc043f99e9-1-105-c-2116943.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/90c3f4a5-3cfb-4dba-a2a7-4b3e4fae61e2-1-105-c-2116944.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/99e866ea-1c96-481d-a8d0-d95405161c8f-1-105-c-2116945.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/49bd4ca5-2724-47a7-a041-006583d7e5bb-1-105-c-2116942.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/17-2116935.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/16-2116936.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/15-2116937.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/14-2116938.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/12-2116940.png"],
  },
  {
    id: "morseo-wdb",
    name: "MORSEO WDB — Waterproof bike bag",
    category: "morseo-evo",
    categoryLabel: "MORSEO EVO",
    price: 1055,
    shortDescription: "100% vodotěsná aerodynamická brašna.",
    features: ["100% vodotěsná konstrukce", "AeroFlow™ design", "E-bikeReady™", "Trvanlivý materiál"],
    specs: [{ label: "Originál", value: "VAPESPORT, Česká výroba" }],
    image: "https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/27-2116026.png",
    images: ["https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/27-2116026.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/27-2116026.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/26-2116025.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/3adc5cf1-304b-44de-a5a5-2dbd91a9c9c4-4-5005-c-2116033.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/076/wdb-morseo-vse-007-2075295.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/3f71d5d5-d77d-4e64-bd75-16f9806b3edf-4-5005-c-2116034.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/28-2116027.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/29-2116028.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/30-2116029.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/31-2116030.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/32-2116031.png", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/33-2116032.png"],
  },
  {
    id: "velky-trojuhelnik",
    name: "Plochý trojúhledník 4kapsý VAPE",
    category: "vape-legends",
    categoryLabel: "VAPE LEGENDS",
    price: 411,
    shortDescription: "Prostorná brašna do rámu, 4 kapsy.",
    features: ["4 oddělené kapsy", "Klasický tvar", "Odolný materiál", "Univerzální uchycení"],
    specs: [{ label: "Originál", value: "VAPESPORT, Česká výroba" }],
    image: "https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/plochy4k-007-2116779.jpeg",
    images: ["https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/plochy4k-007-2116779.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/plochy4k-007-2116779.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/001/752/img-0057-1683983-1751247.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/001/752/img-0059-1683982-1751248.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/001/992/souhrn-bras-en-web-007-1991938.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/plochy4k-003-2116783.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/plochy4k-005-2116781.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/plochy4k-011-2116786.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/plochy4k-010-2116787.jpeg"],
  },
  {
    id: "brasna-mala-riditka",
    name: "Brašna malá na řidítka PE",
    category: "vape-legends",
    categoryLabel: "VAPE LEGENDS",
    price: 1000,
    shortDescription: "Pevná vyztužená konstrukce.",
    features: ["Vyztužená konstrukce", "Reflexní prvky", "Kompaktní rozměry", "Univerzální uchycení"],
    specs: [{ label: "Originál", value: "VAPESPORT, Česká výroba" }],
    image: "https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/riditkovka-pe-001-2116860.jpeg",
    images: ["https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/riditkovka-pe-001-2116860.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/riditkovka-pe-001-2116860.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/1-2116012.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/riditkovka-pe-002-2116859.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/riditkovka-pe-003-2116858.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/18110588-10208648085506031-1890634777-n-1569424-2116017.jpg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/riditkovka-pe-004-2116857.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/3-2116015.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/001/992/souhrn-bras-en-web-010-1991958.jpeg"],
  },
  {
    id: "podsedlo-twist",
    name: "Brašna pod sedlo Žralok TWIST",
    category: "vape-legends",
    categoryLabel: "VAPE LEGENDS",
    price: 393,
    shortDescription: "Sportovní podsedlová brašna s expandérem.",
    features: ["Expandér pro větší objem", "Aerodynamický tvar Žralok", "Smyčka na zadní světlo", "Snadné uchycení na sedlovku"],
    specs: [{ label: "Originál", value: "VAPESPORT, Česká výroba" }],
    image: "https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/zralok-004-2116878.jpeg",
    images: ["https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/zralok-004-2116878.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/zralok-004-2116878.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/zralok-001-2116873.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/zralok-006-2116874.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/zralok-002-2116875.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/zralok-005-2116876.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/zralok-003-2116877.jpeg"],
  },
  {
    id: "neopren-baterie",
    name: "Neoprenový obal na baterii",
    category: "vape-legends",
    categoryLabel: "VAPE LEGENDS",
    price: 578,
    shortDescription: "Ochrana baterie pro tepelný komfort.",
    features: ["Neopren chrání před chladem", "Prodlužuje dojezd v zimě", "Snadné nasazení", "Univerzální velikost"],
    specs: [{ label: "Originál", value: "VAPESPORT, Česká výroba" }],
    image: "https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/1-2116024.jpeg",
    images: ["https://www.vapesport.cz/cms-app/001/657/527/main/images/800x800x0/000/002/117/1-2116024.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/1-2116024.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/1-2116019.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/040/obal-na-baterii-ebike-014-2039511.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/2-2116023.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/5-2116018.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/2-2116020.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/4-2116021.jpeg", "https://www.vapesport.cz/cms-app/001/657/527/main/images/1280x960x0/000/002/117/3-2116022.jpeg"],
  },
  ...feedProducts,
];
