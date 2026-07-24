import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Share2, Mail, Printer, Search, Check, Wrench, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Service = {
  id: string;
  name: string;
  desc: string;
  once?: number;
  month?: number;
  custom?: boolean;
  feat?: string;
  defaultOn?: boolean;
};

const SERVICES: Service[] = [
  { id: "web", name: "Web na míru", desc: "Kompletní web pro vaši prodejnu — viz co je v ceně níže.", once: 10000, month: 500, defaultOn: true, feat: "V ceně webu: jednoduchý e-shop s platbou přes QR kód · napojení na Zásilkovnu (výběr výdejního místa) · dohledatelnost pro Google, Seznam i AI asistenty · zabezpečení, aktualizace a zálohy · úpravy obsahu." },
  { id: "social", name: "Sociální sítě", desc: "Kompletní správa Facebooku a Instagramu.", month: 5000, defaultOn: true },
  { id: "foto", name: "Nafocení a natočení prodejny", desc: "Jednoduché fotky a záběry prodejny a prostředí — bez mluvení a asistence.", once: 2500 },
  { id: "newsletter", name: "Newsletter a e-maily", desc: "Pravidelné kampaně vašim zákazníkům.", month: 999 },
  { id: "letaky", name: "Letáky a tištěná reklama", desc: "Grafika na míru plus tipy, kam ji umístit.", month: 999 },
  { id: "produkty", name: "Naplnění webu produkty", desc: "Nahrání produktů do webu/e-shopu.", once: 3000 },
  { id: "kontrola", name: "Měsíční kontrola a aktualizace", desc: "Průběžná kontrola a aktualizace produktů a obsahu webu.", month: 300 },
  { id: "google", name: "Google firemní profil", desc: "Založení a vyladění profilu na Google a v Mapách.", once: 500 },
  { id: "eshop", name: "E-shop — rozšíření", desc: "Další dopravci, platba kartou, štítky a funkce na míru.", custom: true },
];

const MODULES = [
  { icon: Share2, title: "Sociální sítě", tag: "Měsíční balíček", text: "Kompletní správa Facebooku a Instagramu na míru prodejně — příspěvky, fotky, videa i Reels, propagace akcí a servisu. Vy prodáváte, obsah řešíme my." },
  { icon: Mail, title: "Newsletter a e-maily", tag: "Kampaně na míru", text: "Pravidelné e-maily vašim zákazníkům: novinky, servisní akce, výprodeje, nové modely a sezónní nabídky. Připravíme i rozešleme." },
  { icon: Printer, title: "Letáky a tištěná reklama", tag: "Grafika + tipy", text: "Profesionální letáky a grafika na míru — plus tipy, kam je umístit, aby přivedly zákazníky do prodejny." },
];

const APPS = [
  { icon: Wrench, title: "Servisní aplikace", text: "Přehledná evidence a objednávání servisu pro vaši prodejnu — zakázky, termíny a stav oprav na jednom místě." },
  { icon: Users, title: "Aplikace pro B2B partnery", text: "Aplikace pro naše partnery — objednávky, ceny a novinky přehledně na jednom místě." },
];

const WEB_FEATURES = [
  "Web na míru vaší prodejně (rychlý, přehledný, mobil i počítač)",
  "Jednoduchý e-shop s platbou přes QR kód",
  "Napojení na Zásilkovnu — výběr výdejního místa",
  "Dohledatelnost pro Google, Seznam i AI asistenty",
  "Zabezpečení, aktualizace a zálohy",
  "Úpravy obsahu (otevírací doba, kontakt, akce, fotky)",
];

const fmt = (n: number) => Math.round(n).toLocaleString("cs-CZ");

