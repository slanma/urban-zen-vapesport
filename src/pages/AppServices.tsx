import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Globe,
  Megaphone,
  Search,
  Package,
  Share2,
  Users,
  Wrench,
  Boxes,
  Check,
  ArrowRight,
} from "lucide-react";
import { useEffect } from "react";

const TRUST = [
  { big: "od 1994", small: "výroba a prodej v cyklistice" },
  { big: "vlastní e-shop", small: "provozujeme ho sami" },
  { big: "katalog", small: "naplníme z velkoobchodu" },
  { big: "dohledatelnost", small: "Google i AI, v ceně" },
];

const TIERS = [
  {
    icon: CalendarCheck,
    step: "01 — Start",
    title: "Rezervace do servisu",
    tag: "Spouštíme brzy.",
    bullets: [
      "Zákazník se objedná sám online 24/7 — méně telefonování",
      "Automatické připomínky, méně zmeškaných termínů",
      "Přehled zakázek, historie zákazníka a tisk štítků na jednom místě",
    ],
    priceBig: "Rok zdarma",
    priceSmall: "poté od 303 Kč / měsíc s DPH",
    featured: false,
  },
  {
    icon: Globe,
    step: "02 — Web",
    title: "E-shop, který vás lidé najdou",
    tag: "Prodej i po zavíračce.",
    bullets: [
      "Prodáváte 24/7, i když máte zavřeno",
      "Katalog kol a komponentů naimportujeme za vás",
      "Nastavení pro Google i AI v ceně",
      "Ceny a slevy měníte sami, bez programátora",
    ],
    priceBig: "od 12 000 Kč",
    priceSmall: "+ správa od 990 Kč / měsíc · ceny s DPH",
    featured: false,
  },
  {
    icon: Megaphone,
    step: "03 — Komplet",
    title: "Web i sociální sítě",
    tag: "Nemáte čas na sítě? Převezmeme je.",
    bullets: [
      "Pravidelné příspěvky a letáky",
      "Vše z úrovně Web + rezervační systém v ceně",
      "Měsíční přehled: dosah, návštěvnost, rezervace",
    ],
    priceBig: "od 2 900 Kč / měsíc",
    priceSmall: "s DPH · sestavíme na míru",
    featured: true,
    badge: "Nejoblíbenější",
  },
];

const APPS = [
  {
    icon: Wrench,
    title: "Servis Kolo",
    text: "Rezervační systém pro cyklo-servis, ne obecný objednávkový nástroj. Zákazník se objedná sám, vy máte přehled o zakázkách a připomínky chodí automaticky.",
  },
  {
    icon: Boxes,
    title: "Bike Shop Sync",
    text: "Pomocník do dílny na telefon i tablet. Dodavatelé na jednom místě, seznam „co došlo“ a hlídání dostupnosti dílů. Ať víte, co doobjednat.",
  },
];

