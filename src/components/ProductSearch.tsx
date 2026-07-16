import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, Sparkles } from "lucide-react";

import { products, type Product } from "@/data/products";
import { buildSearchIndex, smartSearch } from "@/lib/smartSearch";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { getPrimaryImage } from "@/lib/productImages";
import { applyProductOverride, getProductCode } from "@/lib/effectiveProduct";
import { RichText } from "@/lib/richText";
import PriceTag from "@/components/PriceTag";
import FeatureBadges from "@/components/FeatureBadges";
import ColorSwatchRow from "@/components/product/ColorSwatchRow";

const QUICK_TAGS: { label: string; q: string }[] = [
  { label: "Do rámu", q: "do rámu" },
  { label: "Na řídítka", q: "na řídítka" },
  { label: "Na představec", q: "představec" },
  { label: "Pod sedlo", q: "pod sedlo" },
  { label: "Na nosič", q: "nosič" },
  { label: "Na telefon", q: "na telefon" },
  { label: "Na navigaci", q: "navigace" },
  { label: "S dotykovou fólií", q: "dotyková fólie" },
  { label: "Na e-bike nabíječku", q: "na nabíječku" },
  { label: "Na pláštěnku", q: "pláštěnka" },
  { label: "Nepromokavá", q: "nepromokavá" },
];

/**
 * Vyhledávání produktů (zatím klasické, do budoucna AI).
 * Zobrazuje se nad interaktivním kolem. Výsledky se ukážou až po zadání dotazu.
 */
const ProductSearch = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { get: getOverride } = useProductOverrides();

  const productCode = (p: Product): string => getProductCode(p).trim().toUpperCase();

  const visibleProducts = useMemo(
    () =>
      products
        .filter((p) => getOverride(p.id).visible)
        .map((p) => applyProductOverride(p, getOverride(p.id))),
    [getOverride],
  );
  const searchIndex = useMemo(() => buildSearchIndex(visibleProducts), [visibleProducts]);
  const filtered = useMemo(
    () => {
      const base = query.trim() ? smartSearch(searchIndex, query) : [];
      return [...base].sort(
        (a, b) => Number(b.category === "morseo-evo") - Number(a.category === "morseo-evo"),
      );
    },
    [searchIndex, query],
  );

  // Přesná shoda kódu (např. „M411104") → rovnou na detail produktu.
  useEffect(() => {
    const q = query.trim();
    if (!q || q.length < 3) return;
    const exact = visibleProducts.find((p) => productCode(p) === q.toUpperCase());
    if (exact) navigate(`/produkt/${exact.id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <section className="px-6 lg:px-12 max-w-[1400px] mx-auto pt-28 pb-4">
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Najděte svou brašnu
          </h2>
          <span className="hidden sm:flex items-center gap-1.5 text-xs font-body font-semibold tracking-wide uppercase text-primary">
            <Sparkles className="w-3.5 h-3.5" /> AI Search
          </span>
        </div>

        <label htmlFor="ai-search" className="sr-only">
          Vyhledávání produktů
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            id="ai-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hledejte podle kódu (např. M411104) nebo přirozeným jazykem…"
            className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-full text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            aria-label="Vyhledávání — kód, umístění nebo účel použití"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_TAGS.map((t) => {
            const isActive = query.trim().toLowerCase() === t.q.toLowerCase();
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => setQuery(isActive ? "" : t.q)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-body font-semibold tracking-wide border transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-foreground border-border hover:border-primary hover:text-primary"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {query.trim() && (
          <p className="mt-3 text-xs font-body text-muted-foreground">
            {filtered.length === 0
              ? "Nic jsme nenašli — zkuste jiný popis (např. „nepromokavá brašna na rám“) nebo kód produktu."
              : `Nalezeno ${filtered.length} ${filtered.length === 1 ? "produkt" : filtered.length < 5 ? "produkty" : "produktů"}.`}
          </p>
        )}
      </div>

      {/* Výsledky — jen když se hledá */}
      {query.trim() && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {filtered.map((product) => (
            <Link
              key={product.id}
              to={`/produkt/${product.id}`}
              className="group flex flex-col bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow duration-300"
            >
              <div className="aspect-square bg-white flex items-center justify-center overflow-hidden p-3">
                <img
                  src={getPrimaryImage(product, getOverride(product.id))}
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
                  features={getOverride(product.id).features_override ?? product.features}
                  className="mb-3"
                  size="sm"
                />
                <ColorSwatchRow
                  colors={getOverride(product.id).colors_override ?? product.available_colors}
                  className="mb-4"
                />
                <div className="flex items-center justify-between mt-auto gap-3">
                  <PriceTag
                    retailGross={getOverride(product.id).price_override ?? product.price}
                    b2bNet={getOverride(product.id).b2b_price ?? null}
                    size="md"
                  />
                  <span className="text-primary flex items-center gap-1 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Detail <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductSearch;
