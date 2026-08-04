import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { products, type Product } from "@/data/products";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { getPrimaryImage } from "@/lib/productImages";
import {
  MORSEO_FEATURES,
  KLASIKA_FEATURES,
  type ProductFeature,
} from "@/lib/productFeatures";

/**
 * Mřížka technologií na titulce.
 *
 * Popisky ani ikony se tu už nedefinují — bere se jediný zdroj pravdy
 * `src/lib/productFeatures.ts`, který používá i admin a produktové karty.
 * Dřív byly texty na dvou místech a rozešly se (překlep „Prémiová materiál“).
 */

/** České skloňování: 1 brašna · 2–4 brašny · 0 a 5+ brašen. */
const brasnyLabel = (n: number): string => {
  if (n === 1) return "1 brašna";
  if (n >= 2 && n <= 4) return `${n} brašny`;
  return `${n} brašen`;
};

const FeaturesGrid = () => {
  const { get } = useProductOverrides();
  return (
    <section id="kolekce" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center text-foreground mb-4">
          Technologie, které dělají rozdíl
        </h2>
        <p className="text-muted-foreground text-center text-lg mb-16 max-w-2xl mx-auto">
          Chytré detaily našich brašen prověřené v terénu.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {MORSEO_FEATURES.map((feature) => (
            <FeatureCard key={feature.label} feature={feature} get={get} />
          ))}
        </div>

        <div className="mt-24 pt-16 border-t border-border">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-center text-foreground mb-4">
            Klasika VAPESPORT
          </h3>
          <p className="text-muted-foreground text-center text-lg mb-16 max-w-2xl mx-auto">
            Osvědčené vlastnosti prověřené v terénu.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {KLASIKA_FEATURES.map((feature) => (
              <FeatureCard key={feature.label} feature={feature} get={get} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Klikací technologická karta. Po kliknutí se otevře bublina (popover)
 * se seznamem brašen, které danou technologii mají.
 */
const FeatureCard = ({
  feature,
  get,
}: {
  feature: ProductFeature;
  get: ReturnType<typeof useProductOverrides>["get"];
}) => {
  const { label: title, image, tooltip: description } = feature;

  const matched = useMemo(() => {
    const needle = title.trim().toLowerCase();
    return products
      .filter((p) => get(p.id).visible)
      .filter((p) => {
        const ov = get(p.id);
        const feats = ov.features_override ?? p.features ?? [];
        return feats.some((f) => f.trim().toLowerCase() === needle);
      })
      .filter(
        (p, i, arr) =>
          arr.findIndex((x) => (x.baseId ?? x.id) === (p.baseId ?? p.id)) === i,
      );
  }, [title, get]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group flex flex-col items-center text-center p-6 rounded-2xl bg-card hover:bg-secondary transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="w-20 h-20 rounded-full overflow-hidden mb-5">
            <img src={image} alt={title} className="w-full h-full object-cover" />
          </div>
          <h3 className="font-heading font-semibold text-base text-foreground mb-1">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
          <span className="mt-3 text-xs font-body font-semibold uppercase tracking-wide text-primary">
            {brasnyLabel(matched.length)} →
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-80 max-h-96 overflow-y-auto p-3 z-50">
        <p className="font-heading font-bold text-foreground mb-2">
          {title}{" "}
          <span className="text-muted-foreground font-body font-normal text-sm">
            ({matched.length})
          </span>
        </p>
        {matched.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Zatím žádné brašny s touto technologií.
          </p>
        ) : (
          <ul className="space-y-1">
            {matched.map((p: Product) => (
              <li key={p.id}>
                <Link
                  to={`/produkt/${p.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <img
                    src={getPrimaryImage(p, get(p.id))}
                    alt={p.name}
                    loading="lazy"
                    className="w-12 h-12 object-contain bg-white rounded shrink-0"
                  />
                  <span className="flex-1 text-sm font-body text-foreground leading-snug">
                    {p.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default FeaturesGrid;
