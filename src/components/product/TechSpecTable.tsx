import type { ProductOverride } from "@/hooks/useProductOverrides";

interface Props {
  sku: string;
  categoryLabel: string;
  override: ProductOverride;
}

const TechSpecTable = ({ sku, categoryLabel, override }: Props) => {
  const dims =
    override.dimensions_l_cm || override.dimensions_h_cm || override.dimensions_w_cm
      ? `${override.dimensions_l_cm ?? "?"} × ${override.dimensions_h_cm ?? "?"} × ${override.dimensions_w_cm ?? "?"} cm`
      : null;

  const rows: Array<[string, string | null]> = [
    ["Kód výrobku", sku],
    ["Kategorie", categoryLabel],
    ["Výrobce", override.manufacturer ?? "Vapesport"],
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

  const visible = rows.filter(([, v]) => v && String(v).trim().length > 0);
  if (visible.length === 0) return null;

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
            {visible.map(([k, v], i) => (
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
