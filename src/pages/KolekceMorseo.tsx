import { useEffect } from "react";
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

const HERO_TEXT = "#ece8e1";
const HERO_MOSS = "#a8b795";

/* Mechové pozadí hero – „Concrete Nature": brašna posazená na mech. */
const MOSS_BG: React.CSSProperties = {
  backgroundColor: "hsl(135 16% 17%)",
  backgroundImage: [
    "radial-gradient(115% 82% at 72% 120%, hsl(135 15% 42% / 0.55), transparent 58%)",
    "radial-gradient(90% 70% at 12% -12%, hsl(135 17% 25% / 0.9), transparent 55%)",
    "linear-gradient(158deg, hsl(135 17% 14%), hsl(135 15% 22%) 58%, hsl(135 14% 28%))",
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
                style={{ backgroundColor: HERO_TEXT, color: "hsl(135 17% 15%)" }}
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
              {/* mechový podklad pod brašnou */}
              <div
                aria-hidden
                className="absolute bottom-10 w-[80%] h-28 rounded-[50%]"
                style={{
                  background:
                    "radial-gradient(ellipse at center, hsl(135 15% 45% / 0.85), hsl(135 16% 20% / 0) 70%)",
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
