import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24 px-6 lg:px-12 max-w-3xl mx-auto">
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-10">
          Zásady ochrany osobních údajů
        </h1>
        <article className="font-body text-base leading-relaxed text-foreground space-y-6">
          <p className="font-semibold uppercase tracking-wide">
            Zásady ochrany osobních údajů (GDPR)
          </p>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">I. Správce osobních údajů</h2>
            <p>Správcem osobních údajů je společnost Vapesport Vlach s.r.o., IČ: 05819369, se sídlem Paskovská 636/275, Ostrava-Hrabová, 720 00.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">II. Účel a právní základ zpracování</h2>
            <p>Osobní údaje jsou zpracovávány pro:</p>
            <p>1. <strong>Plnění smlouvy:</strong> Vyřízení objednávek brašen a realizace objednaných služeb (golf, AI).</p>
            <p>2. <strong>Plnění zákonných povinností:</strong> Uchovávání daňových a účetních dokladů.</p>
            <p>3. <strong>Oprávněný zájem a marketing:</strong> Zasílání newsletterů stávajícím zákazníkům. Odhlášení je možné jedním kliknutím v patičce e-mailu.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">III. Práva subjektu údajů</h2>
            <p>Kupující má právo na přístup, opravu, výmaz („právo být zapomenut"), omezení zpracování, přenositelnost údajů, vznesení námitky a podání stížnosti u ÚOOÚ.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">IV. Doba uchovávání údajů</h2>
            <p>Účetní doklady uchováváme po dobu 10 let. Pro marketingové účely uchováváme údaje po dobu 5 let nebo do odvolání souhlasu.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">V. Zabezpečení údajů a příjemci</h2>
            <p>Údaje jsou chráněny moderními technickými opatřeními. V nezbytném rozsahu mohou být předány dopravcům, platební bráně nebo e-mailové platformě Brevo pro účely plnění smlouvy.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">VI. Kontaktní údaje</h2>
            <p>E-mail: info@vapesport.cz</p>
          </div>
        </article>
      </section>
      <Footer />
    </main>
  );
};

export default Privacy;