const AppServices = () => {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(SERVICES.map((s) => [s.id, Boolean(s.defaultOn)])),
  );
  const [form, setForm] = useState({ company: "", email: "", phone: "", web: "", message: "", hp: "" });
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    document.title = "Aplikace a služby — digitální podpora prodeje pro cykloprodejny | Vapesport";
    const meta =
      document.querySelector('meta[name="description"]') ||
      Object.assign(document.createElement("meta"), { name: "description" });
    meta.setAttribute("content", "Moderní web dohledatelný i pro AI vyhledávače, správa sociálních sítí, newslettery a letáky pro cykloprodejny. Spočítejte si cenu a nezávazně poptejte.");
    if (!meta.parentElement) document.head.appendChild(meta);
  }, []);

  const totals = useMemo(() => {
    let once = 0, month = 0, custom = false;
    for (const s of SERVICES) {
      if (!checked[s.id]) continue;
      if (s.once) once += s.once;
      if (s.month) month += s.month;
      if (s.custom) custom = true;
    }
    return { once, month, custom };
  }, [checked]);

  const selectedList = () =>
    SERVICES.filter((s) => checked[s.id]).map((s) => ({
      name: s.name,
      price: s.custom ? "na míru" : [s.once ? `${fmt(s.once)} Kč jednorázově` : "", s.month ? `${fmt(s.month)} Kč/měs` : ""].filter(Boolean).join(" + "),
    }));

  const submit = async () => {
    setErr("");
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErr("Vyplňte prosím platný e-mail, ať se vám můžeme ozvat.");
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
          ...form,
          services: selectedList(),
          price_once: totals.once,
          price_month: totals.month,
          has_custom: totals.custom,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Odeslání selhalo");
      setSent(true);
    } catch (e: any) {
      setErr(e.message || "Odeslání se nepodařilo. Zkuste to prosím znovu.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="pt-32 pb-14 px-6 lg:px-12 max-w-5xl mx-auto text-center">
        <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">
          Digitální podpora prodeje pro cykloprodejny
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-foreground mt-4 mb-5">
          Kompletní digitální řešení pro cykloprodejny — web, aplikace, marketing
        </h1>
        <p className="font-body text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Postavíme vám web, přidáme aplikace pro provoz prodejny a marketing podle potřeby. Vše na míru a i samostatně.
        </p>
        <p className="font-heading text-lg md:text-xl font-bold text-foreground mt-6">
          „O marketing se postaráme my, o prodej vy.“
        </p>
      </section>

      <section className="px-6 lg:px-12 max-w-4xl mx-auto pb-14">
        <div className="bg-card border border-border rounded-xl p-6 md:p-8">
          <h2 className="font-heading text-xl font-bold text-foreground mb-3">Pro koho to je</h2>
          <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
            Pro malé a střední cykloprodejny, kde majitel často zároveň prodává, opravuje kola a stará se o všechno kolem — a na marketing ani moderní web nezbývá čas. Nemusíte se v tom vyznat a nemusíte se tím zabývat. Postaráme se o technickou stranu a všechno vám předáme jednoduše a srozumitelně — s návody krok za krokem, kdykoli je budete potřebovat. Vy se věnujete tomu, co umíte nejlíp. Zbytek je na nás.
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-12 max-w-5xl mx-auto pb-16">
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="bg-primary/5 px-6 md:px-10 py-8 md:py-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Search className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <span className="font-body text-[11px] font-bold uppercase tracking-widest text-primary">Základ</span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
              Web připravený pro vyhledávače i AI
            </h2>
            <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed max-w-3xl">
              Jednoduchý, rychlý a přehledný web nebo e-shop na míru vaší prodejně. Postavený tak, aby mu rozuměly nejen klasické vyhledávače (Google, Seznam), ale i moderní AI asistenti. Když dnes někdo hledá „kde koupit elektrokolo v okolí“, čím dál častěji se ptá umělé inteligence — a my web připravujeme tak, aby měla vaše prodejna co nejlepší šanci se ukázat.
            </p>
          </div>
          <div className="bg-card px-6 md:px-10 py-7">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {WEB_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 font-body text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" strokeWidth={2.4} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-12 max-w-5xl mx-auto pb-16">
        <div className="text-center mb-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">Marketing podle potřeby</h2>
          <p className="font-body text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Nadstavba k webu, kterou si vyberete podle sebe. Každou službu můžete využít i úplně samostatně — třeba jen správu sítí nebo jen letáky.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MODULES.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="flex flex-col bg-card border border-border rounded-xl p-6">
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="font-body text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">{s.tag}</span>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">{s.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-6 lg:px-12 max-w-5xl mx-auto pb-16">
        <div className="text-center mb-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">Aplikace</h2>
          <p className="font-body text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Kromě webu a marketingu pro vás chystáme i vlastní aplikace, které usnadní provoz prodejny. Jsou v přípravě — brzy je nabídneme.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {APPS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="flex flex-col bg-card border border-border rounded-xl p-6">
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="font-body text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#B0894B" }}>Připravujeme</span>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">{s.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-6 lg:px-12 max-w-4xl mx-auto pb-16">
        <div className="text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">Nejsme agentura. Jsme váš obchodní partner.</h2>
          <p className="font-body text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Neprodáváme weby ani správu sociálních sítí jako samoúčel. Staráme se o to, aby byla vaše prodejna na internetu vidět a snadno k nalezení — samotný prodej je pak na vás.
          </p>
        </div>
      </section>

      {/* KALKULAČKA */}
      <section id="kalkulacka" className="px-6 lg:px-12 max-w-5xl mx-auto pb-24">
        <div className="text-center mb-8">
          <span className="font-body text-[11px] font-bold tracking-[0.28em] uppercase text-primary">Ceník</span>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mt-3 mb-2">Spočítejte si to</h2>
          <p className="font-body text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Zaškrtněte, co vaše prodejna potřebuje — třeba jen web, jen sítě, nebo vše dohromady. Cenu vidíte hned.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 items-start">
          {/* výběr služeb */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="font-body text-xs text-muted-foreground mb-3">Ceny jsou bez DPH.</p>
            {SERVICES.map((s, i) => (
              <div key={s.id}>
                <label className={`flex items-start gap-3 py-3 cursor-pointer ${i === 0 ? "" : "border-t border-border"}`}>
                  <input
                    type="checkbox"
                    checked={Boolean(checked[s.id])}
                    onChange={(e) => setChecked((c) => ({ ...c, [s.id]: e.target.checked }))}
                    className="w-5 h-5 mt-0.5 accent-primary shrink-0"
                  />
                  <span className="flex-1">
                    <span className="font-body font-medium text-[15px] text-foreground block">{s.name}</span>
                    <span className="font-body text-xs text-muted-foreground">{s.desc}</span>
                  </span>
                  <span className="font-body font-semibold text-sm text-right whitespace-nowrap tabular-nums">
                    {s.custom ? (
                      <span className="text-primary">Na míru</span>
                    ) : (
                      <>
                        {s.once ? <span className="block">{fmt(s.once)} Kč<span className="block text-[11px] font-normal text-muted-foreground">jednorázově</span></span> : null}
                        {s.month ? <span className="block">{fmt(s.month)} Kč<span className="block text-[11px] font-normal text-muted-foreground">/ měsíc</span></span> : null}
                      </>
                    )}
                  </span>
                </label>
                {s.feat && checked[s.id] ? (
                  <p className="font-body text-xs text-muted-foreground leading-relaxed bg-primary/5 rounded-lg px-3.5 py-2.5 mb-1">{s.feat}</p>
                ) : null}
              </div>
            ))}
          </div>

          {/* souhrn + poptávka */}
          <div className="bg-card border border-border rounded-2xl p-6 md:sticky md:top-24">
            {!sent ? (
              <>
                <h3 className="font-heading text-base font-bold text-foreground mb-1">Vaše cena</h3>
                <p className="font-body text-xs text-muted-foreground mb-3">Ceny jsou bez DPH</p>
                <div className="flex justify-between items-baseline py-2 border-b border-border">
                  <span className="font-body text-[13px] text-muted-foreground">Jednorázově</span>
                  <span><span className="font-heading font-bold text-2xl tabular-nums">{fmt(totals.once)}</span> <span className="text-xs text-muted-foreground">Kč</span></span>
                </div>
                <p className="font-body text-xs text-muted-foreground text-right py-1">s DPH {fmt(totals.once * 1.21)} Kč</p>
                <div className="flex justify-between items-baseline py-2 border-b border-border">
                  <span className="font-body text-[13px] text-muted-foreground">Měsíčně</span>
                  <span><span className="font-heading font-bold text-2xl tabular-nums">{fmt(totals.month)}</span> <span className="text-xs text-muted-foreground">Kč</span></span>
                </div>
                <p className="font-body text-xs text-muted-foreground text-right py-1">s DPH {fmt(totals.month * 1.21)} Kč</p>
                {totals.custom ? (
                  <p className="font-body text-xs text-primary bg-primary/5 rounded-lg px-3 py-2 mt-2 leading-relaxed">+ E-shop na míru — cenu vyčíslíme podle vašich požadavků.</p>
                ) : null}

                <div className="mt-5 space-y-2">
                  <input className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm" placeholder="Firma / jméno" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
                  <input className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm" placeholder="E-mail *" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  <input className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm" placeholder="Telefon" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                  <input className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm" placeholder="Web vaší prodejny" value={form.web} onChange={(e) => setForm((f) => ({ ...f, web: e.target.value }))} />
                  <textarea className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[64px]" placeholder="Zpráva (nepovinné)" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
                  <input tabIndex={-1} autoComplete="off" className="hidden" value={form.hp} onChange={(e) => setForm((f) => ({ ...f, hp: e.target.value }))} />
                </div>

                <label className="flex items-start gap-2.5 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-primary shrink-0"
                  />
                  <span className="font-body text-xs text-muted-foreground leading-relaxed">
                    Souhlasím se zpracováním osobních údajů za účelem vyřízení poptávky.{" "}
                    <a href="/ochrana-udaju" target="_blank" rel="noreferrer" className="text-primary hover:underline">Více informací</a>.
                  </span>
                </label>

                {err ? <p className="font-body text-xs text-destructive mt-2">{err}</p> : null}

                <button
                  onClick={submit}
                  disabled={sending || !consent}
                  className="mt-4 w-full text-center bg-primary text-primary-foreground font-bold text-[13px] uppercase tracking-widest py-3.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {sending ? "Odesílám…" : "Nezávazně poptat →"}
                </button>
                <a
                  href="mailto:info@vapesport.cz?subject=Dotaz%20k%20nab%C3%ADdce%20slu%C5%BEeb"
                  className="mt-2 w-full block text-center border border-border text-foreground font-medium text-[13px] py-3 rounded-md hover:bg-muted/50 transition-colors"
                >
                  Chci se jen zeptat →
                </a>
                <p className="font-body text-xs text-muted-foreground text-center mt-2">Nezávazné. Ozveme se s návrhem na míru.</p>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7" strokeWidth={2.4} />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">Poptávka odeslána</h3>
                <p className="font-body text-sm text-muted-foreground">Děkujeme! Ozveme se vám co nejdřív s návrhem na míru.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default AppServices;
