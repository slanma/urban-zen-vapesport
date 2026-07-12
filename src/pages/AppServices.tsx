import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Bot, Globe, Share2, ArrowRight } from "lucide-react";
import { useEffect } from "react";

const SERVICES = [
  {
    icon: Bot,
    title: "Umělá inteligence (AI)",
    text: "Chytrá řešení, která šetří čas — od automatizace až po asistenty. Brzy zde najdete konkrétní nabídku.",
  },
  {
    icon: Globe,
    title: "Web a e-shopy",
    text: "Tvorba a správa webů a e-shopů na míru. Podrobnosti připravujeme.",
  },
  {
    icon: Share2,
    title: "Sociální sítě",
    text: "Správa a propagace na sociálních sítích. Více informací už brzy.",
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
      "Aplikace a služby Vapesport — připravujeme řešení v oblasti umělé inteligence, webů a sociálních sítí.",
    );
    if (!meta.parentElement) document.head.appendChild(meta);
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-14 px-6 lg:px-12 max-w-5xl mx-auto text-center">
        <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
          Vapesport
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-foreground mt-4 mb-5">
          Aplikace a služby
        </h1>
        <p className="font-body text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Kromě brašen pro vás postupně chystáme i další služby. Níže je přehled
          oblastí, na kterých pracujeme — obsah brzy doplníme.
        </p>
      </section>

      {/* SLUŽBY */}
      <section className="px-6 lg:px-12 max-w-5xl mx-auto pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="flex flex-col bg-card border border-border rounded-xl p-6"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <h2 className="font-heading text-lg font-bold text-foreground mb-2">
                  {s.title}
                </h2>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {s.text}
                </p>
                <span className="mt-4 inline-block text-[11px] font-bold uppercase tracking-widest text-primary/70">
                  Připravujeme
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-12 max-w-5xl mx-auto pb-24">
        <div className="bg-primary/5 border border-border rounded-2xl px-8 py-10 text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-3">
            Máte zájem už teď?
          </h2>
          <p className="font-body text-muted-foreground mb-6 max-w-xl mx-auto">
            Napište nám, o co máte zájem, a ozveme se vám.
          </p>
          <Link
            to="/kontakt"
            className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Kontaktujte nás <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default AppServices;
