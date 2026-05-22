import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ebikeSilhouette from "@/assets/bike-lineart.png";
import { ArrowRight } from "lucide-react";
import {
  HOTSPOT_LABELS,
  getProductsByHotspot,
  type Hotspot,
} from "@/data/productHotspots";

interface HotspotDot {
  id: Hotspot;
  label: string;
  ariaDescription: string;
  top: string;
  left: string;
}

const dots: HotspotDot[] = [
  {
    id: "Handlebar",
    label: "Řídítka",
    ariaDescription: "Zobrazit brašny montované na řídítka",
    top: "19.5%",
    left: "77%",
  },
  {
    id: "TopTube",
    label: "Horní trubka",
    ariaDescription: "Zobrazit brašny na horní rámovou trubku",
    top: "33%",
    left: "54%",
  },
  {
    id: "Frame",
    label: "Rám",
    ariaDescription: "Zobrazit brašny do rámového trojúhelníku",
    top: "42%",
    left: "51%",
  },
  {
    id: "RearRack",
    label: "Nosič",
    ariaDescription: "Zobrazit brašny na zadní nosič",
    top: "34%",
    left: "28.5%",
  },
];

const Shop = () => {
  const [active, setActive] = useState<Hotspot>("Handlebar");

  const filtered = useMemo(() => getProductsByHotspot(active), [active]);
  const independent = useMemo(() => getProductsByHotspot("None"), []);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero heading */}
      <section className="pt-32 pb-8 px-6 lg:px-12 max-w-[1400px] mx-auto text-center">
        <span className="text-xs font-body font-semibold tracking-[0.25em] uppercase text-muted-foreground">
          Interaktivní průvodce
        </span>
        <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mt-3 text-foreground">
          Kam ji umístíte?
        </h1>
        <p className="font-body text-muted-foreground max-w-xl mx-auto mt-4 text-base leading-relaxed">
          Klikněte na konkrétní místo na kole a zobrazte brašny určené přesně pro
          danou pozici.
        </p>
      </section>

      {/* Bike with hotspots */}
      <section
        className="px-6 lg:px-12 max-w-[1100px] mx-auto pb-10"
        aria-label="Interaktivní výběr brašen podle umístění na elektrokole"
      >
        <div className="relative w-full aspect-[16/9] mx-auto select-none">
          <img
            src={ebikeSilhouette}
            alt="Boční profil elektrokola s vyznačenými místy pro brašny"
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />

          {dots.map((d) => {
            const isActive = active === d.id;
            return (
              <div
                key={d.id}
                className="absolute"
                style={{ top: d.top, left: d.left }}
              >
                <button
                  type="button"
                  aria-label={d.ariaDescription}
                  aria-pressed={isActive}
                  onClick={() => setActive(d.id)}
                  className="relative w-8 h-8 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer group"
                >
                  {!isActive && (
                    <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-40" />
                  )}
                  <span
                    className={`absolute inset-1 rounded-full border-2 transition-colors ${
                      isActive
                        ? "border-primary bg-primary"
                        : "border-primary bg-background/80 group-hover:bg-primary/20"
                    }`}
                  />
                  <span
                    className={`relative w-2.5 h-2.5 rounded-full transition-colors ${
                      isActive ? "bg-primary-foreground" : "bg-primary"
                    }`}
                  />
                </button>
                <span
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 mt-5 whitespace-nowrap text-[11px] font-body font-semibold px-2 py-0.5 rounded shadow-sm pointer-events-none ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-background/90 text-foreground"
                  }`}
                >
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Quick selector */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {dots.map((d) => (
            <button
              key={d.id}
              onClick={() => setActive(d.id)}
              className={`px-4 py-2 rounded-full text-sm font-body font-semibold transition-all ${
                active === d.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-foreground hover:bg-accent"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>

      {/* Filtered products for active hotspot */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto pb-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            {HOTSPOT_LABELS[active]}
          </h2>
          <span className="text-xs font-body text-muted-foreground">
            {filtered.length}{" "}
            {filtered.length === 1
              ? "produkt"
              : filtered.length < 5
                ? "produkty"
                : "produktů"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm font-body text-muted-foreground">
            Pro tuto pozici aktuálně nemáme v nabídce žádný produkt.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <Link
                key={product.id}
                to={`/produkt/${product.id}`}
                className="group flex flex-col bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
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
        )}
      </section>

      {/* Independent categories (Hotspot: None) */}
      {independent.length > 0 && (
        <section className="px-6 lg:px-12 max-w-[1400px] mx-auto pb-24">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              Další kategorie
            </h2>
            <Link
              to="/produkty"
              className="text-sm font-body font-semibold text-primary hover:underline"
            >
              Celý katalog →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {independent.map((product) => (
              <Link
                key={product.id}
                to={`/produkt/${product.id}`}
                className="group flex flex-col bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
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
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
};

export default Shop;
