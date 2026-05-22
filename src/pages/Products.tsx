import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { isMorseoProduct, products } from "@/data/products";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { buildSearchIndex, smartSearch } from "@/lib/smartSearch";
import { useProductOverrides } from "@/hooks/useProductOverrides";

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

  const tabs = useMemo(() => {
    const seen = new Set<string>();
    const list: { value: string; label: string }[] = [
      { value: "all", label: "Vše" },
      { value: "morseo", label: "MORSEO" },
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

  const categoryFiltered = useMemo(() => {
    if (active === "all") return searchIndex;
    if (active === "morseo") return searchIndex.filter(isMorseoProduct);
    return searchIndex.filter((p) => p.categoryLabel === active);
  }, [active, searchIndex]);

  const filtered = useMemo(
    () => (query.trim() ? smartSearch(categoryFiltered, query) : categoryFiltered),
    [categoryFiltered, query],
  );

  const onQueryChange = (value: string) => {
    setQuery(value);
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };


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
      <div className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-6">
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
            placeholder="Napište, co hledáte (např. brašna na řídítka pro e-bike)..."
            className="w-full pl-12 pr-32 py-4 bg-card border border-border rounded-full text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            aria-label="AI vyhledávání produktů přirozeným jazykem"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 text-[11px] font-body font-semibold tracking-wide uppercase text-primary">
            <Sparkles className="w-3.5 h-3.5" /> AI Search
          </span>
        </div>
        {query.trim() && (
          <p className="mt-2 px-2 text-xs font-body text-muted-foreground">
            {filtered.length === 0
              ? "Nic jsme nenašli — zkuste jiný popis (např. „nepromokavá brašna na rám“)."
              : `Nalezeno ${filtered.length} ${filtered.length === 1 ? "produkt" : filtered.length < 5 ? "produkty" : "produktů"}.`}
          </p>
        )}
      </div>

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
                  src={product.image}
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
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-heading text-xl font-bold text-foreground">
                    {product.price.toLocaleString("cs-CZ")}&nbsp;Kč
                  </span>
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
