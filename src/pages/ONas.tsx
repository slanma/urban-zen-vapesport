import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Reveal: prvek se jemně odkryje při scrollu (bez extra knihoven)
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

// Morse motiv pro „VAPE" (V ...- / A .- / P .--. / E .)
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

const STATS = [
  { num: "1994", label: "rok založení" },
  { num: "3", label: "dekády zkušeností" },
  { num: "2", label: "generace" },
];

const ONas = () => {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative px-6 lg:px-12 pt-32 pb-16 md:pt-40 md:pb-20">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.5]"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, #F2F0EA 0%, #EFECE6 45%, #E4E1D9 100%)",
          }}
        />
        <div className="max-w-[1000px] mx-auto text-center">
          <Reveal>
            <span className="inline-block text-xs font-body font-semibold tracking-[0.3em] uppercase text-primary mb-5">
              Příběh značky · od roku 1994
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-[1.05] mb-6">
              Dvě generace,
              <br />
              jedna vášeň pro dokonalost
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="font-body text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Náš příběh není jen kronikou jedné dílny. Je to cesta, kde se
              potkává nezničitelné řemeslo zrozené z extrémní sportovní zátěže
              90. let s moderním vizionářstvím a designovým purismem 21. století.
              Vznikla tak značka, která nepotřebuje křičet, aby byla vidět.
            </p>
          </Reveal>
        </div>
      </section>

      {/* EVOLUCE – dočasně vynecháno (doplní se později) */}

      {/* STATISTIKY */}
      <section className="px-6 lg:px-12 py-12">
        <div className="max-w-[900px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <div className="text-center rounded-2xl border border-border bg-card py-7 px-4 h-full flex flex-col justify-center">
                <div className="font-heading text-3xl md:text-4xl font-bold text-primary">
                  {s.num}
                </div>
                <div className="mt-2 font-body text-xs md:text-sm text-muted-foreground leading-snug">
                  {s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* KAPITOLA 1994 */}
      <section className="px-6 lg:px-12 py-16 md:py-24">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid md:grid-cols-[160px_1fr] gap-6 md:gap-12">
            <Reveal>
              <div className="font-mono text-primary font-bold text-2xl md:sticky md:top-28">
                1994
              </div>
            </Reveal>
            <div>
              <Reveal>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-5">
                  Zrozeno v extrémní zátěži
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p className="font-body text-muted-foreground leading-relaxed mb-4">
                  Vše začalo z čisté mechanické nutnosti. Zakladatel{" "}
                  <strong className="text-foreground font-semibold">Petr Vlach</strong>{" "}
                  propadl triatlonu a extrémním závodům typu „Železňák"
                  (Ironman). Na trhu tehdy neexistovala výbava, na kterou by se
                  dalo stoprocentně spolehnout. Co si sportovec nevezl bezpečně
                  uchycené a chráněné před živly, to v krizové chvíli jednoduše
                  neměl.
                </p>
              </Reveal>
              <Reveal delay={120}>
                <blockquote className="my-8 border-l-4 border-primary pl-5 py-1">
                  <p className="font-heading text-xl md:text-2xl font-bold text-foreground leading-snug">
                    Jediné pravidlo od prvního dne: brašna nesmí selhat.
                  </p>
                </blockquote>
              </Reveal>
              <Reveal delay={80}>
                <p className="font-body text-muted-foreground leading-relaxed mb-6">
                  V malé pronajaté dílně v Radvanicích začal Petr se dvěma
                  šičkami a jedním řezáčem psát historii. A odkud se vzalo jméno?
                </p>
              </Reveal>
              <Reveal delay={100}>
                <div className="rounded-2xl bg-secondary/60 border border-border p-6 mb-6 text-center">
                  <div className="font-heading text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                    <span className="text-primary">V</span>l<span className="text-primary">a</span>ch{" "}
                    <span className="text-primary">Pe</span>tr
                  </div>
                  <div className="mt-2 font-mono text-sm text-muted-foreground">
                    →{" "}
                    <span className="text-foreground font-bold">V</span>&nbsp;+&nbsp;
                    <span className="text-foreground font-bold">A</span>&nbsp;+&nbsp;
                    <span className="text-foreground font-bold">PE</span> ={" "}
                    <span className="text-foreground font-bold">VAPE</span>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <p className="font-body text-muted-foreground leading-relaxed">
                  Vizuální identita se postupně vyvíjela – od prvního dýhovaného
                  loga přes motiv horských štítů až k čistému reflexnímu „V".
                  Kvalita ale zůstávala neměnná. Právě díky té neústupnosti
                  Vapesport přežil i dobu, kdy trh zaplavil levný asijský dovoz –
                  a udržel si důvěru specializovaných cykloprodejen.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* NOVÁ ÉRA */}
      <section className="px-6 lg:px-12 py-16 md:py-24 bg-secondary/40">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid md:grid-cols-[160px_1fr] gap-6 md:gap-12">
            <Reveal>
              <div className="font-mono text-primary font-bold text-lg md:sticky md:top-28 uppercase">
                Nová éra
              </div>
            </Reveal>
            <div>
              <Reveal>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-5">
                  Estetika, e-mobilita a Urban Zen
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p className="font-body text-muted-foreground leading-relaxed mb-4">
                  Skutečná proměna z odolného doplňku na prémiový lifestylový
                  brand přišla s druhou generací. Zatímco první éra položila
                  základy hrubé mechanické odolnosti a řemesla, druhá generace
                  vtiskla značce to, co moderní cyklistika vyžaduje: vizi, systém
                  a minimalistickou estetiku. Design celé nové kolekce má dnes na
                  starosti <strong className="text-foreground font-semibold">Lucka</strong>.
                </p>
              </Reveal>
              <Reveal delay={100}>
                <blockquote className="my-8 border-l-4 border-primary pl-5 py-1">
                  <p className="font-heading text-xl md:text-2xl font-bold text-foreground leading-snug">
                    Nezaplavujeme trh masovou produkcí. Vracíme se k podstatě,
                    k detailu a k čisté radosti z jízdy.
                  </p>
                </blockquote>
              </Reveal>
              <Reveal delay={80}>
                <p className="font-body text-muted-foreground leading-relaxed">
                  Koncept <em>Urban Zen</em> propojuje syrovou technickou
                  dokonalost s elegantním, čistým vzhledem. Naše brašny dnes
                  dokonale ladí s liniemi moderních elektrokol, koloběžek i
                  expedičních speciálů.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* MORSEOVAPE */}
      <section className="px-6 lg:px-12 py-16 md:py-24">
        <div className="max-w-[1000px] mx-auto">
          <Reveal>
            <span className="inline-block text-xs font-body font-semibold tracking-[0.3em] uppercase text-primary mb-3">
              Spojení dvou světů
            </span>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-6">
              Kolekce Morseovape
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="font-body text-muted-foreground leading-relaxed max-w-2xl mb-8">
              Vznikla z otevřeného dialogu se zákazníky a partnery – z reálných
              potřeb cyklistů i prodejců. A název? Ten je do designu elegantně
              zašifrovaný Morseovou abecedou:
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 mb-10 inline-block">
              <MorseWord word="VAPE" />
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { t: "Bez velkých log", d: "Žádná pojízdná reklama – čistý, klidný vzhled, který nekřičí." },
              { t: "Ochrana rámu", d: "Šetrné úchyty chrání lak drahých karbonových i hliníkových rámů." },
              { t: "Maximální odolnost", d: "Drží tvar, nepromokne a vydrží roky drsného zacházení." },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i * 90}>
                <div className="rounded-2xl border border-border bg-card p-6 h-full">
                  <div className="w-10 h-1.5 rounded-full bg-primary mb-4" />
                  <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                    {c.t}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {c.d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <div className="mt-10">
              <Link
                to="/kolekce-morseo"
                className="inline-flex items-center gap-2 text-primary font-body font-semibold hover:gap-3 transition-all"
              >
                Celý příběh kolekce Morseovape
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ZÁVĚR / CTA */}
      <section className="px-6 lg:px-12 py-20 md:py-28">
        <div className="max-w-[900px] mx-auto text-center">
          <Reveal>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground leading-tight mb-5">
              Ocelová tradice.
              <br />
              Moderní vize.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="font-body text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Stavíme na třech dekádách zkušeností, ale díváme se pevně do
              budoucnosti. Jsme důkazem, že když se spojí ocelová tradice s
              moderní vizí, vznikají věci, které vydrží celý život.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/kolekce-morseo"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-6 py-3 rounded-full hover:bg-primary/90 transition-colors"
              >
                Prozkoumat kolekci Morseovape
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/obchod"
                className="inline-flex items-center justify-center gap-2 border border-border text-foreground font-body font-semibold px-6 py-3 rounded-full hover:bg-secondary transition-colors"
              >
                Do e-shopu
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default ONas;
