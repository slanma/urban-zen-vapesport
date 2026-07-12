import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { products } from "@/data/products";
import { PILLARS, pickPillarImage } from "@/lib/productPillars";

// Kam každá dlaždice vede: pozice v obchodě, Gravel na prémiové MORSEO.
const TARGET: Record<string, string> = {
  ridi: "/obchod?pozice=Handlebar",
  ram: "/obchod?pozice=Frame",
  sedlo: "/obchod?pozice=UnderSaddle",
  gravel: "/kolekce-morseo",
};

/**
 * Rozcestník „Vyberte si podle stylu jízdy" pro úvodní stránku.
 * Dlaždice vedou do obchodu (interaktivní kolo).
 */
const CategoryRozcestnik = () => {
  return (
    <section className="px-6 lg:px-12 max-w-[1400px] mx-auto py-16 md:py-20">
      <div className="mb-8">
        <span className="text-xs font-body font-semibold tracking-[0.25em] uppercase text-muted-foreground">
          Rozcestník
        </span>
        <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight mt-2 text-foreground">
          Vyberte si podle stylu jízdy
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PILLARS.map((pillar) => {
          const img = pickPillarImage(pillar, products);
          return (
            <Link
              key={pillar.key}
              to={TARGET[pillar.key] ?? "/obchod"}
              className="group relative flex flex-col text-left overflow-hidden rounded-2xl border border-border bg-secondary/40 transition-all duration-300 hover:shadow-xl hover:border-foreground/30"
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
                  Zobrazit{" "}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryRozcestnik;
