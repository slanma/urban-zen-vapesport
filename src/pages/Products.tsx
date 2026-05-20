import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { products } from "@/data/products";
import { ArrowRight } from "lucide-react";

const Products = () => {
  const [active, setActive] = useState<string>("all");

  // Dynamic tabs built from product categoryLabels (preserves first-seen order)
  const tabs = useMemo(() => {
    const seen = new Set<string>();
    const list: { value: string; label: string }[] = [{ value: "all", label: "Vše" }];
    for (const p of products) {
      if (!seen.has(p.categoryLabel)) {
        seen.add(p.categoryLabel);
        list.push({ value: p.categoryLabel, label: p.categoryLabel });
      }
    }
    return list;
  }, []);

  const filtered =
    active === "all" ? products : products.filter((p) => p.categoryLabel === active);


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

      {/* Tabs */}
      <div className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-10">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActive(tab.value)}
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
