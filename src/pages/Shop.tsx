import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InteractiveBikeGuide from "@/components/InteractiveBikeGuide";
import ProductSearch from "@/components/ProductSearch";
import { ArrowRight } from "lucide-react";
import {
  HOTSPOT_LABELS,
  getProductsByHotspot,
  type Hotspot,
} from "@/data/productHotspots";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { getPrimaryImage } from "@/lib/productImages";
import { RichText } from "@/lib/richText";
import FeatureBadges from "@/components/FeatureBadges";
import PriceTag from "@/components/PriceTag";
import ColorSwatchRow from "@/components/product/ColorSwatchRow";
import { applyProductOverride } from "@/lib/effectiveProduct";

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
  const [params] = useSearchParams();
  const validHotspots: Hotspot[] = ["Handlebar", "TopTube", "Frame", "UnderSaddle", "RearRack"];
  const requested = params.get("pozice") as Hotspot | null;
  const initialHotspot: Hotspot =
    requested && validHotspots.includes(requested) ? requested : "Handlebar";
  const [active, setActive] = useState<Hotspot>(initialHotspot);
  const { get } = useProductOverrides();

  // Když přijdeme z rozcestníku (?pozice=…), sroluj rovnou ke kolu.
  useEffect(() => {
    if (requested && validHotspots.includes(requested)) {
      document.getElementById("kolo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () =>
      getProductsByHotspot(active)
        .filter((p) => get(p.id).visible)
        .map((p) => applyProductOverride(p, get(p.id))),
    [active, get],
  );
  const independent = useMemo(
    () =>
      getProductsByHotspot("None")
        .filter((p) => get(p.id).visible)
        .map((p) => applyProductOverride(p, get(p.id))),
    [get],
  );

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Vyhledávání (nad kolem) */}
      <ProductSearch />

      {/* Interactive bike guide (shared with B2B) */}
      <section id="kolo" className="pt-6 pb-10 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <InteractiveBikeGuide
          mode="b2c"
          activeHotspot={active}
          onActiveChange={setActive}
        />
        <p id="hotspot-status" className="sr-only" aria-live="polite" aria-atomic="true">
          Vybraná kategorie: {HOTSPOT_LABELS[active]}. {filtered.length}{" "}
          {filtered.length === 1 ? "produkt" : filtered.length < 5 ? "produkty" : "produktů"}.
        </p>
      </section>




      {/* Independent categories (Hotspot: None) */}
      {independent.length > 0 && (
        <section className="px-6 lg:px-12 max-w-[1400px] mx-auto pb-24">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              Další kategorie
            </h2>
            <Link
              to="/obchod"
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
                <div className="aspect-[4/3] bg-white overflow-hidden flex items-center justify-center p-3">
                  <img
                    src={getPrimaryImage(product, get(product.id))}
                    alt={product.name}
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
                    features={get(product.id).features_override ?? product.features}
                    className="mb-3"
                    size="sm"
                  />
                  <ColorSwatchRow
                    colors={get(product.id).colors_override ?? product.available_colors}
                    className="mb-4"
                  />
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
