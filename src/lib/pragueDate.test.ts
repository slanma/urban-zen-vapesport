import { describe, it, expect } from "vitest";
import { pragueDayToIso, isoToPragueDay } from "./pragueDate";

describe("pragueDate", () => {
  it("letní čas (CEST, +2)", () => {
    expect(pragueDayToIso("2026-10-07")).toBe("2026-10-06T22:00:00.000Z");
  });
  it("zimní čas (CET, +1) po 25. 10.", () => {
    expect(pragueDayToIso("2026-10-31", true)).toBe("2026-10-31T22:59:59.000Z");
  });
  it("zpět na den", () => {
    expect(isoToPragueDay("2026-10-31T22:59:59.000Z")).toBe("2026-10-31");
    expect(isoToPragueDay("2026-10-06T22:00:00.000Z")).toBe("2026-10-07");
  });
});
