import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { BIKE_TYPES } from "@/data/bikeTypes";

/**
 * Rozcestník „Vyberte si podle typu kola" pro úvodní stránku.
 * Každá karta = typ kola (foto v /public/images/kola). Klik vede do obchodu
 * s katalogem přefiltrovaným na brašny pasující k danému kolu (?kolo=<id>).
 */
const CategoryRozcestnik = () => {
  return (
    <section className="px-6 lg:px-12 max-w-[1400px] mx-auto py-16 md:py-20">
      <div className="mb-8">
        <span className="text-xs font-body font-semibold tracking-[0.25em] uppercase text-muted-foreground">
          Rozcestník
        </span>
        <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight mt-2 text-foreground">
          Vyberte si podle typu kola
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {BIKE_TYPES.map((bt) => (
          <Link
            key={bt.id}
            to={`/obchod?kolo=${bt.id}`}
            className="group relative flex flex-col text-left overflow-hidden rounded-2xl border border-border bg-secondary/40 transition-all duration-300 hover:shadow-xl hover:border-foreground/30"
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
              <h3 className="font-heading text-lg font-bold leading-snug text-foreground">
                {bt.label}
              </h3>
              <p className="text-sm font-body text-muted-foreground leading-relaxed flex-1">
                {bt.subtitle}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-body font-semibold tracking-wide uppercase text-primary mt-2">
                Zobrazit brašny{" "}
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryRozcestnik;
