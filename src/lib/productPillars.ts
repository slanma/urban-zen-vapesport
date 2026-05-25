import type { Product } from "@/data/products";

export type PillarKey = "ridi" | "ram" | "sedlo" | "gravel";

export interface Pillar {
  key: PillarKey;
  title: string;
  subtitle: string;
  match: (p: Product) => boolean;
}

const nameRe = (p: Product, re: RegExp) => re.test(p.name);

export const PILLARS: Pillar[] = [
  {
    key: "ridi",
    title: "Brašny na řídítka a představec",
    subtitle:
      "Telefon a navigace stále na očích. Ideální pro rychlý přístup na e-kolech i koloběžkách.",
    match: (p) =>
      p.categoryLabel === "BRAŠNY NA MOBILNÍ TELEFONY" ||
      nameRe(p, /řidítka|řídítka|transformer|smb|lady|street\s*bag|mobil/i),
  },
  {
    key: "ram",
    title: "Brašny do rámu",
    subtitle:
      "Maximální úložný prostor přímo v těžišti kola. Perfektní místo pro těžké e-bike nabíječky, nářadí nebo pláštěnku.",
    match: (p) =>
      p.categoryLabel === "RÁMOVÉ BRAŠNY" ||
      nameRe(p, /trojúhel|trojuhel|flexi|elektro|rámová|ramova/i),
  },
  {
    key: "sedlo",
    title: "Brašny pod sedlo",
    subtitle:
      "Nenápadný, ultra lehký prostor pro nejnutnější výbavu (klíče, peněženka, lepicí sada).",
    match: (p) =>
      p.categoryLabel === "BRAŠNY POD SEDLO" ||
      nameRe(p, /podsedl|pod\s*sedlo|wasabi|m2\s*podsedlo|waterproof saddle/i),
  },
  {
    key: "gravel",
    title: "Gravel & Bikepacking",
    subtitle:
      "Prémiová, 100% nepromokavá řada pro designové fajnšmekry a dlouhé trasy za jakéhokoliv počasí.",
    match: (p) => nameRe(p, /waterproof|morseo|nepromokav/i),
  },
];

export const getPillar = (key: string | null): Pillar | undefined =>
  PILLARS.find((p) => p.key === key);

export const pickPillarImage = (
  pillar: Pillar,
  pool: Product[],
): string | undefined => pool.find((p) => pillar.match(p) && p.image)?.image;
