import { useState } from "react";
import { X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Chapter {
  id: string;
  num: string;
  title: string;
  image: string;
  short: string;
  long: string;
}

/**
 * Časová osa loga VAPESPORT v reálném pořadí (dle Lucie).
 * Roky zatím záměrně vynechané – doplní se později.
 * Texty jsou stručné návrhy k doladění.
 */
const CHAPTERS: Chapter[] = [
  {
    id: "gwc",
    num: "01",
    title: "GWC – Golden World Club",
    image: "/images/o-nas/01-gwc.jpg",
    short: "Úplné začátky. Klubové logo Golden World Club a obrysové VAPE SPORT na fialovém podkladu.",
    long: "Kde to celé začalo – oválné logo „Golden World Club“ a obrysové VAPE SPORT na fialovém materiálu. První poctivé brašny, které daly značce jméno.",
  },
  {
    id: "hvezdicka",
    num: "02",
    title: "VAPE SPORT s hvězdičkou",
    image: "/images/o-nas/02-hvezdicka.jpg",
    short: "Barevné VAPE SPORT s hvězdičkou na tmavě modrém podkladu.",
    long: "Výraznější éra – barevné VAPE SPORT s hvězdičkou uprostřed na tmavě modrém podkladu. Značka začala mít svůj rozpoznatelný rukopis.",
  },
  {
    id: "hvezdicka-v2",
    num: "03",
    title: "Barevná verze 2",
    image: "/images/o-nas/03-hvezdicka-v2.jpg",
    short: "Druhá, barevnější varianta loga na černém podkladu.",
    long: "Druhá verze předchozího loga – syrovější, barevný „grunge“ nápis VAPE SPORT na černém podkladu.",
  },
  {
    id: "zluta",
    num: "04",
    title: "Tištěné žluté VAPE SPORT",
    image: "/images/o-nas/04-zluta.jpg",
    short: "Žlutá hora se šipkou, tištěné logo.",
    long: "Přechod k jednodušší, výraznější symbolice – žlutá silueta hor s červenou šipkou vzhůru a nápisem VAPE SPORT.",
  },
  {
    id: "zelena-vlnka",
    num: "05",
    title: "Vyšívané – zelená vlnka / hory",
    image: "/images/o-nas/05-zelena-vlnka.jpg",
    short: "Přechod od tisku k výšivce. Zelená vlnka / hory.",
    long: "Milník ve zpracování – od tisku k vyšívanému logu. Zelená vlnka připomínající hory s červenou šipkou dodala značce prémiovější vzhled.",
  },
  {
    id: "vyshite-v",
    num: "06",
    title: "Vyšívané „V“",
    image: "/images/o-nas/06-vyshite-v.jpg",
    short: "Zjednodušení na vyšívaný symbol „V“.",
    long: "Značka se zredukovala na čistý, rozpoznatelný symbol – vyšívané „V“. Méně je více.",
  },
  {
    id: "pufik-oval-v",
    num: "07",
    title: "Pufík – ovál „V“",
    image: "/images/o-nas/07-pufik-oval-v.jpg",
    short: "Přechod na reflexní „pufíky“ – ovál s „V“ přímo na brašně.",
    long: "Nová technologie loga – reflexní gumové „pufíky“. Ovál s „V“ přímo na brašně, dobře viditelný i za tmy.",
  },
  {
    id: "reflex-vape",
    num: "08",
    title: "Reflexní „VAPE“",
    image: "/images/o-nas/08-reflex-vape.jpg",
    short: "Reflexní logo „VAPE“ přímo na brašně.",
    long: "Důraz na bezpečnost a viditelnost – reflexní logo „VAPE“ zapracované přímo do brašny.",
  },
  {
    id: "reflex-vape-sport",
    num: "09",
    title: "Reflexní „VAPE SPORT“",
    image: "/images/o-nas/09-reflex-vape-sport.jpg",
    short: "Kompletní reflexní logo „VAPE SPORT“.",
    long: "Vyzrálá podoba – kompletní reflexní logo „VAPE SPORT“, které spojuje čistý design s praktickou viditelností.",
  },
  {
    id: "morse",
    num: "10",
    title: "MORSEO – logo v Morseově abecedě",
    image: "/images/o-nas/10-morse.jpg",
    short: "Finále: tištěné logo VAPE v Morseově abecedě – základ řady MORSEO.",
    long: "Současnost a nová prémiová řada MORSEO. Logo VAPE převedené do Morseovy abecedy – odtud i název MORSEO. Spojení historie s moderním minimalismem.",
  },
];

const ONas = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = CHAPTERS.find((c) => c.id === openId) ?? null;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="px-6 lg:px-12 max-w-[1000px] mx-auto pt-28 pb-12 text-center">
        <span className="inline-block text-xs font-body font-semibold tracking-[0.3em] uppercase text-primary mb-4">
          Příběh značky
        </span>
        <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-5">
          Od roku 1994 v sedle
        </h1>
        <p className="font-body text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          VAPESPORT šije cyklistické brašny už od devadesátek. Naše logo se za tu
          dobu proměnilo mnohokrát – od ručně tištěných začátků až po dnešní
          reflexní minimalismus a řadu MORSEO. Projděte si celou cestu.
        </p>
      </section>

      {/* Časová osa */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {CHAPTERS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setOpenId(c.id)}
              className="group text-left flex flex-col overflow-hidden rounded-2xl border border-border bg-card hover:shadow-xl hover:border-foreground/30 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                <img
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 bg-foreground text-background font-mono text-xs font-bold px-2.5 py-1 rounded">
                  {c.num}
                </span>
              </div>
              <div className="p-5 flex flex-col gap-2 flex-1">
                <h3 className="font-heading text-lg font-bold text-foreground leading-snug">
                  {c.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {c.short}
                </p>
                <span className="text-xs font-body font-semibold uppercase tracking-wide text-primary mt-1">
                  Detail loga →
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Detail éry (modal) */}
      {active && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
          onClick={() => setOpenId(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative bg-card rounded-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpenId(null)}
              aria-label="Zavřít"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-background/90 text-foreground flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-[4/3] bg-muted">
              <img
                src={active.image}
                alt={active.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <span className="font-mono text-xs font-bold text-primary">
                {active.num}
              </span>
              <h2 className="font-heading text-2xl font-bold text-foreground mt-1 mb-3">
                {active.title}
              </h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                {active.long}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
};

export default ONas;
