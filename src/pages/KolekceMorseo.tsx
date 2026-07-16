import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { feedProducts } from "@/data/feedProducts";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { getPrimaryImage } from "@/lib/productImages";
import { getProductCutout } from "@/data/productCutouts";
import { matchFeatureBadges } from "@/lib/productFeatures";
import { fmtCZK } from "@/lib/vat";

const HERO_TEXT = "#1b1f1c";
const HERO_MOSS = "#6d7a5b";
const HERO_BTN_TEXT = "#f4f1ea";

/* Světlá „editoriální" hlavička hero – prémiový vzhled, černá brašna vynikne. */
const MOSS_BG: React.CSSProperties = {
  backgroundColor: "#f1eee7",
  backgroundImage: [
    "radial-gradient(100% 80% at 80% 120%, rgba(0,0,0,0.04), transparent 55%)",
    "linear-gradient(158deg, #f4f1ea, #eceae2 60%, #e6e3db)",
  ].join(", "),
};

/* 4 pilíře = technologie společné celé řadě MORSEO. Piktogramy z homepage. */
const PILLAR_TEXT: Record<string, string> = {
  "AquaLock™": "Voděodolný zip i švy. Obsah zůstane v suchu i v prudkém dešti.",
  "E-bikeReady™": "Extra dlouhé silikonové pásky obepnou i široké rámy elektrokol.",
  "GekkoGrip™": "Silikonové pásky drží pevně a šetří lak — lesklý, matný i karbon.",
  "HydroGuard™": "Prémiový materiál odolný vodě i špíně, který drží tvar.",
};
const pillars = matchFeatureBadges([
  "AquaLock™",
  "E-bikeReady™",
  "GekkoGrip™",
  "HydroGuard™",
]);

// Reveal: jemné odkrytí při scrollu (bez extra knihoven)
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

// Morse motiv „VAPE"
const MORSE: Record<string, string> = { V: "...-", A: ".-", P: ".--.", E: "." };
const MorseWord = ({ word = "VAPE" }: { word?: string }) => (
  <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
    {word.split("").map((ch, i) => (
      <div key={i} className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5 h-6">
          {(MORSE[ch] ?? "").split("").map((sym, j) =>
            sym === "." ? (
              <span key={j} className="w-2.5 h-2.5 rounded-full bg-primary" />
            ) : (
              <span key={j} className="w-6 h-2.5 rounded-full bg-primary" />
            ),
          )}
        </div>
        <span className="font-mono text-sm font-bold text-foreground">{ch}</span>
      </div>
    ))}
  </div>
);

