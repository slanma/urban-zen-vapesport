import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Ruler,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PriceTag from "@/components/PriceTag";
import {
  outdoorProducts,
  getOutdoorSizes,
  matchesUseCase,
  OUTDOOR_USE_CASES,
  type OutdoorUseCase,
} from "@/data/outdoorProducts";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { useCart } from "@/hooks/useCart";
import { getPrimaryImage } from "@/lib/productImages";
import { applyProductOverride, getEffectiveProductCode } from "@/lib/effectiveProduct";

/* Fotky — nahraj do public/images/outdoor/ a přepiš cesty. */
const HERO_IMAGE = "/images/outdoor/hero-outdoor.jpg";
const SHOWCASE_IMAGE = "/images/outdoor/navlek-obycejny-1.jpg";

/**
 * Závoj pod textem hera.
 *
 * Fotka je v dolní části tmavá (černé návleky, kameny), takže tmavý text
 * na ní zmizí. Řešení: světlý pruh zleva doprava — text leží na světlém
 * podkladu, fotka se odkryje v pravé části. Zároveň zůstane čitelná
 * navigace, která má tmavé písmo.
 *
 * DESKTOP: gradient zleva. MOBIL: sloupec je na celou šířku, takže pruh
 * zleva nepomůže — tam se použije svislý závoj.
 */
const HERO_SCRIM_DESKTOP = [
  "linear-gradient(100deg, rgba(238,236,231,0.97) 0%, rgba(238,236,231,0.93) 34%, rgba(238,236,231,0.55) 58%, rgba(238,236,231,0) 78%)",
  "linear-gradient(180deg, rgba(238,236,231,0.85) 0%, rgba(238,236,231,0) 22%)",
].join(", ");

const HERO_SCRIM_MOBILE =
  "linear-gradient(180deg, rgba(238,236,231,0.96) 0%, rgba(238,236,231,0.90) 45%, rgba(238,236,231,0.55) 72%, rgba(238,236,231,0.25) 100%)";

/* Velikostní přehled u velké fotky. Zdroj: list „velikosti" v ceníku. */
const SIZE_OVERVIEW = [
  { size: "M", note: "se zipem · Surflex" },
  { size: "L", note: "všechny modely" },
  { size: "XL", note: "všechny modely" },
  { size: "Uni", note: "dětský · běžky" },
];

