import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { products, type Product } from "@/data/products";
import { ArrowRight, Search, Sparkles, X } from "lucide-react";
import { buildSearchIndex, smartSearch } from "@/lib/smartSearch";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { getPrimaryImage } from "@/lib/productImages";
import PriceTag from "@/components/PriceTag";
import { PILLARS, getPillar, pickPillarImage, type PillarKey } from "@/lib/productPillars";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const normalizeCategory = (value: string | null) =>
    value === "MORSEO EVO" || value === "MORSEO" ? "morseo" : value ?? "all";
  const initial = normalizeCategory(searchParams.get("kategorie"));
  const [active, setActive] = useState<string>(initial);
  const [query, setQuery] = useState<string>(searchParams.get("q") ?? "");

  useEffect(() => {
    setActive(normalizeCategory(searchParams.get("kategorie")));
  }, [searchParams]);

  const selectTab = (value: string) => {
    setActive(value);
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("kategorie");
    else next.set("kategorie", value);
    setSearchParams(next);
  };

  const productCode = (p: Product): string => {
    const spec = p.specs.find((s) => s.label === "Kód produktu");
    return (spec?.value ?? "").trim().toUpperCase();
  };
  const isMorseovapeProduct = (p: Product) => productCode(p).startsWith("M");

  const tabs = useMemo(() => {
    const seen = new Set<string>();
    const list: { value: string; label: string }[] = [
      { value: "all", label: "Vše" },
      { value: "morseo", label: "MORSEOVAPE" },
    ];
    for (const p of products) {
      if (!seen.has(p.categoryLabel)) {
        seen.add(p.categoryLabel);
        list.push({ value: p.categoryLabel, label: p.categoryLabel });
      }
    }
    return list;
  }, []);

  const { get: getOverride } = useProductOverrides();
  const visibleProducts = useMemo(
    () => products.filter((p) => getOverride(p.id).visible),
    [getOverride],
  );
  const searchIndex = useMemo(() => buildSearchIndex(visibleProducts), [visibleProducts]);

  const pillarKey = (searchParams.get("pilir") as PillarKey | null) ?? null;
  const activePillar = useMemo(() => getPillar(pillarKey), [pillarKey]);

  const selectPillar = (key: PillarKey | null) => {
    const next = new URLSearchParams(searchParams);
    if (key) next.set("pilir", key);
    else next.delete("pilir");
    setSearchParams(next);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const categoryFiltered = useMemo(() => {
    let list = searchIndex;
    if (activePillar) list = list.filter(activePillar.match);
    if (active === "all") return list;
    if (active === "morseo") return list.filter(isMorseovapeProduct);
    return list.filter((p) => p.categoryLabel === active);
  }, [active, searchIndex, activePillar]);

  const filtered = useMemo(
    () => (query.trim() ? smartSearch(categoryFiltered, query) : categoryFiltered),
    [categoryFiltered, query],
  );


  // Exact product-code match → redirect straight to PDP (e.g. "M411104").
  const navigate = useNavigate();
  useEffect(() => {
    const q = query.trim();
    if (!q || q.length < 3) return;
    const upper = q.toUpperCase();
    const exact = products.find((p) => productCode(p) === upper);
    if (exact) {
      navigate(`/produkt/${exact.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const onQueryChange = (value: string) => {
    setQuery(value);
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };

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



  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero / header */}
      <section className="pt-32 pb-12 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <span className="text-xs font-body font-semibold tracking-[0.25em] uppercase text-muted-foreground">
          Katalog produktů
        </span>
        <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mt-3 text-foreground">
          Naše brašny
        </h1>
        <p className="font-body text-muted-foreground max-w-xl mt-4 text-base leading-relaxed">
          Od prémiové řady MORSEO EVO pro elektrokola po osvědčené klasiky VAPE
          LEGENDS — najděte ideální brašnu pro váš styl jízdy.
        </p>
      </section>

      {/* AI Search */}
      <div className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-10">
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
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Hledejte podle kódu (např. M411104) nebo přirozeným jazykem…"
              className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-full text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              aria-label="Inteligentní vyhledávání — kód, umístění nebo účel použití"
            />
          </div>

          {/* Quick intent tags — placement & utility */}
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_TAGS.map((t) => {
              const isActive = query.trim().toLowerCase() === t.q.toLowerCase();
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => onQueryChange(isActive ? "" : t.q)}
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
      </div>

      {/* Visual Category Architecture — 4 pillars */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto pb-14">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <span className="text-xs font-body font-semibold tracking-[0.25em] uppercase text-muted-foreground">
              Rozcestník
            </span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight mt-2 text-foreground">
              Vyberte si podle stylu jízdy
            </h2>
          </div>
          {activePillar && (
            <button
              onClick={() => selectPillar(null)}
              className="inline-flex items-center gap-2 text-xs font-body font-semibold tracking-wide uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Zrušit filtr „{activePillar.title}"
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar) => {
            const img = pickPillarImage(pillar, visibleProducts);
            const isActive = activePillar?.key === pillar.key;
            return (
              <button
                key={pillar.key}
                onClick={() => selectPillar(isActive ? null : pillar.key)}
                aria-pressed={isActive}
                className={`group relative flex flex-col text-left overflow-hidden rounded-2xl border bg-secondary/40 transition-all duration-300 hover:shadow-xl ${
                  isActive
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  {img && (
                    <img
                      src={img}
                      alt={pillar.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  )}
                </div>
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <h3 className="font-heading text-lg font-bold leading-snug text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="text-sm font-body text-muted-foreground leading-relaxed flex-1">
                    {pillar.subtitle}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-body font-semibold tracking-wide uppercase text-primary mt-2">
                    {isActive ? "Vybráno" : "Zobrazit"}{" "}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>


      {/* Tabs */}

      {/* Tabs */}
      <div className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-10">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => selectTab(tab.value)}
              className={`
                px-5 py-2.5 text-sm font-body font-semibold tracking-wide rounded-full transition-all
                ${
                  active === tab.value
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-foreground hover:bg-accent"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <Link
              key={product.id}
              to={`/produkt/${product.id}`}
              className="group flex flex-col bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow duration-300"
            >
              {/* Image */}
              <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
                <img
                  src={getPrimaryImage(product, getOverride(product.id))}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col flex-1">
                <span className="text-[10px] font-body font-bold tracking-[0.2em] uppercase text-primary mb-2">
                  {product.categoryLabel}
                </span>
                <h3 className="font-heading text-lg font-bold text-foreground leading-snug mb-1">
                  {product.name}
                </h3>
                <p className="text-sm font-body text-muted-foreground leading-relaxed mb-4 flex-1">
                  {product.shortDescription}
                </p>
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
      </section>

      <Footer />
    </main>
  );
};

export default Products;
