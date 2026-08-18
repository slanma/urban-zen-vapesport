import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeatureBadges from "@/components/FeatureBadges";
import PriceTag from "@/components/PriceTag";
import ProblemSolutionBullets from "@/components/product/ProblemSolutionBullets";
import QuantitySelector from "@/components/product/QuantitySelector";
import { outdoorProducts, OUTDOOR_SIZES } from "@/data/outdoorProducts";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { useCart } from "@/hooks/useCart";
import { getEffectiveGallery, getPrimaryImage } from "@/lib/productImages";
import { getEffectiveProductCode } from "@/lib/effectiveProduct";
import { fmtCZK } from "@/lib/vat";

/* Hero fotka — nahraj do public/images/outdoor/ a přepiš cestu.
   Doporučení: šířka min. 2400 px, tmavší dolní část, klidná horní část
   (v horní části leží průhledný Navbar s tmavým textem). */
const HERO_IMAGE = "/images/outdoor/hero-outdoor.jpg";

/* Světlý závoj pod navigací — Navbar má text-foreground (tmavý), takže
   na fotce potřebuje světlý podklad, jinak by byl nečitelný. */
const HERO_SCRIM =
  "linear-gradient(180deg, rgba(240,238,232,0.96) 0%, rgba(240,238,232,0.72) 18%, rgba(240,238,232,0.15) 42%, rgba(0,0,0,0.05) 100%)";

