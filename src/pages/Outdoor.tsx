import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Anchor,
  ArrowRight,
  Check,
  Layers,
  Mail,
  Phone,
  Loader2,
  Ruler,
  Scissors,
  ShoppingCart,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PriceTag from "@/components/PriceTag";
import ProblemSolutionBullets from "@/components/product/ProblemSolutionBullets";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  outdoorProducts,
  getOutdoorSizes,
  matchesUseCase,
  CUSTOM_GAITER,
  OUTDOOR_USE_CASES,
  type OutdoorUseCase,
} from "@/data/outdoorProducts";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { useCart } from "@/hooks/useCart";
import { getPrimaryImage } from "@/lib/productImages";
import { applyProductOverride, getEffectiveProductCode } from "@/lib/effectiveProduct";
import { fmtCZK, grossFromNet } from "@/lib/vat";

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

/* Kontakt pro dotaz na velikost. Shodné údaje jako v patičce webu. */
const PHONE = "+420606080922";
const PHONE_LABEL = "+420 606 080 922";
const EMAIL = "info@vapesport.cz";

/* Předplněný e-mail — zákazník nemusí vymýšlet, co napsat, a nám přijde
   dotaz s údaji, které k doporučení velikosti opravdu potřebujeme. */
const MAIL_HREF =
  `mailto:${EMAIL}` +
  `?subject=${encodeURIComponent("Dotaz na velikost návleku")}` +
  `&body=${encodeURIComponent(
    [
      "Dobrý den,",
      "",
      "poradíte mi prosím s velikostí návleku?",
      "",
      "Obvod lýtka (cm): ",
      "Velikost obuvi (EU): ",
      "Na co návlek chci (turistika / vysoké hory / běžky): ",
      "",
      "Děkuji",
    ].join("\n"),
  )}`;

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
 * Čtyři pilíře hodnoty. Text dodán zadavatelem 18. 8. 2026 — nesahat na
 * formulace bez jeho vědomí. Původ výroby (Ostrava) je tím potvrzený,
 * u brašen naopak dál platí, že se v ČR nešijí.
 */
const REASONS = [
  {
    icon: Scissors,
    title: "Šijeme přímo v Ostravě od roku 1994",
    text: "Nejsme přeprodejci anonymního dovozu z katalogu. Návleky sami navrhujeme, testujeme a šijeme v Ostravě-Hrabové už přes 30 let. Známe každý šev, popruh i sponu.",
  },
  {
    icon: Ruler,
    title: "Ušijeme návleky i na míru (asymetrie / širší lýtka)",
    text: "Nesedí vám konfekce, máte silnější lýtka, ortézu nebo atypické boty? Protože držíme celou výrobu pod vlastní střechou, dokážeme upravit střih a ušít návleky přesně podle vašich mír.",
  },
  {
    icon: Anchor,
    title: "Funkční konstrukce, co drží na noze",
    text: "Přední kovový háček do tkaniček, nastavitelný podvlekový popruh s bočními sponami a horní stahovací guma. Návlek nepovolí, neposouvá se nahoru a dokonale uzavře prostor proti vodě, sněhu i jehličí.",
  },
  {
    icon: Layers,
    title: "Volba materiálu podle reálného terénu",
    text: "Pevný a nepromokavý Nylon 210 na běžné chození, houbaření a les, nebo funkční membrána Surftex 5000 s reflexním pruhem do Alp, Tater a náročných celodenních výšlapů, kde se noha nesmí zapařit.",
  },
];

