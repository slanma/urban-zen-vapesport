import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Droplets, ShieldCheck, Hand, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { feedProducts } from "@/data/feedProducts";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { getPrimaryImage } from "@/lib/productImages";
import { matchFeatureBadges } from "@/lib/productFeatures";
import { fmtCZK } from "@/lib/vat";

const HERO_BG = "#1c1b19";
const HERO_TEXT = "#ece8e1";
const HERO_MOSS = "#93a17f";

const pillars = [
  { Icon: Droplets, title: "100% nepromokavé", text: "Vysokofrekvenčně svařované švy. Nenateče ani kapka." },
  { Icon: Hand, title: "GekkoGrip™ pásky", text: "Silikonové pásky drží pevně a jsou šetrné k laku i karbonu." },
  { Icon: Zap, title: "Stavěné pro e-kola", text: "Extra dlouhé pásky a tvar, který mine baterii i tlumič." },
  { Icon: ShieldCheck, title: "Dotykové ovládání", text: "Prémiová slída — navigace i telefon po ruce za jízdy." },
];

const KolekceMorseo = () => {
  const { get } = useProductOverrides();
  const morseo = feedProducts.filter((p) => p.category === "morseo-evo");
  const hero = morseo.find((p) => p.image.includes("/wdb/")) ?? morseo[0];

  useEffect(() => {
    document.title = "Kolekce MORSEO EVO | Vapesport";
    const meta = document.querySelector('meta[name="description"]');
    if (meta)
      meta.setAttribute(
        "content",
        "MORSEO EVO — prémiová řada brašen pro elektrokola. 100% nepromokavé švy, silikonové pásky šetrné k laku, dotykové ovládání za jízdy.",
      );
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* HERO — tmavý blackout band */}
      <section style={{ backgroundColor: HERO_BG, color: HERO_TEXT }}>
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
            <p className="font-body text-base md:text-lg leading-relaxed opacity-80 max-w-md">
              Vyztužené brašny, které drží tvar, mizí za baterií a nebojí se
              deště. Prémiová řada stavěná pro těžké e-kolo i dlouhé trasy.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <a
                href="#kolekce"
                className="inline-flex items-center gap-2 text-[#1c1b19] text-[13px] font-bold uppercase tracking-widest px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: HERO_TEXT }}
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
            <div className="flex justify-center">
              <div className="w-full max-w-sm aspect-square bg-white rounded-xl p-6 flex items-center justify-center">
                <img
                  src={getPrimaryImage(hero, get(hero.id))}
                  alt={hero.name}
                  className="w-full h-full object-contain"
                  loading="eager"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PILÍŘE — prémiový slib */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map(({ Icon, title, text }) => (
            <div key={title} className="flex flex-col">
              <div className="w-11 h-11 rounded-full bg-[hsl(var(--moss))]/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" strokeWidth={1.6} />
              </div>
              <h3 className="font-heading text-base font-bold text-foreground mb-1.5">
                {title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {text}
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
