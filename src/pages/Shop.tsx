import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InteractiveBikeGuide from "@/components/InteractiveBikeGuide";
import ProductSearch from "@/components/ProductSearch";
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
import type { Product } from "@/data/products";

/** Pořadí sekcí v celém katalogu (odshora dolů). */
const CATALOG_ORDER: Hotspot[] = [
  "Handlebar",
  "TopTube",
  "Frame",
  "UnderSaddle",
  "RearRack",
  "BatteryCover",
  "None",
];

/** Hotspoty, které mají svůj bod na kole (lze na ně srolovat z kola). */
const BIKE_HOTSPOTS: Hotspot[] = [
  "Handlebar",
  "TopTube",
  "Frame",
  "UnderSaddle",
  "RearRack",
  "BatteryCover",
];

const sectionId = (h: Hotspot) => `kat-${h}`;

/** Srolování na sekci katalogu s odsazením pod fixní navbar. */
const scrollToSection = (h: Hotspot) => {
  const el = document.getElementById(sectionId(h));
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const Shop = () => {
  const [params] = useSearchParams();
  const requested = params.get("pozice") as Hotspot | null;
  const { get } = useProductOverrides();

  // Pro každou pozici vybereme viditelné produkty a sloučíme barevné varianty
  // (MORSEO) do jedné karty podle baseId.
  const catalog = useMemo(() => {
    return CATALOG_ORDER.map((hotspot) => {
      const products = getProductsByHotspot(hotspot)
        .filter((p) => get(p.id).visible)
        .map((p) => applyProductOverride(p, get(p.id)))
        .filter(
          (p, i, arr) =>
            arr.findIndex((x) => (x.baseId ?? x.id) === (p.baseId ?? p.id)) === i,
        );
      return { hotspot, label: HOTSPOT_LABELS[hotspot], products };
    }).filter((s) => s.products.length > 0);
  }, [get]);

  const totalCount = useMemo(
    () => catalog.reduce((sum, s) => sum + s.products.length, 0),
    [catalog],
  );

  // Příchod z rozcestníku (?pozice=…) → sroluj rovnou na danou sekci katalogu.
  useEffect(() => {
    if (requested && BIKE_HOTSPOTS.includes(requested)) {
      // malé zpoždění, ať je sekce vykreslená
      const t = setTimeout(() => scrollToSection(requested), 60);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Vyhledávání (nad kolem) */}
      <ProductSearch />

      {/* Interaktivní kolo — funguje jako vizuální rozcestník do katalogu níže */}
      <section id="kolo" className="pt-6 pb-8 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <InteractiveBikeGuide
          mode="b2c"
          suppressPopup
          onActiveChange={(h) => scrollToSection(h)}
        />
        <p className="sr-only" aria-live="polite">
          Katalog obsahuje {totalCount} produktů.
        </p>
      </section>

      {/* CELÝ KATALOG — všechny cyklo produkty (VAPESPORT i MORSEO) podle pozice */}
      {catalog.map((section) => (
        <section
          key={section.hotspot}
          id={sectionId(section.hotspot)}
          className="scroll-mt-24 px-6 lg:px-12 max-w-[1400px] mx-auto pb-16"
        >
          <div className="flex items-baseline justify-between mb-6 border-b border-border pb-3">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              {section.label}
            </h2>
            <span className="text-sm font-body text-muted-foreground">
              {section.products.length}{" "}
              {section.products.length === 1
                ? "produkt"
                : section.products.length < 5
                  ? "produkty"
                  : "produktů"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {section.products.map((product) => (
              <CatalogCard key={product.id} product={product} get={get} />
            ))}
          </div>
        </section>
      ))}

      <Footer />
    </main>
  );
};

/** Jedna produktová karta v katalogu (sdílený vzhled pro všechny sekce). */
const CatalogCard = ({
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
            b2bNet={ov.b2b_price ?? null}
            size="md"
          />
        </div>
      </div>
    </Link>
  );
};

export default Shop;
