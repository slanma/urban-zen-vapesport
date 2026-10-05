import { describe, it, expect } from "vitest";
import { computeDiscount, buildDiscountLine, type DiscountRule } from "./discounts";

const MORSEO15: DiscountRule = { id: "m", name: "MORSEO15", code: "MORSEO15", percent: 15, min_net: null, collections: ["morseo-evo"] };
const ALL = ["vapesport", "morseo-evo", "outdoor"] as DiscountRule["collections"];
const B2B5: DiscountRule = { id: "b5", name: "B2B říjen 5 %", code: null, percent: 5, min_net: 3500, collections: ALL };
const B2B10: DiscountRule = { id: "b10", name: "B2B říjen 10 %", code: null, percent: 10, min_net: 5000, collections: ALL };

const morseo = { category: "morseo-evo" as const, price: 1000, b2b_price: 400 };
const classic = { category: "vapesport" as const, price: 500, b2b_price: 200 };
const gaiter = { category: "outdoor" as const, price: 700, b2b_price: 300 };

describe("B2C kód MORSEO15", () => {
  it("jen MORSEO → 15 %", () => {
    const r = computeDiscount([buildDiscountLine(morseo, null, false, 0, 1)], [MORSEO15], 0, "MORSEO15");
    expect(r.applied?.amountGross).toBe(150);
  });
  it("MORSEO + klasika → sleva jen z MORSEO", () => {
    const r = computeDiscount(
      [buildDiscountLine(morseo, null, false, 0, 1), buildDiscountLine(classic, null, false, 0, 2)],
      [MORSEO15], 0, "MORSEO15",
    );
    expect(r.applied?.amountGross).toBe(150);
  });
  it("bez MORSEO → kód se nevztahuje", () => {
    const r = computeDiscount([buildDiscountLine(classic, null, false, 0, 1)], [MORSEO15], 0, "morseo15");
    expect(r.applied).toBeNull();
    expect(r.codeNote).toBe("no_items");
  });
});

describe("B2B stupně podle košíku", () => {
  const lines = (pct: number, qty: number) => [buildDiscountLine(classic, null, true, pct, qty)];

  it("3 000 Kč bez slevy → nic + hláška chybí 500 Kč do 5 %", () => {
    const r = computeDiscount(lines(0, 15), [B2B5, B2B10], 0);
    expect(r.applied).toBeNull();
    expect(r.hint?.rule.id).toBe("b5");
    expect(r.hint?.missingNet).toBe(500);
  });
  it("4 000 Kč → 5 %", () => {
    const r = computeDiscount(lines(0, 20), [B2B5, B2B10], 0);
    expect(r.applied?.rule.id).toBe("b5");
    expect(r.applied?.amountGross).toBe(Math.round(4000 * 0.05 * 1.21));
    expect(r.hint?.rule.id).toBe("b10");
  });
  it("6 000 Kč → 10 %", () => {
    const r = computeDiscount(lines(0, 30), [B2B5, B2B10], 0);
    expect(r.applied?.rule.id).toBe("b10");
    expect(r.applied?.amountGross).toBe(Math.round(6000 * 0.1 * 1.21));
  });
  it("partner 7 %, 4 000 Kč → zůstává 7 %", () => {
    const r = computeDiscount(lines(7, 20), [B2B5, B2B10], 7);
    expect(r.applied).toBeNull();
    expect(r.hint?.rule.id).toBe("b10");
  });
  it("partner 7 %, 6 000 Kč → dorovnání na 10 %", () => {
    const r = computeDiscount(lines(7, 30), [B2B5, B2B10], 7);
    expect(r.applied?.rule.id).toBe("b10");
    // 3 % z 6 000 bez DPH, s DPH
    expect(r.applied?.amountGross).toBe(Math.round(6000 * 0.03 * 1.21));
  });
  it("partner 20 %, 6 000 Kč → bez akce a bez hlášky", () => {
    const r = computeDiscount(lines(20, 30), [B2B5, B2B10], 20);
    expect(r.applied).toBeNull();
    expect(r.hint).toBeNull();
  });
  it("hranice počítá všechny kolekce", () => {
    const r = computeDiscount(
      [
        buildDiscountLine(morseo, null, true, 0, 5),
        buildDiscountLine(classic, null, true, 0, 5),
        buildDiscountLine(gaiter, null, true, 0, 5),
      ],
      [B2B5, B2B10], 0,
    );
    expect(r.applied?.rule.id).toBe("b5"); // 2000 + 1000 + 1500 = 4500 → 5 %
  });
});
