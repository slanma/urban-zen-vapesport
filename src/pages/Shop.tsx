import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Bike } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InteractiveBikeGuide from "@/components/InteractiveBikeGuide";
import ProductSearch from "@/components/ProductSearch";
import { getProductsByCategory, getProductsByHotspot, HOTSPOT_LABELS, type Hotspot } from "@/data/productHotspots";
import { getBikeType, productMatchesBikeType } from "@/data/bikeTypes";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { getPrimaryImage } from "@/lib/productImages";
import { RichText } from "@/lib/richText";
import FeatureBadges from "@/components/FeatureBadges";
import PriceTag from "@/components/PriceTag";
import ColorSwatchRow from "@/components/product/ColorSwatchRow";
import { applyProductOverride } from "@/lib/effectiveProduct";
import type { Product } from "@/data/products";

/**
 * Katalog je řazený podle KATEGORIÍ brašen (dle zadání Lucie).
 * MORSEOVAPE není samostatná kategorie – MORSEO má vlastní stránku
 * (/kolekce-morseo). MORSEO produkty se ale zobrazí tam, kam spadají
 * podle své kategorie (např. „Brašny na mobilní telefony").
 */
const CATALOG: { id: string; label: string }[] = [
  { id: "elektrokolo", label: "Brašny pro ELEKTROKOLO" },
  { id: "kolobezky", label: "Brašny na KOLOBĚŽKY" },
  { id: "mobil", label: "Brašny na mobilní telefony" },
  { id: "nosic", label: "Brašny na nosič" },
  { id: "riditka", label: "Brašny na řídítka" },
  { id: "podsedlo", label: "Brašny pod sedlo" },
  { id: "ramove", label: "Rámové brašny" },
  { id: "batohy", label: "Batohy" },
  { id: "doplnky", label: "Doplňky k brašnám" },
];

const sectionId = (id: string) => `kat-${id}`;

const scrollToCat = (id: string) => {
  const el = document.getElementById(sectionId(id));
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

/** Návrat nahoru k vyhledávání a kolu (jednoduchá verze pro ťukání). */
const scrollToBike = () =>
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

const Shop = () => {
  const [params] = useSearchParams();
  const requested = params.get("pozice") as Hotspot | null;
  const kolo = params.get("kolo");
  const bikeType = getBikeType(kolo);
  const { get } = useProductOverrides();
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  // Plovoucí tlačítko „Zpět na kolo" se ukáže, až se uživatel odroluje
  // mezi produkty (pryč od kola nahoře).
  const [showBackToBike, setShowBackToBike] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowBackToBike(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pro každou kategorii: viditelné produkty, barevné varianty (MORSEO)
  // sloučené do jedné karty podle baseId.
  const refine = (list: Product[]) =>
    list
      .filter((p) => get(p.id).visible)
      .filter((p) =>
        bikeType ? productMatchesBikeType(p.baseId ?? p.id, bikeType.id) : true,
      )
      .map((p) => applyProductOverride(p, get(p.id)))
      .filter(
        (p, i, arr) =>
          arr.findIndex((x) => (x.baseId ?? x.id) === (p.baseId ?? p.id)) === i,
      )
      .sort((a, b) => Number(b.category === "morseo-evo") - Number(a.category === "morseo-evo"));

  const catalog = useMemo(() => {
    // Klik na místo na kole → jen brašny pro tuto pozici (stejně jako u B2B)
    if (activeHotspot) {
      const products = refine(getProductsByHotspot(activeHotspot));
      return [{ id: "pozice", label: `Brašny pro: ${HOTSPOT_LABELS[activeHotspot]}`, products }]
        .filter((s) => s.products.length > 0);
    }
    return CATALOG.map((cat) => ({ ...cat, products: refine(getProductsByCategory(cat.label)) }))
      .filter((s) => s.products.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [get, bikeType, activeHotspot]);

  const totalCount = useMemo(
    () => catalog.reduce((sum, s) => sum + s.products.length, 0),
    [catalog],
  );

  // Příchod z rozcestníku / kola (?pozice=…) → skok na odpovídající kategorii.
  useEffect(() => {
    if (requested) {
      setActiveHotspot(requested);
      const t = setTimeout(() => scrollToCat("pozice"), 80);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Vyhledávání (nad kolem) */}
      <ProductSearch />

      {/* Interaktivní kolo — vizuální rozcestník do katalogu níže */}
      <section id="kolo" className="pt-6 pb-8 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <InteractiveBikeGuide
          mode="b2c"
          suppressPopup
          onActiveChange={(h) => {
            setActiveHotspot(h);
            setTimeout(() => scrollToCat("pozice"), 60);
          }}
        />
        <p className="sr-only" aria-live="polite">
          Katalog obsahuje {totalCount} produktů.
        </p>
      </section>

      {/* Aktivní filtr podle pozice na kole */}
      {activeHotspot && (
        <div className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-secondary/50 px-5 py-3">
            <p className="font-body text-sm text-foreground">
              Zobrazeny brašny pro:{" "}
              <span className="font-heading font-bold">{HOTSPOT_LABELS[activeHotspot]}</span>
            </p>
            <button
              type="button"
              onClick={() => setActiveHotspot(null)}
              className="text-sm font-body font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              Zobrazit všechny brašny
            </button>
          </div>
        </div>
      )}

      {/* Aktivní filtr podle typu kola */}
      {bikeType && (
        <div className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-secondary/50 px-5 py-3">
            <p className="font-body text-sm text-foreground">
              Brašny pro:{" "}
              <span className="font-heading font-bold">{bikeType.label}</span>
            </p>
            <Link
              to="/obchod"
              className="text-sm font-body font-semibold text-primary underline underline-offset-4 hover:opacity-80"
            >
              Zobrazit všechny brašny
            </Link>
          </div>
        </div>
      )}

      {/* Rychlá lišta kategorií — přehled + skok na sekci */}
      {catalog.length > 0 && (
        <nav
          aria-label="Kategorie brašen"
          className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-4"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {catalog.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollToCat(s.id)}
                className="px-4 py-2 rounded-full text-sm font-body font-semibold bg-secondary text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {s.label}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* CELÝ KATALOG — podle kategorií brašen (VAPESPORT i MORSEO) */}
      {catalog.map((section) => (
        <section
          key={section.id}
          id={sectionId(section.id)}
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

      {/* Plovoucí tlačítko zpět na kolo / vyhledávání */}
      {showBackToBike && (
        <button
          type="button"
          onClick={scrollToBike}
          aria-label="Zpět nahoru na kolo a vyhledávání"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground font-body font-semibold text-sm shadow-lg hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <Bike className="w-4 h-4" />
          Zpět na kolo
        </button>
      )}

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