const AppServices = () => {
  useEffect(() => {
    document.title = "Aplikace a služby — Vapesport";
    const meta =
      document.querySelector('meta[name="description"]') ||
      Object.assign(document.createElement("meta"), { name: "description" });
    meta.setAttribute(
      "content",
      "Web, e-shop na klíč, rezervační systém a správa sociálních sítí pro cyklo-prodejny — od výrobce brašen.",
    );
    if (!meta.parentElement) document.head.appendChild(meta);
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-16 px-6 lg:px-12 max-w-5xl mx-auto text-center">
        <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
          Od výrobce brašen
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-foreground mt-4 mb-5">
          Web, e-shop a rezervace
          <br className="hidden md:block" /> pro cyklo-prodejny
        </h1>
        <p className="font-body text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Brašny vyrábíme od roku 1994, takže cyklo-prodejnám rozumíme.
          Postavíme vám e-shop, naplníme ho katalogem z velkoobchodu a můžeme se
          starat i o sociální sítě. O prodej se staráte vy, o web my.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link
            to="/kontakt"
            className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Nezávazná ukázka <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#sluzby"
            className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest px-6 py-3 rounded-md border border-border text-foreground hover:bg-card transition-colors"
          >
            Co nabízíme
          </a>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST.map((t) => (
            <div key={t.big}>
              <div className="font-heading text-lg md:text-xl font-bold text-foreground">
                {t.big}
              </div>
              <div className="font-body text-xs text-muted-foreground mt-1">
                {t.small}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ŽEBŘÍČEK */}
      <section id="sluzby" className="px-6 lg:px-12 max-w-5xl mx-auto pt-20 pb-4">
        <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
          Tři úrovně
        </span>
        <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-3 mb-4 max-w-2xl">
          Začněte tím, co potřebujete
        </h2>
        <p className="font-body text-muted-foreground leading-relaxed max-w-2xl">
          Nemusíte hned všechno. Začněte málem a přidávejte, až budete chtít.
          Každá úroveň má jeden cíl: ušetřit čas a být vidět.
        </p>
      </section>

      <section className="px-6 lg:px-12 max-w-5xl mx-auto pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.step}
                className={`relative flex flex-col rounded-xl p-6 border ${
                  tier.featured
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                {tier.featured && tier.badge && (
                  <span className="absolute -top-3 left-6 inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-primary text-primary-foreground">
                    {tier.badge}
                  </span>
                )}
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div className="font-body text-[11px] font-bold uppercase tracking-widest text-primary/70 mb-1">
                  {tier.step}
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-1">
                  {tier.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground mb-4">
                  {tier.tag}
                </p>
                <ul className="flex flex-col gap-2.5 mb-6">
                  {tier.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 font-body text-sm text-foreground/80 leading-snug">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={2.4} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-4 border-t border-border">
                  <div className="font-heading text-lg font-bold text-foreground">
                    {tier.priceBig}
                  </div>
                  <div className="font-body text-xs text-muted-foreground mt-0.5">
                    {tier.priceSmall}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CO Z TOHO MÁTE */}
      <section className="px-6 lg:px-12 max-w-5xl mx-auto py-16">
        <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
          Co z toho máte
        </span>
        <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-3 mb-4 max-w-2xl">
          Jsme z cyklistiky. Víme, co prodejna potřebuje.
        </h2>
        <p className="font-body text-muted-foreground leading-relaxed max-w-2xl mb-10">
          Sami vyrábíme i prodáváme, takže mluvíme stejnou řečí.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* zvýrazněná – dohledatelnost */}
          <div className="rounded-xl p-7 bg-foreground text-background">
            <div className="w-11 h-11 rounded-lg bg-background/10 text-primary flex items-center justify-center mb-4">
              <Search className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div className="font-body text-[11px] font-bold uppercase tracking-widest text-primary mb-2">
              Dohledatelnost — v ceně webu
            </div>
            <h3 className="font-heading text-xl font-bold mb-2">
              Ať vás lidé najdou
            </h3>
            <p className="font-body text-sm text-background/75 leading-relaxed">
              Když někdo hledá cyklo servis ve vašem městě na Googlu nebo se
              zeptá AI, ať najde vás. Každý web nastavíme tak, abyste měli co
              nejlepší šanci se objevit — SEO, strukturovaná data, firemní
              profil. V ceně, ne za příplatek.
            </p>
            <span className="mt-4 inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-primary text-primary-foreground">
              Standard, ne příplatek
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-xl p-6 bg-card border border-border">
              <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Package className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div className="font-body text-[11px] font-bold uppercase tracking-widest text-primary/70 mb-2">
                Katalog
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                Ušetříme vám dny práce
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Roztřídit stovky kol a komponentů zabere dny. Máme B2B přístup do
                velkoobchodů, takže katalog dodáme hotový. Vy jen doplníte ceny a
                slevy.
              </p>
            </div>

            <div className="rounded-xl p-6 bg-card border border-border">
              <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Share2 className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div className="font-body text-[11px] font-bold uppercase tracking-widest text-primary/70 mb-2">
                Sociální sítě
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                Postaráme se o sítě za vás
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Pravidelné příspěvky, akce a letáky. Při tvorbě pomáhá AI, my ji
                kontrolujeme — proto to zvládneme za rozumnou cenu. Každý měsíc
                dostanete přehled: dosah, návštěvnost, rezervace. Neslibujeme
                počty zákazníků, slibujeme práci, kterou uvidíte.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 bg-card border border-border mt-6">
          <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Users className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <div className="font-body text-[11px] font-bold uppercase tracking-widest text-primary/70 mb-2">
            Jeden partner
          </div>
          <h3 className="font-heading text-lg font-bold text-foreground mb-2">
            Nemusíte vysvětlovat, co je náboj
          </h3>
          <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-3xl">
            Jeden člověk z oboru na web, sítě i rezervace. Žádní tři dodavatelé a
            žádné vysvětlování, jak funguje cyklo-prodejna.
          </p>
        </div>
      </section>

      {/* APLIKACE */}
      <section className="px-6 lg:px-12 max-w-5xl mx-auto pb-16">
        <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
          Naše aplikace
        </span>
        <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-3 mb-8 max-w-2xl">
          Nástroje pro každodenní provoz
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {APPS.map((app) => {
            const Icon = app.icon;
            return (
              <div key={app.title} className="rounded-xl p-6 bg-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Připravujeme
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                  {app.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {app.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* JAK TO MÁME NASTAVENÉ */}
      <section className="px-6 lg:px-12 max-w-5xl mx-auto pb-16">
        <div className="rounded-2xl bg-foreground text-background px-8 py-12 md:px-12">
          <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
            Jak to máme nastavené
          </span>
          <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight mt-3 mb-4 max-w-xl">
            Odběratelé brašen mají služby levněji
          </h2>
          <p className="font-body text-background/80 leading-relaxed max-w-2xl">
            Nechceme vydělat na webu. Chceme, aby se vám dařilo prodávat. Proto
            kdo odebírá naše brašny, má digitální služby se slevou.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-12 max-w-5xl mx-auto pb-24">
        <div className="bg-primary/5 border border-border rounded-2xl px-8 py-12 text-center">
          <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
            Nezávazně
          </span>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mt-3 mb-3">
            Ukážeme vám, jak by to mohlo vypadat u&nbsp;vás
          </h2>
          <p className="font-body text-muted-foreground mb-7 max-w-xl mx-auto">
            Napište nám a domluvíme krátký hovor. Bez závazku — jen se podíváme,
            co by vaší prodejně dávalo smysl.
          </p>
          <Link
            to="/kontakt"
            className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Ozvěte se nám <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default AppServices;