const KolekceMorseo = () => {
  const { get } = useProductOverrides();
  const morseo = feedProducts.filter((p) => p.category === "morseo-evo");
  const hero = morseo.find((p) => p.image.includes("/wdb/")) ?? morseo[0];
  const heroImg = hero
    ? getProductCutout(hero.id, hero.baseId) ?? getPrimaryImage(hero, get(hero.id))
    : "";

  useEffect(() => {
    document.title = "Kolekce MORSEO EVO | Vapesport";
    const meta = document.querySelector('meta[name="description"]');
    if (meta)
      meta.setAttribute(
        "content",
        "MORSEO EVO — prémiová řada rámových brašen pro elektrokola. Voděodolný zip a švy, silikonové pásky šetrné k laku, stavěné pro těžké e-kolo i dlouhé trasy.",
      );
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* HERO — brašna posazená na mech */}
      <section style={{ ...MOSS_BG, color: HERO_TEXT }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-12 pt-32 pb-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span
              className="font-body text-[11px] font-bold tracking-[0.28em] uppercase"
              style={{ color: HERO_MOSS }}
            >
              Prémiová řada pro elektrokola
            </span>
            <h1 className="font-heading text-5xl md:text-6xl font-bold tracking-tight mt-4 mb-5">
              MORSEO EVO
            </h1>
            <p className="font-body text-base md:text-lg leading-relaxed opacity-85 max-w-md">
              Rámové brašny pro elektrokola, které drží tvar a nebojí se deště.
              Úzký profil se schová podél baterie, takže nepřekáží při šlapání —
              ať míříte do města, nebo na celý den do terénu.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <a
                href="#kolekce"
                className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: HERO_TEXT, color: HERO_BTN_TEXT }}
              >
                Prohlédnout kolekci <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/obchod"
                className="text-[13px] font-medium uppercase tracking-widest hover:opacity-70 transition-opacity"
                style={{ color: HERO_MOSS }}
              >
                Vybrat podle kola →
              </Link>
            </div>
          </div>

          {hero && (
            <div className="relative flex items-end justify-center min-h-[300px] md:min-h-[360px]">
              {/* jemný podklad pod brašnou */}
              <div
                aria-hidden
                className="absolute bottom-10 w-[80%] h-28 rounded-[50%]"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(0,0,0,0.06), transparent 70%)",
                  filter: "blur(12px)",
                }}
              />
              {/* stín vržený brašnou */}
              <div
                aria-hidden
                className="absolute bottom-12 w-[58%] h-10 rounded-[50%]"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(0,0,0,0.5), transparent 72%)",
                  filter: "blur(14px)",
                }}
              />
              <img
                src={heroImg}
                alt={hero.name}
                className="relative w-full max-w-md object-contain"
                style={{ filter: "drop-shadow(0 24px 28px rgba(0,0,0,0.45))" }}
                loading="eager"
              />
            </div>
          )}
        </div>
      </section>

      {/* PILÍŘE — technologie celé řady MORSEO (piktogramy z homepage) */}
      <section className="border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((b) => (
            <div key={b.label} className="flex flex-col">
              <img
                src={b.image}
                alt={b.label}
                className="w-12 h-12 rounded-full object-cover ring-1 ring-border mb-4"
                loading="lazy"
              />
              <h3 className="font-heading text-base font-bold text-foreground mb-1.5">
                {b.label}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {PILLAR_TEXT[b.label]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* VÝSTAVNÍ GRID */}
      <section id="kolekce" className="max-w-6xl mx-auto px-6 lg:px-12 py-16 scroll-mt-24">
        <div className="mb-10">
          <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
            Kolekce
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-2">
            Všech {morseo.length} kousků MORSEO EVO
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {morseo.map((p) => {
            const ov = get(p.id);
            const price = ov.price_override ?? p.price;
            const badges = matchFeatureBadges(ov.features_override ?? p.features).slice(0, 3);
            return (
              <Link
                key={p.id}
                to={`/produkt/${p.id}`}
                className="group bg-card border border-border rounded-xl overflow-hidden flex flex-col hover:shadow-lg hover:border-[hsl(var(--moss))]/40 transition-all"
              >
                <div className="bg-white aspect-square p-5 overflow-hidden">
                  <img
                    src={getPrimaryImage(p, ov)}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-contain group-hover:scale-[1.04] transition-transform duration-300"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  {badges.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-3">
                      {badges.map((b) => (
                        <img
                          key={b.label}
                          src={b.image}
                          alt={b.label}
                          title={b.label}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-border"
                        />
                      ))}
                    </div>
                  )}
                  <h3 className="font-heading text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {p.name}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mt-1.5 line-clamp-2">
                    {p.shortDescription}
                  </p>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="font-heading text-lg font-bold text-foreground">
                      {fmtCZK(price)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[13px] font-medium text-primary">
                      Detail <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PŘÍBĚH KOLEKCE */}
      <section className="bg-secondary/40 border-t border-border">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16 md:py-24">
          <Reveal>
            <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
              Příběh kolekce
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-2 mb-5">
              Když zákazníci a partneři definují novou éru
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed">
              Skutečné inovace nevznikají v kancelářích, ale na cestách.
              Morseovape je výsledkem otevřeného dialogu s cyklisty i prodejci —
              naslouchali jsme reálným potřebám a přetavili je do nového
              standardu moderního cestování.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h3 className="font-heading text-xl font-bold text-foreground mt-12 mb-5">
              Tři požadavky, které změnily vše
            </h3>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { t: "Žádná velká loga", d: "Moderní cyklista nechce být pojízdná reklama. Hledá čistotu a vizuální klid." },
              { t: "Ochrana rámu", d: "Karbon i hliník jsou drahé a náchylné na oděrky. Brašna musí lak stoprocentně chránit." },
              { t: "Maximální odolnost", d: "Drží tvar, nepromokne a vydrží roky drsného zacházení." },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i * 80}>
                <div className="rounded-2xl border border-border bg-card p-6 h-full">
                  <div className="w-10 h-1.5 rounded-full bg-primary mb-4" />
                  <h4 className="font-heading text-base font-bold text-foreground mb-2">
                    {c.t}
                  </h4>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {c.d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={80}>
            <h3 className="font-heading text-xl font-bold text-foreground mt-14 mb-4">
              Tichá šifra: identita bez křiku
            </h3>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              Jak na brašnu umístit značku VAPE tak, aby byla rozpoznatelná, ale
              nerušila minimalistický vzhled kola? Řešení přišlo v Morseově
              abecedě. Písmena V-A-P-E jsme převedli do decentního geometrického
              vzoru — pro náhodného pozorovatele elegantní struktura materiálu,
              pro zasvěcené skrytý symbol identity.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 inline-block">
              <MorseWord word="VAPE" />
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h3 className="font-heading text-xl font-bold text-foreground mt-14 mb-4">
              Funkční minimalismus a barevná harmonie
            </h3>
            <p className="font-body text-muted-foreground leading-relaxed">
              Vlajkovou lodí je{" "}
              <strong className="text-foreground font-semibold">
                celočerná varianta
              </strong>{" "}
              — nejpraktičtější, nejodolnější a esteticky nejčistší. Pro ty, kdo
              chtějí kolo jemně oživit, máme promyšlené barevné varianty, které
              s kolem ladí a nepůsobí rušivě. A lak drahých rámů chrání speciální
              šetrné úchyty.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <blockquote className="my-14 border-l-4 border-primary pl-6 py-1">
              <p className="font-heading text-xl md:text-2xl font-bold text-foreground leading-snug">
                Morseovape dnes najdete v prémiových showroomech — vedle
                špičkových světových značek kol a elektrokol.
              </p>
            </blockquote>
          </Reveal>

          <Reveal delay={80}>
            <h3 className="font-heading text-xl font-bold text-foreground mb-4">
              Společný růst — víc než produkt v regálu
            </h3>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              Spolupráci nebereme jako jednorázový obchod, ale jako dlouhodobé
              spojenectví. Partnerům pomáháme zjednodušit každodenní kontakt se
              zákazníkem — zkušenostmi, moderními prezentačními nástroji i
              podporou digitální viditelnosti. Věříme, že největší hodnotou
              cyklistického světa jsou lokální specializované obchody, kam se
              zákazníci rádi vracejí.
            </p>
            <Link
              to="/aplikace-a-sluzby"
              className="inline-flex items-center gap-2 text-primary font-body font-semibold hover:gap-3 transition-all"
            >
              Služby pro prodejny a servisy <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ZÁVĚREČNÁ CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">
              Nevíte, která sedne vašemu kolu?
            </h2>
            <p className="font-body text-sm md:text-base opacity-85 mt-2 max-w-lg">
              Vyberte brašnu podle místa na kole — v interaktivním průvodci.
            </p>
          </div>
          <Link
            to="/obchod"
            className="inline-flex items-center gap-2 bg-primary-foreground text-primary text-[13px] font-bold uppercase tracking-widest px-6 py-3 rounded-md hover:opacity-90 transition-opacity shrink-0"
          >
            Vybrat podle kola <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default KolekceMorseo;
