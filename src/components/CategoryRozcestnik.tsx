import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { BIKE_TYPES, productMatchesBikeType, productBikeTypes } from "@/data/bikeTypes";
import { products } from "@/data/products";
import type { Product } from "@/data/products";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { getPrimaryImage } from "@/lib/productImages";
import { RichText } from "@/lib/richText";
import { fixWidows } from "@/lib/typografie";
import FeatureBadges from "@/components/FeatureBadges";
import PriceTag from "@/components/PriceTag";
import ColorSwatchRow from "@/components/product/ColorSwatchRow";
import { applyProductOverride } from "@/lib/effectiveProduct";

/**
 * Rozcestník „Vyberte si podle typu kola" pro úvodní stránku.
 * Klik na kartu kola rozbalí PŘÍMO POD kartami brašny pasující k danému kolu
 * (bez odskoku do obchodu). Produkt vede na svůj detail.
 */
const CategoryRozcestnik = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const { get } = useProductOverrides();
  const panelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const bikeType = BIKE_TYPES.find((b) => b.id === selected) ?? null;

  const matching = useMemo(() => {
    if (!bikeType) return [];
    return products
      .filter((p) => get(p.id).visible)
      .filter((p) => productMatchesBikeType(p.baseId ?? p.id, bikeType.id))
      .map((p) => applyProductOverride(p, get(p.id)))
      .filter(
        (p, i, arr) =>
          arr.findIndex((x) => (x.baseId ?? x.id) === (p.baseId ?? p.id)) === i,
      )
      .sort((a, b) => {
        // 1) MORSEO kolekce první (jako v rozcestníku)
        const morseo =
          Number(b.category === "morseo-evo") - Number(a.category === "morseo-evo");
        if (morseo !== 0) return morseo;
        // 2) od nejspecifičtějších (nejméně typů kol) po univerzální (nejvíce typů)
        const na = (productBikeTypes[a.baseId ?? a.id] ?? []).length;
        const nb = (productBikeTypes[b.baseId ?? b.id] ?? []).length;
        return na - nb;
      });
  }, [bikeType, get]);

  const handleSelect = (id: string) => {
    const next = selected === id ? null : id;
    setSelected(next);
    setTimeout(() => {
      // otevření → sjede na produkty; sbalení → zpět na rozcestník kol
      const target = next ? panelRef.current : gridRef.current;
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const handleClose = () => {
    setSelected(null);
    setTimeout(() => {
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  return (
    <section className="px-6 lg:px-12 max-w-[1400px] mx-auto py-16 md:py-20">
      <div className="mb-8">
        <span className="text-xs font-body font-semibold tracking-[0.25em] uppercase text-muted-foreground">
          Rozcestník
        </span>
        <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight mt-2 text-foreground">
          {fixWidows("Vyberte si podle typu kola")}
        </h2>
      </div>

      <div ref={gridRef} className="scroll-mt-24 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {BIKE_TYPES.map((bt) => {
          const active = selected === bt.id;
          return (
            <button
              key={bt.id}
              type="button"
              onClick={() => handleSelect(bt.id)}
              aria-pressed={active}
              className={`group relative flex flex-col text-left overflow-hidden rounded-2xl border bg-secondary/40 transition-all duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                active
                  ? "border-primary ring-2 ring-primary shadow-xl"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                <img
                  src={bt.image}
                  alt={bt.label}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="p-5 flex flex-col gap-2 flex-1">
                <h3 lang="cs" className="font-heading text-base md:text-lg font-bold leading-snug text-foreground break-words hyphens-auto">
                  {bt.label}
                </h3>
                <p className="text-sm font-body text-muted-foreground leading-relaxed flex-1">
                  {fixWidows(bt.subtitle)}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-body font-semibold tracking-wide uppercase text-primary mt-2">
                  {active ? "Skrýt brašny" : "Zobrazit brašny"}{" "}
                  <ArrowRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      active ? "rotate-90" : "group-hover:translate-x-1"
                    }`}
                  />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Rozbalený panel s brašnami pro vybraný typ kola */}
      {bikeType && (
        <div ref={panelRef} className="scroll-mt-24 mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-border pb-3">
            <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground">
              Brašny pro: {bikeType.label}{" "}
              <span className="text-muted-foreground font-body text-base font-normal">
                ({matching.length})
              </span>
            </h3>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 text-sm font-body font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              <X className="w-4 h-4" />
              Zavřít
            </button>
          </div>

          {matching.length === 0 ? (
            <p className="font-body text-muted-foreground">
              Pro tento typ kola zatím nemáme přiřazené žádné brašny.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {matching.map((product) => (
                <RozcestnikCard key={product.id} product={product} get={get} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

/** Produktová karta v rozbaleném panelu (vede na detail produktu). */
const RozcestnikCard = ({
  product,
  get,
}: {
  product: Product;
  get: ReturnType<typeof useProductOverrides>["get"];
}) => {
  const ov = get(product.id);
  return (
    <Link
      to={`/produkt/${product.id}`}
      className="group flex flex-col bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow duration-300"
    >
      <div className="aspect-[4/3] bg-white overflow-hidden flex items-center justify-center p-3">
        <img
          src={getPrimaryImage(product, ov)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <span className="text-[10px] font-body font-bold tracking-[0.2em] uppercase text-primary mb-2">
          {product.categoryLabel}
        </span>
        <h3 className="font-heading text-lg font-bold text-foreground leading-snug mb-1">
          {product.name}
        </h3>
        <RichText
          as="p"
          className="text-sm font-body text-muted-foreground leading-relaxed mb-3 flex-1"
          text={product.shortDescription}
        />
        <FeatureBadges
          features={ov.features_override ?? product.features}
          className="mb-3"
          size="sm"
        />
        <ColorSwatchRow
          colors={ov.colors_override ?? product.available_colors}
          className="mb-4"
        />
        <div className="flex items-center justify-between mt-auto">
          <PriceTag
            retailGross={ov.price_override ?? product.price}
            b2bNet={ov.b2b_price ?? product.b2b_price ?? null}
            size="md"
          />
        </div>
      </div>
    </Link>
  );
};

export default CategoryRozcestnik;