const Outdoor = () => {
  const { get } = useProductOverrides();
  const { addItem, openDrawer } = useCart();

  /* Skryté produkty (admin → viditelnost) na stránku nepatří. */
  const items = useMemo(
    () => outdoorProducts.filter((p) => get(p.id).visible),
    [get],
  );

  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const active = items.find((p) => p.id === activeId) ?? items[0];

  const [size, setSize] = useState<string>(OUTDOOR_SIZES[1]);
  const [qty, setQty] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);
  const [added, setAdded] = useState(false);

  /* Přepnutí produktu = reset galerie, velikosti a počtu. */
  useEffect(() => {
    setImgIndex(0);
    setQty(1);
    setSize(OUTDOOR_SIZES[1]);
    setAdded(false);
  }, [activeId]);

  if (!active) return null;

  const ov = get(active.id);
  const gallery = getEffectiveGallery(active, ov);
  const price = ov.price_override ?? active.price;
  const features = ov.features_override ?? active.features;
  const code = getEffectiveProductCode(active, ov);
  const inStock = ov.in_stock;

  const handleAdd = () => {
    /* Velikost jde do košíku přes stávající pole `color` — je to jediný
       variantní klíč, který košík, pokladna i objednávky už umí. Nezavádíme
       druhý mechanismus, aby se nerozbil odladěný checkout. */
    addItem(active.id, qty, size);
    setAdded(true);
    openDrawer();
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* ---------------- HERO ---------------- */}
      <section className="relative">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Návleky VAPESPORT v horském terénu"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div aria-hidden className="absolute inset-0" style={{ background: HERO_SCRIM }} />
        </div>

        <div className="relative max-w-[1600px] mx-auto px-6 lg:px-12 pt-36 pb-20 md:pt-44 md:pb-28">
          <div className="max-w-2xl">
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[0.95]">
              ODOLNOST DO
              <br />
              KAŽDÉ VÝZVY
            </h1>
            <p className="font-body text-sm md:text-base font-medium uppercase tracking-[0.14em] text-foreground/80 leading-relaxed mt-6 max-w-lg">
              Outdoorové návleky a technická výbava pro turistiku, trekking
              a běžky
            </p>
            <a
              href="#nabidka"
              className="inline-flex items-center gap-2 mt-10 bg-primary text-primary-foreground text-[13px] font-bold uppercase tracking-widest px-7 py-4 rounded-md hover:bg-primary/90 transition-colors"
            >
              Prozkoumat kolekci <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- NABÍDKA ---------------- */}
      <section
        id="nabidka"
        className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16 md:py-20 scroll-mt-20"
      >
        <div className="mb-10">
          <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
            Outdoor
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-2">
            Nabídka návleků
          </h2>
          <p className="font-body text-muted-foreground leading-relaxed mt-3 max-w-xl">
            Vyberte střih podle terénu a použití. Vpravo se zobrazí detail
            s výběrem velikosti a možností přidat do košíku.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* --- Levý sloupec: dlaždice produktů --- */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {items.map((p) => {
              const pov = get(p.id);
              const isActive = p.id === active.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveId(p.id)}
                  aria-pressed={isActive}
                  className={`group text-left bg-card border rounded-xl overflow-hidden flex flex-col transition-all ${
                    isActive
                      ? "border-primary ring-2 ring-primary/25 shadow-md"
                      : "border-border hover:border-[hsl(var(--moss))]/40 hover:shadow-lg"
                  }`}
                >
                  <div className="bg-white aspect-square p-5 overflow-hidden">
                    <img
                      src={getPrimaryImage(p, pov)}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-contain group-hover:scale-[1.04] transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-heading text-base font-bold text-foreground uppercase tracking-wide leading-snug">
                      {p.name}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed mt-1.5 line-clamp-2">
                      {p.shortDescription}
                    </p>
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="font-heading text-base font-bold text-foreground">
                        {fmtCZK(pov.price_override ?? p.price)}
                      </span>
                      <span className="font-body text-[13px] font-medium text-primary">
                        {isActive ? "Vybráno" : "Zobrazit"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* --- Pravý sloupec: detail vybraného návleku --- */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-card border border-border rounded-xl p-6 md:p-7">
              {/* Hlavní fotka */}
              <div className="bg-white rounded-lg aspect-square p-6 overflow-hidden">
                <img
                  src={gallery[imgIndex] ?? gallery[0]}
                  alt={active.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>

              {/* Miniatury */}
              {gallery.length > 1 && (
                <div className="flex items-center gap-2 mt-3">
                  {gallery.slice(0, 5).map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      onClick={() => setImgIndex(i)}
                      aria-label={`Fotka ${i + 1}`}
                      className={`w-16 h-16 bg-white rounded-md overflow-hidden border p-1.5 transition-colors ${
                        i === imgIndex
                          ? "border-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Název + technologie */}
              <h3 className="font-heading text-xl font-bold text-foreground uppercase tracking-wide mt-6">
                {active.name}
              </h3>
              <FeatureBadges features={features} className="mt-4" size="md" />

              {/* Cena + kód */}
              <div className="mt-6 pt-6 border-t border-border">
                <PriceTag
                  retailGross={price}
                  b2bNet={ov.b2b_price ?? active.b2b_price ?? null}
                  size="lg"
                />
                <p className="font-mono text-xs text-muted-foreground mt-2">
                  kód: {code}
                </p>
              </div>

              {/* Velikost */}
              <div className="mt-6">
                <p className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                  Velikost
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {OUTDOOR_SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      aria-pressed={size === s}
                      className={`min-w-[3.25rem] px-4 py-2.5 rounded-md border font-body text-sm font-semibold transition-colors ${
                        size === s
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Počet + do košíku */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <QuantitySelector value={qty} onChange={setQty} />
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!inStock}
                  className="flex-1 min-w-[12rem] inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-[13px] font-bold uppercase tracking-widest px-6 py-3.5 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" /> Přidáno
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      {inStock ? "Přidat do košíku" : "Nedostupné"}
                    </>
                  )}
                </button>
              </div>

              {/* Problém / Funkce / Použití */}
              <div className="mt-7 pt-7 border-t border-border">
                <ProblemSolutionBullets
                  problem={active.problem ?? null}
                  fn={active.funkce ?? null}
                  usage={active.pouziti ?? null}
                />
              </div>

              <Link
                to={`/produkt/${active.id}`}
                className="inline-flex items-center gap-2 mt-7 text-primary font-body font-semibold hover:gap-3 transition-all"
              >
                Celý detail produktu <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------------- ZÁVĚREČNÁ CTA ---------------- */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">
              Nevíte, která velikost je vaše?
            </h2>
            <p className="font-body text-sm md:text-base opacity-85 mt-2 max-w-lg">
              Napište nám obvod lýtka a velikost obuvi — doporučíme střih
              i velikost.
            </p>
          </div>
          <Link
            to="/kontakt"
            className="inline-flex items-center gap-2 bg-primary-foreground text-primary text-[13px] font-bold uppercase tracking-widest px-6 py-3 rounded-md hover:opacity-90 transition-opacity shrink-0"
          >
            Zeptat se <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Outdoor;