const Outdoor = () => {
  const { get } = useProductOverrides();
  const { addItem, openDrawer } = useCart();

  const [use, setUse] = useState<OutdoorUseCase>("vse");
  const [helpOpen, setHelpOpen] = useState(false);

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
              Odolné návleky na boty do mokré trávy, hlubokého sněhu
              i vysokohorského terénu.
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
                Proč vzít návleky od nás
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

      {/* ---------------- NÁVLEK NA MÍRU ---------------- */}
      <CustomGaiterSection />

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
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="inline-flex items-center gap-2 bg-primary-foreground text-primary text-[13px] font-bold uppercase tracking-widest px-6 py-3 rounded-md hover:opacity-90 transition-opacity shrink-0"
          >
            Zeptat se <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Okno s přímou akcí — zavolat nebo napsat. Dřív tady byl jen odkaz
          na kontaktní stránku, což byl krok navíc bez užitku. */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              Poradíme s velikostí
            </DialogTitle>
            <DialogDescription className="font-body">
              Řekněte nám obvod lýtka a velikost obuvi. Doporučíme model
              i velikost — odpovídá člověk, ne robot.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 mt-2">
            <a
              href={`tel:${PHONE}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:border-primary transition-colors"
            >
              <span className="shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-heading text-sm font-bold text-foreground">
                  Zavolat
                </span>
                <span className="block font-body text-sm text-muted-foreground">
                  {PHONE_LABEL} · Po–Pá 9:00–14:00
                </span>
              </span>
            </a>

            <a
              href={MAIL_HREF}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:border-primary transition-colors"
            >
              <span className="shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-heading text-sm font-bold text-foreground">
                  Napsat e-mail
                </span>
                <span className="block font-body text-sm text-muted-foreground break-all">
                  {EMAIL}
                </span>
              </span>
            </a>
          </div>

          <p className="font-body text-xs text-muted-foreground mt-1">
            E-mail se otevře s předplněnými otázkami, stačí doplnit čísla.{" "}
            <Link
              to="/kontakt"
              className="text-primary underline underline-offset-2"
              onClick={() => setHelpOpen(false)}
            >
              Celý kontakt
            </Link>
          </p>
        </DialogContent>
      </Dialog>

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

/* ------------------------------------------------------------------ */

/**
 * Sekce „Návlek na míru" s poptávkovým formulářem.
 *
 * Posílá se na /api/poptavka — stejné potrubí, jaké používá stránka
 * Aplikace a služby, takže poptávka přijde do Admin → Poptávky a nevzniká
 * druhý systém, který by se musel hlídat.
 *
 * ZÁMĚRNĚ SE NEPTÁME NA DŮVOD. K ušití stačí obvod, výška a typ obuvi.
 * Kdybychom se ptali „proč", začnou lidé psát diagnózy a v systému vzniknou
 * zdravotní údaje — zvláštní kategorie podle GDPR s přísnějším režimem.
 */
const CustomGaiterSection = () => {
  const fromGross = grossFromNet(CUSTOM_GAITER.fromNet);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    material: CUSTOM_GAITER.materials[0] as string,
    calf: "",
    height: "",
    shoes: "",
    message: "",
    hp: "",
  });
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setErr("");
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErr("Vyplňte prosím platný e-mail, ať se vám můžeme ozvat.");
      return;
    }
    if (!form.calf.trim() || !form.shoes.trim()) {
      setErr(
        "Doplňte prosím obvod lýtka a velikost obuvi — bez nich střih neurčíme.",
      );
      return;
    }
    if (!consent) {
      setErr("Pro odeslání je potřeba souhlas se zpracováním údajů.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/poptavka", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          company: form.name,
          email: form.email,
          phone: form.phone,
          web: "",
          hp: form.hp,
          message: [
            `Materiál: ${form.material}`,
            `Obvod lýtka v nejsilnějším místě: ${form.calf}`,
            `Požadovaná výška návleku: ${form.height || "neuvedeno"}`,
            `Typ / velikost obuvi: ${form.shoes}`,
            "",
            form.message,
          ]
            .join("\n")
            .trim(),
          services: [
            {
              name: `Návlek na míru — ${form.material}`,
              price: `od ${fmtCZK(CUSTOM_GAITER.fromNet)} bez DPH`,
            },
          ],
          price_once: CUSTOM_GAITER.fromNet,
          price_month: 0,
          has_custom: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Odeslání selhalo");
      setSent(true);
    } catch (e: any) {
      setErr(e?.message || "Odeslání se nepodařilo. Zkuste to prosím znovu.");
    } finally {
      setSending(false);
    }
  };

  const field =
    "w-full rounded-md border border-border bg-background px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

  return (
    <section id="na-miru" className="scroll-mt-20">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Text */}
          <div>
            <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
              {CUSTOM_GAITER.subtitle}
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-2">
              {CUSTOM_GAITER.title}
            </h2>
            <p className="font-heading text-xl font-bold text-foreground mt-4">
              od {fmtCZK(fromGross)}{" "}
              <span className="font-body text-sm font-normal text-muted-foreground">
                s DPH ({fmtCZK(CUSTOM_GAITER.fromNet)} bez DPH)
              </span>
            </p>
            <p className="font-body text-xs text-muted-foreground mt-1">
              Konečnou cenu potvrdíme podle rozměrů, než začneme šít.
            </p>

            <figure className="mt-8">
              <img
                src={CUSTOM_GAITER.image}
                alt="Materiál, spony a popruhy pro šití návleků na míru"
                className="w-full rounded-xl border border-border"
                loading="lazy"
              />
              <figcaption className="font-body text-xs text-muted-foreground mt-2">
                Materiál, spony a popruhy z naší ostravské dílny.
              </figcaption>
            </figure>

            <p className="font-body text-muted-foreground leading-relaxed mt-8">
              {CUSTOM_GAITER.popis}
            </p>
            <div className="mt-7 pt-7 border-t border-border">
              <ProblemSolutionBullets
                problem={CUSTOM_GAITER.problem}
                fn={CUSTOM_GAITER.funkce}
                usage={CUSTOM_GAITER.pouziti}
              />
            </div>
          </div>

          {/* Formulář */}
          <div className="bg-card border border-border rounded-xl p-6 md:p-8 lg:sticky lg:top-24">
            {sent ? (
              <div className="text-center py-10">
                <span className="inline-flex w-12 h-12 rounded-full bg-primary/10 text-primary items-center justify-center">
                  <Check className="w-6 h-6" />
                </span>
                <h3 className="font-heading text-xl font-bold text-foreground mt-4">
                  Poptávka odeslána
                </h3>
                <p className="font-body text-sm text-muted-foreground mt-2">
                  Ozveme se s cenou a termínem, obvykle do dvou pracovních dnů.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Nezávazná poptávka
                </h3>
                <p className="font-body text-sm text-muted-foreground mt-1 mb-5">
                  Pošlete míry, my spočítáme cenu a termín. Nic tím
                  neobjednáváte.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Materiál
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {CUSTOM_GAITER.materials.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => set("material", m)}
                          aria-pressed={form.material === m}
                          className={`px-4 py-2 rounded-md border font-body text-sm font-semibold transition-colors ${
                            form.material === m
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-foreground hover:border-primary/50"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Míry
                    </label>
                    <p className="font-body text-xs text-muted-foreground mt-1 mb-2">
                      Stačí v centimetrech, měřte přes nohavici a obutou botu.
                      Když si nebudete jistí, dopište to do poznámky a doladíme
                      to spolu.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        className={field}
                        placeholder="Obvod lýtka v nejsilnějším místě (cm) *"
                        value={form.calf}
                        onChange={(e) => set("calf", e.target.value)}
                      />
                      <input
                        className={field}
                        placeholder="Typ a velikost obuvi (EU) *"
                        value={form.shoes}
                        onChange={(e) => set("shoes", e.target.value)}
                      />
                    </div>
                    <input
                      className={`${field} mt-3`}
                      placeholder="Požadovaná výška návleku (cm)"
                      value={form.height}
                      onChange={(e) => set("height", e.target.value)}
                    />
                  </div>

                  <div className="pt-2 border-t border-border" />

                  <input
                    className={field}
                    placeholder="Jméno nebo firma"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      className={field}
                      type="email"
                      placeholder="E-mail *"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                    <input
                      className={field}
                      placeholder="Telefon"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </div>
                  <textarea
                    className={`${field} min-h-[90px]`}
                    placeholder="Poznámka — typ boty, zapínání se zipem či bez, cokoli dalšího"
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                  />

                  {/* past na roboty — člověk toto pole nevidí */}
                  <input
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.hp}
                    onChange={(e) => set("hp", e.target.value)}
                  />

                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 accent-[hsl(var(--primary))]"
                    />
                    <span className="font-body text-xs text-muted-foreground">
                      Souhlasím se zpracováním údajů pro vyřízení této poptávky.{" "}
                      <Link
                        to="/ochrana-udaju"
                        className="text-primary underline underline-offset-2"
                      >
                        Ochrana osobních údajů
                      </Link>
                    </span>
                  </label>

                  {err && (
                    <p className="font-body text-sm text-destructive">{err}</p>
                  )}

                  <button
                    type="button"
                    onClick={submit}
                    disabled={sending}
                    className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-[13px] font-bold uppercase tracking-widest px-6 py-3.5 rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Odesílám
                      </>
                    ) : (
                      <>
                        Poslat poptávku <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Outdoor;