/* Reveal: jemné odkrytí při scrollu (stejný vzor jako /kolekce-morseo). */
const Reveal = ({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Důvody ke koupi.
 *
 * POZOR — tvrzení o původu výroby tu ZÁMĚRNĚ NENÍ. U brašen platí, že se
 * nešijí v ČR, a dokud nepotvrdíte, jak to je u návleků, nesmí na web jít
 * „česká výroba". Až to bude potvrzené, přidá se sem další karta.
 */
const REASONS = [
  {
    icon: Sparkles,
    title: "Česká značka od roku 1994",
    text: "Návleky vyvíjíme a prodáváme z Ostravy-Hrabové přes třicet let. Nejsme přeprodejce bezejmenného zboží — za sortimentem stojí konkrétní firma s historií.",
  },
  {
    icon: ShieldCheck,
    title: "Dvě úrovně materiálu",
    text: "Nylon 210 na běžnou turistiku, Surftex 5000 pro vysoké hory a trvalé mokro. Vyberete podle toho, kam opravdu chodíte — ne podle jedné univerzální ceny.",
  },
  {
    icon: Ruler,
    title: "Velikosti včetně dětských",
    text: "M, L a XL u vyšších modelů, jednovelikostní návlek na běžky a samostatná dětská verze. Rodina vyřeší výbavu na jednom místě.",
  },
  {
    icon: Users,
    title: "Poradíme s výběrem osobně",
    text: "Napíšete obvod lýtka a velikost obuvi, my doporučíme model i velikost. Žádný chatbot — odpovídá člověk, který sortiment zná.",
  },
];

const Outdoor = () => {
  const { get } = useProductOverrides();
  const { addItem, openDrawer } = useCart();

  const [use, setUse] = useState<OutdoorUseCase>("vse");

  /* Skryté produkty (admin → viditelnost) na stránku nepatří. */
  const visible = useMemo(
    () => outdoorProducts.filter((p) => get(p.id).visible),
    [get],
  );

  const shown = useMemo(
    () => visible.filter((p) => matchesUseCase(p.id, use)),
    [visible, use],
  );

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* ---------------- HERO ---------------- */}
      <section className="relative">
        <div className="absolute inset-0">
          {/* object-position posouvá noha s návlekem doprava, mimo text */}
          <img
            src={HERO_IMAGE}
            alt="Návleky VAPESPORT v horském terénu"
            className="w-full h-full object-cover object-center lg:object-[68%_50%]"
            loading="eager"
          />
          <div
            aria-hidden
            className="absolute inset-0 lg:hidden"
            style={{ background: HERO_SCRIM_MOBILE }}
          />
          <div
            aria-hidden
            className="absolute inset-0 hidden lg:block"
            style={{ background: HERO_SCRIM_DESKTOP }}
          />
        </div>

        <div className="relative max-w-[1600px] mx-auto px-6 lg:px-12 pt-36 pb-20 md:pt-44 md:pb-28">
          <div className="max-w-2xl">
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[0.95]">
              ODOLNOST DO
              <br />
              KAŽDÉ VÝZVY
            </h1>
            <p className="font-body text-sm md:text-base font-medium uppercase tracking-[0.14em] text-foreground/80 leading-relaxed mt-6 max-w-lg">
              Outdoorové návleky pro turistiku, vysoké hory a běžky
            </p>
            <a
              href="#navleky"
              className="inline-flex items-center gap-2 mt-10 bg-primary text-primary-foreground text-[13px] font-bold uppercase tracking-widest px-7 py-4 rounded-md hover:bg-primary/90 transition-colors"
            >
              Prozkoumat kolekci <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- PROČ NAŠE NÁVLEKY ---------------- */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Fotka na betonu + velikosti pod ní */}
          <Reveal>
            <div className="bg-card border border-border rounded-xl p-6 md:p-8">
              <div className="bg-white rounded-lg overflow-hidden">
                <img
                  src={SHOWCASE_IMAGE}
                  alt="Návlek VAPESPORT na betonovém podstavci"
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Velikosti
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SIZE_OVERVIEW.map((s) => (
                    <div
                      key={s.size}
                      className="border border-border rounded-md px-3 py-3 text-center"
                    >
                      <span className="font-heading text-xl font-bold text-foreground block">
                        {s.size}
                      </span>
                      <span className="font-body text-[11px] text-muted-foreground leading-tight block mt-1">
                        {s.note}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="font-body text-xs text-muted-foreground mt-4">
                  Konkrétní velikosti u každého modelu najdete níže v nabídce.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Důvody */}
          <div>
            <Reveal>
              <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
                Proč VAPESPORT
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-2 mb-8">
                Čtyři důvody, proč vzít návlek od nás
              </h2>
            </Reveal>

            <ul className="space-y-6">
              {REASONS.map((r, i) => (
                <Reveal key={r.title} delay={i * 70}>
                  <li className="flex gap-4 items-start">
                    <div className="shrink-0 w-11 h-11 rounded-full bg-primary/10 text-primary border border-border flex items-center justify-center">
                      <r.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-base font-bold text-foreground">
                        {r.title}
                      </h3>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed mt-1">
                        {r.text}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- NABÍDKA + FILTR ---------------- */}
      <section
        id="navleky"
        className="bg-secondary/40 border-y border-border scroll-mt-20"
      >
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16 md:py-20">
          <div className="mb-8">
            <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
              Nabídka
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-2">
              Návleky VAPESPORT
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mt-3 max-w-xl">
              Vyberte podle toho, kam chodíte. Velikost zvolíte přímo na kartě
              a návlek přidáte do košíku — bez proklikávání.
            </p>
          </div>

          {/* Filtr podle použití */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {OUTDOOR_USE_CASES.map((u) => {
              const count =
                u.id === "vse"
                  ? visible.length
                  : visible.filter((p) => matchesUseCase(p.id, u.id)).length;
              const isActive = use === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUse(u.id)}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border font-body text-[13px] font-semibold transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  }`}
                >
                  {u.label}
                  <span
                    className={`font-mono text-[11px] ${
                      isActive ? "opacity-80" : "text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Karty produktů */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {shown.map((p) => (
              <OutdoorCard
                key={p.id}
                product={p}
                onAdd={(id, qty, size) => {
                  addItem(id, qty, size);
                  openDrawer();
                }}
              />
            ))}
          </div>

          {shown.length === 0 && (
            <p className="font-body text-muted-foreground">
              Pro tento výběr zatím nic nemáme. Zkuste jinou kategorii.
            </p>
          )}
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
              Napište nám obvod lýtka a velikost obuvi — doporučíme model
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

/* ------------------------------------------------------------------ */

/**
 * Karta návleku s výběrem velikosti a přidáním do košíku přímo na místě.
 * Velikost jde do košíku přes stávající pole `color` — je to jediný
 * variantní klíč, který košík, pokladna i objednávky už umí. Jednovelikostní
 * modely posílají null, tedy se chovají jako produkt bez varianty.
 */
const OutdoorCard = ({
  product,
  onAdd,
}: {
  product: (typeof outdoorProducts)[number];
  onAdd: (id: string, qty: number, size: string | null) => void;
}) => {
  const { get } = useProductOverrides();
  const ov = get(product.id);
  /* Úpravy z administrace (název, popis, cena, technologie) musí platit
     i tady, ne jen na detailu produktu — jinak by se texty rozešly. */
  const p = applyProductOverride(product, ov);
  const sizes = getOutdoorSizes(product.id);
  const [size, setSize] = useState<string | null>(sizes[0] ?? null);
  const [added, setAdded] = useState(false);

  const price = p.price;
  const code = getEffectiveProductCode(product, ov);
  const inStock = ov.in_stock;

  const handleAdd = () => {
    onAdd(product.id, 1, size);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
      <Link
        to={`/produkt/${product.id}`}
        className="group block bg-white aspect-square p-5 overflow-hidden"
      >
        <img
          src={getPrimaryImage(p, ov)}
          alt={p.name}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-[1.04] transition-transform duration-300"
        />
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <Link to={`/produkt/${product.id}`}>
          <h3 className="font-heading text-base font-bold text-foreground uppercase tracking-wide leading-snug hover:text-primary transition-colors">
            {p.name}
          </h3>
        </Link>
        <p className="font-mono text-[11px] text-muted-foreground mt-1">
          kód {code}
        </p>
        <p className="font-body text-sm text-muted-foreground leading-relaxed mt-2.5 line-clamp-3">
          {p.shortDescription}
        </p>

        {/* Velikost */}
        <div className="mt-4">
          {sizes.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  className={`min-w-[2.75rem] px-3 py-2 rounded-md border font-body text-sm font-semibold transition-colors ${
                    size === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <p className="font-body text-xs text-muted-foreground">
              Jednovelikostní model
            </p>
          )}
        </div>

        <div className="mt-auto pt-5">
          <PriceTag
            retailGross={price}
            b2bNet={ov.b2b_price ?? p.b2b_price ?? null}
            size="md"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!inStock}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-[13px] font-bold uppercase tracking-widest px-5 py-3 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {added ? (
              <>
                <Check className="w-4 h-4" /> Přidáno
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                {inStock ? "Do košíku" : "Nedostupné"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Outdoor;
