import type { ProductOverride } from "@/hooks/useProductOverrides";

interface SpecRow {
  label: string;
  value: string;
}

interface Props {
  sku: string;
  categoryLabel: string;
  override: ProductOverride;
  /** Statické parametry produktu z katalogu (rozměry, objem, nosnost, slída…). */
  specs?: ReadonlyArray<SpecRow>;
}

/** Klíč pro porovnání názvů řádků: bez diakritiky, malá písmena, jen slova. */
const norm = (label: string): string =>
  label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Sjednocení názvů, které znamenají totéž, ale píší se různě.
 *  Bez toho by tabulka uvedla „Kód výrobku" i „Kód produktu" dvakrát
 *  a rozměry třemi různými zápisy osy.
 *  Pozor: „Kód (KLICKfix)" je JINÝ údaj (kód výrobce adaptéru) a slučovat se nesmí. */
const key = (label: string): string => {
  const n = norm(label);
  if (n.startsWith("rozmery")) return "rozmery";
  if (n === "kod produktu" || n === "kod vyrobku") return "kod";
  if (n === "slida prozor" || n === "slida" || n === "dotykova folie") return "folie";
  return n;
};

/**
 * Tabulka technických parametrů pod produktem.
 *
 * Zdroje dat jsou dva a mají pořadí:
 *   1. hodnoty z adminu (product_overrides) — mají přednost,
 *   2. statické parametry z katalogu — doplní zbytek.
 *
 * Dřív se brala jen data z adminu, a protože ta jsou u většiny produktů
 * prázdná, zbyly v tabulce tři řádky (kód, kategorie, výrobce), zatímco
 * skutečné rozměry ležely nepovšimnuté ve sbaleném akordeonu.
 */
const TechSpecTable = ({ sku, categoryLabel, override, specs = [] }: Props) => {
  const dims =
    override.dimensions_l_cm || override.dimensions_h_cm || override.dimensions_w_cm
      ? `${override.dimensions_l_cm ?? "?"} × ${override.dimensions_h_cm ?? "?"} × ${override.dimensions_w_cm ?? "?"} cm`
      : null;

  const fromAdmin: Array<[string, string | null]> = [
    ["Kód výrobku", sku],
    ["Kategorie", categoryLabel],
    ["Výrobce", override.manufacturer ?? "VAPESPORT"],
    ["Rozměry (D × V × Š)", dims],
    ["Dotyková fólie", override.touch_film],
    ["Materiál", override.material],
    ["Typ pohonu e-biku", override.motor_type],
    ["Umístění baterie", override.battery_location],
    [
      "Vhodné pro low-step rám",
      override.low_step_compatible === null ? null : override.low_step_compatible ? "Ano" : "Ne",
    ],
  ];

  const rows: Array<[string, string]> = [];
  const used = new Set<string>();

  for (const [label, value] of fromAdmin) {
    if (!value || !String(value).trim()) continue;
    rows.push([label, String(value)]);
    used.add(key(label));
  }

  // Statické parametry doplní, co admin nevyplnil.
  for (const spec of specs) {
    if (!spec?.label || !spec?.value || !String(spec.value).trim()) continue;
    const k = key(spec.label);
    if (used.has(k)) continue;
    rows.push([spec.label, String(spec.value)]);
    used.add(k);
  }

  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="tech-table-h" className="mt-16">
      <h2
        id="tech-table-h"
        className="font-heading text-2xl font-bold text-foreground mb-4"
      >
        Technické parametry
      </h2>
      <div className="rounded-lg overflow-hidden border border-border">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([k, v], i) => (
              <tr
                key={k}
                className={i % 2 === 0 ? "bg-muted/40" : "bg-background"}
              >
                <th
                  scope="row"
                  className="text-left font-body font-semibold text-foreground px-4 py-3 w-[40%] align-top"
                >
                  {k}
                </th>
                <td className="font-body text-muted-foreground px-4 py-3 align-top">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TechSpecTable;
