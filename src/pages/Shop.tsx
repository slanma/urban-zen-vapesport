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
import { useProductOverrides } from "@/hooks/useProductOverrides";
import PriceTag from "@/components/PriceTag";

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
    top: "20%",
    left: "62%",
  },
  {
    id: "TopTube",
    label: "Horní trubka",
    ariaDescription: "Zobrazit brašny na horní rámovou trubku",
    top: "34%",
    left: "50%",
  },
  {
    id: "Frame",
    label: "Rám",
    ariaDescription: "Zobrazit brašny do rámového trojúhelníku",
    top: "48%",
    left: "44%",
  },
  {
    id: "UnderSaddle",
    label: "Pod sedlo",
    ariaDescription: "Zobrazit podsedlové brašny",
    top: "23%",
    left: "43%",
  },
  {
    id: "RearRack",
    label: "Nosič",
    ariaDescription: "Zobrazit brašny na zadní nosič",
    top: "33%",
    left: "32%",
  },
];

const Shop = () => {
  const [active, setActive] = useState<Hotspot>("Handlebar");
  const { get } = useProductOverrides();

  const filtered = useMemo(
    () => getProductsByHotspot(active).filter((p) => get(p.id).visible),
    [active, get],
  );
  const independent = useMemo(
    () => getProductsByHotspot("None").filter((p) => get(p.id).visible),
    [get],
  );

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
        <div
          className="relative w-full aspect-[16/9] mx-auto select-none"
          role="group"
          aria-label="Body na elektrokole představující umístění brašen"
        >
          <img
            src={ebikeSilhouette}
            alt="Boční profil elektrokola s vyznačenými místy pro brašny"
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />

          {dots.map((d, idx) => {
            const isActive = active === d.id;
            return (
              <div
                key={d.id}
                className="absolute"
                style={{ top: d.top, left: d.left }}
              >
                <button
                  type="button"
                  aria-label={`${d.label}: ${d.ariaDescription}`}
                  aria-pressed={isActive}
                  aria-describedby="hotspot-status"
                  onClick={() => setActive(d.id)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                      e.preventDefault();
                      setActive(dots[(idx + 1) % dots.length].id);
                    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                      e.preventDefault();
                      setActive(dots[(idx - 1 + dots.length) % dots.length].id);
                    } else if (e.key === "Home") {
                      e.preventDefault();
                      setActive(dots[0].id);
                    } else if (e.key === "End") {
                      e.preventDefault();
                      setActive(dots[dots.length - 1].id);
                    }
                  }}
                  className="relative w-11 h-11 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer group rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {!isActive && (
                    <span aria-hidden="true" className="absolute inset-2 rounded-full border-2 border-primary animate-ping opacity-40" />
                  )}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-3 rounded-full border-2 transition-colors ${
                      isActive
                        ? "border-primary bg-primary"
                        : "border-primary bg-background/80 group-hover:bg-primary/20"
                    }`}
                  />
                  <span
                    aria-hidden="true"
                    className={`relative w-2.5 h-2.5 rounded-full transition-colors ${
                      isActive ? "bg-primary-foreground" : "bg-primary"
                    }`}
                  />
                </button>
                <span
                  aria-hidden="true"
                  className={`hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 mt-5 whitespace-nowrap text-[11px] font-body font-semibold px-2 py-0.5 rounded shadow-sm pointer-events-none ${
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
        <div
          className="flex flex-wrap justify-center gap-2 mt-8"
          role="tablist"
          aria-label="Vyberte umístění brašny na kole"
        >
          {dots.map((d) => {
            const isActive = active === d.id;
            return (
              <button
                key={d.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={d.ariaDescription}
                onClick={() => setActive(d.id)}
                className={`min-h-11 px-4 py-2 rounded-full text-sm font-body font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-foreground hover:bg-accent"
                }`}
              >
                {d.label}
              </button>
            );
          })}
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
                  <div className="flex items-center justify-between mt-auto gap-3">
                    <PriceTag
                      retailGross={get(product.id).price_override ?? product.price}
                      b2bNet={get(product.id).b2b_price ?? null}
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
                    <PriceTag
                      retailGross={get(product.id).price_override ?? product.price}
                      b2bNet={get(product.id).b2b_price ?? null}
                      size="md"
                    />
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
