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
  { big: "od 1994", small: "vlastní výroba a prodej v cyklu" },
  { big: "vlastní e-shop", small: "stavíme to, co sami provozujeme" },
  { big: "katalog hotový", small: "kola a komponenty z velkoobchodu" },
  { big: "dohledatelnost", small: "pro Google i AI, v ceně webu" },
];

const TIERS = [
  {
    icon: CalendarCheck,
    step: "01 — Start",
    title: "Rezervace do servisu",
    tag: "Spouštíme brzy — buďte mezi prvními.",
    bullets: [
      "Zákazník si termín objedná sám online 24/7 — vy netrávíte půl dne na telefonu",
      "Míň zmeškaných termínů díky automatickým připomínkám",
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
    tag: "Prodávejte i po zavíračce — a buďte vidět.",
    bullets: [
      "Prodáváte 24/7, i když máte zavřeno nebo je venku déšť",
      "Katalog kol a komponentů naimportujeme za vás — ušetříme vám dny práce",
      "V ceně: nastavení pro Google i AI, ať vás zákazníci najdou",
      "Ceny a slevy měníte sami, bez programátora",
    ],
    priceBig: "od 12 000 Kč",
    priceSmall: "+ správa od 990 Kč / měsíc · ceny s DPH",
    featured: false,
  },
  {
    icon: Megaphone,
    step: "03 — Komplet",
    title: "Marketing, o který se nemusíte starat",
    tag: "Nemáte na sítě čas? Převezmeme je.",
    bullets: [
      "Pravidelné příspěvky a letáky — ať je o vás vidět",
      "Vše z úrovně Web + rezervační systém v ceně",
      "Měsíční přehled, co se dělo — dosah, návštěvnost, rezervace",
    ],
    priceBig: "od 2 900 Kč / měsíc",
    priceSmall: "s DPH · sestavíme na míru vaší prodejně",
    featured: true,
    badge: "Nejoblíbenější",
  },
];

const APPS = [
  {
    icon: Wrench,
    title: "Servis Kolo",
    text: "Rezervační a správní systém pro cyklo-servis — postavený přímo pro vás, ne obecný salonní nástroj. Zákazníci se objednávají sami, vy máte přehled o zakázkách, připomínky chodí samy a nic vám nezapadne. Buďte mezi prvními, kdo ho spustí.",
  },
  {
    icon: Boxes,
    title: "Bike Shop Sync",
    text: "Pomocník pro dílnu do telefonu i tabletu: vaši velkoobchodní dodavatelé na jednom místě, nákupní seznam „co došlo na dílně“ a hlídač dostupnosti nedostatkových dílů. Ať víte, kde a co doobjednat, dřív než vám to dojde.",
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
      "Web, e-shop na klíč, rezervační systém a péče o sociální sítě pro cyklo-prodejny — od výrobce brašen, který rozumí vašemu obchodu.",
    );
    if (!meta.parentElement) document.head.appendChild(meta);
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-16 px-6 lg:px-12 max-w-5xl mx-auto text-center">
        <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
          Od výrobce — pro cyklo-prodejny
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-foreground mt-4 mb-5">
          Vyrábíme brašny. Rozumíme vašemu obchodu.
          <br className="hidden md:block" /> Teď vám pomůžeme prodávat i&nbsp;online.
        </h1>
        <p className="font-body text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Postavíme vám e-shop, který vás lidé najdou na Googlu i v AI, naplníme
          ho katalogem z velkoobchodu a postaráme se o vaše sociální sítě. Vy
          prodáváte — my se staráme o zbytek.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link
            to="/kontakt"
            className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Chci nezávaznou ukázku <ArrowRight className="w-4 h-4" />
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
          Tři úrovně — začněte, kde chcete
        </span>
        <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-3 mb-4 max-w-2xl">
          Od jednoduchého startu po kompletní péči o vaši online přítomnost
        </h2>
        <p className="font-body text-muted-foreground leading-relaxed max-w-2xl">
          Nemusíte hned všechno. Začněte tím nejmenším a přidávejte, až budete
          chtít růst. Každá úroveň má jeden jasný cíl: ušetřit vám čas a postarat
          se o to, ať jste online vidět.
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

      {/* CO VÁM TO PŘINESE */}
      <section className="px-6 lg:px-12 max-w-5xl mx-auto py-16">
        <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
          Co vám to reálně přinese
        </span>
        <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-3 mb-4 max-w-2xl">
          Nejsme webová agentura. Jsme lidi z oboru — a záleží nám na vás.
        </h2>
        <p className="font-body text-muted-foreground leading-relaxed max-w-2xl mb-10">
          Známe cyklistiku zevnitř, protože v ní sami vyrábíme a prodáváme. Tady
          je, co konkrétně z naší práce budete mít.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* zvýrazněná – dohledatelnost */}
          <div className="rounded-xl p-7 bg-foreground text-background md:row-span-1">
            <div className="w-11 h-11 rounded-lg bg-background/10 text-primary flex items-center justify-center mb-4">
              <Search className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div className="font-body text-[11px] font-bold uppercase tracking-widest text-primary mb-2">
              Najdou vás — v ceně webu
            </div>
            <h3 className="font-heading text-xl font-bold mb-2">
              Když lidé hledají, chcete být mezi odpověďmi
            </h3>
            <p className="font-body text-sm text-background/75 leading-relaxed">
              Dnes víc než polovina lidí najde odpověď rovnou ve vyhledávači nebo
              se zeptá AI asistenta. Když někdo zadá „cyklo servis vaše město“,
              chcete tam být. Každý web od nás od základu nastavíme tak, abyste
              měli co nejlepší šanci, že vás Google i AI najdou a doporučí —
              strukturovaná data, čisté SEO, váš firemní profil. Není to
              příplatek, je to samozřejmost.
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
                Katalog hotový za vás
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                Ušetříme vám dny práce
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Nasbírat a roztřídit stovky kol a komponentů je práce na celé dny.
                My máme B2B přístup do velkoobchodů, takže vám katalog dodáme
                připravený a roztříděný. Vy už jen dáváte ceny a slevy — nic víc
                řešit nemusíte.
              </p>
            </div>

            <div className="rounded-xl p-6 bg-card border border-border">
              <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Share2 className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div className="font-body text-[11px] font-bold uppercase tracking-widest text-primary/70 mb-2">
                Marketing bez starostí
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                Vaše sítě budou žít — a vy na to nemusíte myslet
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Pravidelné příspěvky, akce a letáky. Tvorbu zrychluje AI napojená
                na data o vaší prodejně, my ji kontrolujeme — proto ji zvládneme
                kvalitně i za rozumnou cenu. Každý měsíc dostanete přehled, co se
                dělo: dosah, návštěvnost webu, rezervace. Žádné plané sliby o
                počtu zákazníků — poctivá práce, na kterou nemusíte myslet vy.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 bg-card border border-border mt-6">
          <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Users className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <div className="font-body text-[11px] font-bold uppercase tracking-widest text-primary/70 mb-2">
            Jeden partner z oboru
          </div>
          <h3 className="font-heading text-lg font-bold text-foreground mb-2">
            Nemusíte vysvětlovat, co je náboj
          </h3>
          <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-3xl">
            Žádní tři dodavatelé, žádné vysvětlování webaři, jak funguje
            cyklo-prodejna. Jsme z cyklistiky, rozumíme vašemu obchodu a jsme tu
            pro vás — web, marketing i rezervace od jednoho člověka, který to s
            vámi myslí dobře.
          </p>
        </div>
      </section>

      {/* APLIKACE */}
      <section className="px-6 lg:px-12 max-w-5xl mx-auto pb-16">
        <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
          Naše aplikace
        </span>
        <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-3 mb-8 max-w-2xl">
          Nástroje, které vám ulehčí každý den v servisu
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

      {/* WIN-WIN */}
      <section className="px-6 lg:px-12 max-w-5xl mx-auto pb-16">
        <div className="rounded-2xl bg-foreground text-background px-8 py-12 md:px-12">
          <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
            Partnerství, ne dodávka
          </span>
          <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight mt-3 mb-4 max-w-xl">
            Když prosperujete vy, prosperujeme i&nbsp;my.
          </h2>
          <p className="font-body text-background/80 leading-relaxed max-w-2xl">
            Nechceme na vás vydělat na webu — chceme, aby se vám dařilo prodávat.
            Proto <span className="text-primary font-semibold">aktivní odběratelé našich brašen mají digitální služby zvýhodněné</span>.
            Vy rostete, my rosteme s vámi. Tak jednoduché to je.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-12 max-w-5xl mx-auto pb-24">
        <div className="bg-primary/5 border border-border rounded-2xl px-8 py-12 text-center">
          <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
            Nezávazně a bez tlaku
          </span>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mt-3 mb-3">
            Ukážeme vám, jak by to u vás mohlo vypadat.
          </h2>
          <p className="font-body text-muted-foreground mb-7 max-w-xl mx-auto">
            Napište nám a domluvíme si krátký hovor. Bez závazku, bez řečí okolo —
            jen se podíváme, co by vaší prodejně dávalo smysl.
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
