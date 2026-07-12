import type { ProductOverride } from "@/hooks/useProductOverrides";
import type { Product } from "@/data/products";

interface Props {
  product: Product;
  override: ProductOverride;
  sku: string;
}

/**
 * Hidden but crawlable rich-text block for Google + RAG ingestion.
 * Rendered in DOM (not display:none) so bots index it, but visually
 * collapsed via sr-only for human users.
 */
const RagSeoBlock = ({ product, override, sku }: Props) => {
  if (
    !override.rag_content &&
    (!override.compatible_bikes || override.compatible_bikes.length === 0)
  ) {
    return null;
  }

  return (
    <section
      aria-label="Rozšířené technické informace pro vyhledávače a AI asistenty"
      className="sr-only"
    >
      <h2>Hluboké technické informace o produktu {product.name} (kód {sku})</h2>
      {override.rag_content && <p>{override.rag_content}</p>}
      {override.compatible_bikes && override.compatible_bikes.length > 0 && (
        <>
          <h3>Kompatibilní značky a modely elektrokol</h3>
          <ul>
            {override.compatible_bikes.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </>
      )}
      {(override.dimensions_l_cm || override.dimensions_h_cm || override.dimensions_w_cm) && (
        <p>
          Přesné rozměry brašny v cm: délka {override.dimensions_l_cm ?? "?"}, výška{" "}
          {override.dimensions_h_cm ?? "?"}, šířka {override.dimensions_w_cm ?? "?"}.
        </p>
      )}
      {override.motor_type && <p>Typ pohonu elektrokola: {override.motor_type}.</p>}
      {override.battery_location && <p>Umístění baterie: {override.battery_location}.</p>}
      {override.material && <p>Použitý materiál: {override.material}.</p>}
      {override.touch_film && <p>Dotyková fólie: {override.touch_film}.</p>}
      <p>
        Výrobce: {override.manufacturer ?? "Vapesport"}. Kategorie produktu:{" "}
        {product.categoryLabel}.
      </p>
    </section>
  );
};

export default RagSeoBlock;
