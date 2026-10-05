/**
 * Akce a slevy – čistá výpočetní logika (bez Reactu a bez Supabase).
 *
 * Pravidla (zadání „Akce a slevy“, říjen 2026):
 *  - Zákazník dostane vždy JEN JEDNU slevu – tu, která mu ušetří nejvíc Kč.
 *    Slevy se nesčítají.
 *  - B2B partner má svou partnerskou slevu (`discount_percent`) už započítanou
 *    v cenách položek. Akce proto vrací jen DOROVNÁNÍ: rozdíl mezi cenou
 *    po partnerské slevě a cenou po akční slevě. Když je partnerská sleva
 *    vyšší, dorovnání je 0 a akce se neuplatní.
 *  - Hranice akce (`min_net`) se počítá ze ZÁKLADNÍCH cen bez DPH
 *    (B2B = VOC před partnerskou slevou) jen u položek z kolekcí akce.
 *  - Doprava a platba se do slevy ani do hranice nepočítají.
 */

import { getEffectiveUnitPricing, type MinimalOverride } from "@/lib/pricing";
import type { Product } from "@/data/products";
import { grossFromNet } from "@/lib/vat";

export type DiscountCollection = "vapesport" | "morseo-evo" | "outdoor";

export const DISCOUNT_COLLECTIONS: { id: DiscountCollection; label: string }[] = [
  { id: "vapesport", label: "Vapesport" },
  { id: "morseo-evo", label: "MORSEO EVO" },
  { id: "outdoor", label: "Návleky" },
];

/** Kategorie z katalogu → kolekce akce. Vape Legends patří pod Vapesport. */
export const collectionOf = (category: Product["category"]): DiscountCollection => {
  if (category === "morseo-evo") return "morseo-evo";
  if (category === "outdoor") return "outdoor";
  return "vapesport";
};

/** Řádek tabulky `discount_rules`, jak ho vrací RPC `get_applicable_discounts`. */
export interface DiscountRule {
  id: string;
  name: string;
  code: string | null;
  percent: number;
  min_net: number | null;
  collections: DiscountCollection[];
}

/** Jedna položka košíku pro výpočet slevy. Ceny jsou za kus. */
export interface DiscountLine {
  category: Product["category"];
  qty: number;
  /** Cena za kus bez DPH, kterou zákazník platí (po partnerské slevě). */
  finalNet: number;
  /** Cena za kus s DPH, kterou zákazník platí (po partnerské slevě). */
  finalGross: number;
  /** Základní cena za kus bez DPH (B2B: VOC před partnerskou slevou). */
  baseNet: number;
  /** Základní cena za kus s DPH. */
  baseGross: number;
}

export interface AppliedDiscount {
  rule: DiscountRule;
  /** Částka slevy s DPH, zaokrouhlená na celé Kč. */
  amountGross: number;
}

export interface DiscountHint {
  rule: DiscountRule;
  /** Kolik Kč bez DPH chybí do hranice akce. */
  missingNet: number;
}

export type CodeNote = "no_items" | "below_min" | "outranked" | null;

export interface DiscountResult {
  applied: AppliedDiscount | null;
  hint: DiscountHint | null;
  /** Proč se zadaný kód neuplatnil (když se neuplatnil). */
  codeNote: CodeNote;
}

const round = (n: number) => Math.round(n);

/**
 * Sestaví řádek pro výpočet slevy z produktu – stejné ceny, jaké ukazuje
 * košík (`getEffectiveUnitPricing`), plus základní cena bez partnerské slevy.
 */
export const buildDiscountLine = (
  product: Pick<Product, "category" | "price" | "b2b_price">,
  override: MinimalOverride | null | undefined,
  isPartner: boolean,
  partnerPercent: number,
  qty: number,
  /** Volitelně přesná cena bez DPH za kus, pokud ji už stránka spočítala. */
  finalNetOverride?: number,
): DiscountLine => {
  const final = getEffectiveUnitPricing(product, override, isPartner, partnerPercent);
  const base = getEffectiveUnitPricing(product, override, isPartner, 0);
  const finalNet = finalNetOverride ?? final.unitNet;
  return {
    category: product.category,
    qty,
    finalNet,
    finalGross: finalNetOverride != null ? grossFromNet(finalNetOverride) : final.unitGross,
    baseNet: base.unitNet,
    baseGross: base.unitGross,
  };
};

/**
 * Vybere nejvýhodnější slevu pro košík.
 *
 * @param rules        Akce, na které má zákazník nárok (už vyfiltrované
 *                     serverem podle období, skupiny a zadaného kódu).
 * @param partnerPercent Partnerská sleva v % (0 pro B2C) – jen pro hlášku.
 * @param enteredCode  Kód, který zákazník zadal (kvůli vysvětlení, proč
 *                     se neuplatnil).
 */
export const computeDiscount = (
  lines: DiscountLine[],
  rules: DiscountRule[],
  partnerPercent = 0,
  enteredCode: string | null = null,
): DiscountResult => {
  let applied: AppliedDiscount | null = null;
  const missed: DiscountHint[] = [];
  let codeNote: CodeNote = null;
  const code = enteredCode?.trim().toUpperCase() || null;

  for (const rule of rules) {
    const eligible = lines.filter((l) =>
      rule.collections.includes(collectionOf(l.category)),
    );
    const baseNet = eligible.reduce((s, l) => s + l.baseNet * l.qty, 0);
    const baseGross = eligible.reduce((s, l) => s + l.baseGross * l.qty, 0);
    const finalGross = eligible.reduce((s, l) => s + l.finalGross * l.qty, 0);
    const isCodeRule = rule.code != null && rule.code === code;

    if (eligible.length === 0) {
      if (isCodeRule) codeNote = "no_items";
      continue;
    }

    if (rule.min_net != null && baseNet < rule.min_net) {
      missed.push({ rule, missingNet: rule.min_net - baseNet });
      if (isCodeRule) codeNote = "below_min";
      continue;
    }

    const target = baseGross * (1 - rule.percent / 100);
    const amountGross = Math.max(0, round(finalGross - target));

    if (amountGross <= 0) {
      if (isCodeRule) codeNote = "outranked";
      continue;
    }

    if (!applied || amountGross > applied.amountGross) {
      applied = { rule, amountGross };
    }
  }

  if (code && applied?.rule.code !== code && codeNote == null) {
    codeNote = rules.some((r) => r.code === code) ? "outranked" : null;
  }

  // Hláška „do slevy X % chybí Y Kč“: jen akce, která by dala víc než
  // současný stav (partnerská sleva nebo právě uplatněná akce).
  const currentPercent = Math.max(partnerPercent, applied?.rule.percent ?? 0);
  const hint =
    missed
      .filter((m) => m.rule.percent > currentPercent && m.rule.code == null)
      .sort((a, b) => a.missingNet - b.missingNet)[0] ?? null;

  return {
    applied,
    hint: hint ? { ...hint, missingNet: Math.ceil(hint.missingNet) } : null,
    codeNote,
  };
};

/** Text řádku slevy v košíku a v pokladně. */
export const discountLabel = (applied: AppliedDiscount, partnerPercent = 0): string => {
  const base = `${applied.rule.name} (−${applied.rule.percent} %)`;
  return partnerPercent > 0 ? `${base}, místo vaší slevy ${partnerPercent} %` : base;
};

export const CODE_NOTE_TEXT: Record<Exclude<CodeNote, null>, string> = {
  no_items: "Kód se nevztahuje na zboží v košíku.",
  below_min: "Pro tento kód je potřeba vyšší hodnota košíku.",
  outranked: "Máte už vyšší slevu, kód se proto neuplatní.",
};
