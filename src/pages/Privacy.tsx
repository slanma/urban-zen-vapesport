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
            <p>Správcem osobních údajů je společnost Vapesport Vlach s.r.o., IČ: 05819369, DIČ: CZ05819369, se sídlem Paskovská 636/275, Ostrava-Hrabová, 720 00, zapsaná u Krajského soudu v Ostravě, sp. zn. C 69479 (dále jen „správce").</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">II. Účel a právní základ zpracování osobních údajů</h2>
            <p>Osobní údaje kupujícího (jméno, příjmení, adresa, e-mail, telefonní číslo, případně IČ/DIČ) jsou zpracovávány pro následující účely:</p>
            <p className="mt-2"><strong>Plnění smlouvy:</strong> Vyřízení a doručení objednávky zboží, zajištění a realizace objednaných služeb, komunikace se zákazníkem.</p>
            <p><strong>Plnění zákonných povinností:</strong> Vystavování a uchovávání daňových a účetních dokladů podle platných zákonů ČR.</p>
            <p><strong>Oprávněný zájem a marketing:</strong> Zasílání obchodních sdělení (newsletterů) stávajícím zákazníkům s nabídkou obdobných produktů a služeb. Zákazník má možnost se z odběru kdykoli jednoduše odhlásit (jedním kliknutím v patičce e-mailu). Pokud nejde o stávajícího zákazníka, dochází k marketingu pouze na základě předchozího výslovného souhlasu.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">III. Práva subjektu údajů</h2>
            <p>Kupující má jako subjekt údajů podle nařízení GDPR následující práva:</p>
            <p>Právo na přístup k osobním údajům a informacím o jejich zpracování.</p>
            <p>Právo na opravu nepřesných nebo neúplných údajů.</p>
            <p>Právo na výmaz údajů („právo být zapomenut"), pokud již pominul účel nebo právní důvod jejich zpracování.</p>
            <p>Právo na omezení zpracování údajů.</p>
            <p>Právo na přenositelnost údajů jinému správci.</p>
            <p>Právo vznést námitku proti zpracování na základě oprávněného zájmu správce.</p>
            <p>Právo podat stížnost u Úřadu pro ochranu osobních údajů (ÚOOÚ), se sídlem Pplk. Sochora 27, 170 00 Praha 7, www.uoou.cz.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">IV. Doba uchovávání údajů</h2>
            <p>Údaje nezbytné pro plnění smlouvy a zákonných povinností uchováváme po dobu stanovenou příslušnými právními předpisy (např. účetní a daňové doklady po dobu 10 let).</p>
            <p>Pro marketingové účely a zasílání obchodních sdělení uchováváme údaje po dobu 5 let, nebo do momentu, kdy zákazník vznese námitku proti zpracování či odvolá svůj souhlas.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">V. Zabezpečení údajů a příjemci</h2>
            <p>Osobní údaje jsou bezpečně uloženy a chráněny proti zneužití pomocí moderních technických a organizačních opatření.</p>
            <p className="mt-2">Osobní údaje mohou být v nezbytném rozsahu předávány třetím stranám, pokud je to nutné pro splnění smlouvy: přepravní společnosti a výdejní místa (Zásilkovna / Packeta) pro doručení brašen, poskytovatel platební brány, poskytovatel technického provozu (hosting a databáze) a poskytovatel e-mailové platformy Brevo pro rozesílání systémových a schválených marketingových zpráv. Se zpracovateli má správce uzavřeny smlouvy o zpracování osobních údajů.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">VI. Cookies</h2>
            <p>Web používá nezbytné cookies zajišťující jeho základní funkce (např. obsah košíku), které nevyžadují souhlas. Volitelné analytické a marketingové cookies používáme pouze s vaším souhlasem. Nastavení cookies lze kdykoli změnit v prohlížeči.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">VII. Kontaktní údaje</h2>
            <p>Pro uplatnění jakýchkoli práv nebo v případě dotazů ohledně ochrany osobních údajů nás kontaktujte na e-mailové adrese: info@vapesport.cz.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">VIII. Závěrečná ustanovení</h2>
            <p>Tyto zásady jsou platné od 22. 5. 2026.</p>
          </div>
        </article>
      </section>
      <Footer />
    </main>
  );
};

export default Privacy;
