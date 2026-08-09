import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/** Datum účinnosti zásad. Při každé úpravě textu změňte i tuto hodnotu. */
const UCINNOST_OD = "9. 8. 2026";

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
          <p className="text-sm text-muted-foreground">Účinné od {UCINNOST_OD}</p>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">I. Správce osobních údajů</h2>
            <p>Správcem osobních údajů je společnost Vapesport Vlach s.r.o., IČ: 05819369, DIČ: CZ05819369, se sídlem Paskovská 636/275, Ostrava-Hrabová, 720 00, zapsaná u Krajského soudu v Ostravě, sp. zn. C 69479 (dále jen „správce").</p>
            <p className="mt-2">Správce nejmenoval pověřence pro ochranu osobních údajů. Ve všech záležitostech týkajících se zpracování osobních údajů nás kontaktujte na info@vapesport.cz.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">II. Účel a právní základ zpracování osobních údajů</h2>
            <p>Osobní údaje kupujícího (jméno, příjmení, adresa, e-mail, telefonní číslo, případně IČ/DIČ) jsou zpracovávány pro následující účely:</p>
            <p className="mt-2"><strong>Plnění smlouvy</strong> (čl. 6 odst. 1 písm. b) GDPR): Vyřízení a doručení objednávky zboží, zajištění a realizace objednaných služeb, komunikace se zákazníkem, správa zákaznického a B2B účtu. Údaje zpracováváme po dobu trvání smluvního vztahu.</p>
            <p><strong>Plnění zákonných povinností</strong> (čl. 6 odst. 1 písm. c) GDPR): Vystavování a uchovávání daňových a účetních dokladů podle platných zákonů ČR.</p>
            <p><strong>Oprávněný zájem a marketing</strong> (čl. 6 odst. 1 písm. f) GDPR): Zasílání obchodních sdělení (newsletterů) stávajícím zákazníkům s nabídkou obdobných produktů a služeb podle § 7 odst. 3 zákona č. 480/2004 Sb. Zákazník má možnost se z odběru kdykoli jednoduše odhlásit (jedním kliknutím v patičce e-mailu). Dále ochrana právních nároků správce a zabezpečení webu proti zneužití.</p>
            <p><strong>Souhlas</strong> (čl. 6 odst. 1 písm. a) GDPR): Zasílání obchodních sdělení osobám, které dosud nejsou zákazníky, a umísťování volitelných analytických a marketingových cookies. Souhlas lze kdykoli odvolat, aniž je tím dotčena zákonnost zpracování před jeho odvoláním.</p>
            <p className="mt-2">Poskytnutí osobních údajů v rozsahu nezbytném pro vyřízení objednávky je smluvním požadavkem. Bez jejich poskytnutí nemůžeme objednávku přijmout ani zboží doručit. Poskytnutí údajů pro marketingové účely je zcela dobrovolné.</p>
            <p className="mt-2">Při zpracování osobních údajů nedochází k automatizovanému rozhodování ani k profilování ve smyslu čl. 22 GDPR.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">III. Práva subjektu údajů</h2>
            <p>Kupující má jako subjekt údajů podle nařízení GDPR následující práva:</p>
            <p>Právo na přístup k osobním údajům a informacím o jejich zpracování.</p>
            <p>Právo na opravu nepřesných nebo neúplných údajů.</p>
            <p>Právo na výmaz údajů („právo být zapomenut"), pokud již pominul účel nebo právní důvod jejich zpracování.</p>
            <p>Právo na omezení zpracování údajů.</p>
            <p>Právo na přenositelnost údajů jinému správci.</p>
            <p>Právo vznést námitku proti zpracování na základě oprávněného zájmu správce. Vznesete-li námitku proti zpracování pro účely přímého marketingu, přestaneme údaje pro tento účel zpracovávat bez dalšího.</p>
            <p>Právo kdykoli odvolat udělený souhlas se zpracováním (čl. 7 odst. 3 GDPR).</p>
            <p>Právo podat stížnost u Úřadu pro ochranu osobních údajů (ÚOOÚ), se sídlem Pplk. Sochora 27, 170 00 Praha 7, www.uoou.gov.cz.</p>
            <p className="mt-2">Svá práva uplatníte na e-mailu info@vapesport.cz. Na žádost odpovíme bez zbytečného odkladu, nejpozději do jednoho měsíce od jejího doručení.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">IV. Doba uchovávání údajů</h2>
            <p>Údaje nezbytné pro plnění smlouvy a zákonných povinností uchováváme po dobu stanovenou příslušnými právními předpisy (např. účetní a daňové doklady po dobu 10 let).</p>
            <p>Údaje zpracovávané za účelem ochrany právních nároků správce uchováváme po dobu běhu promlčecích lhůt, nejdéle 4 roky od ukončení smluvního vztahu.</p>
            <p>Pro marketingové účely a zasílání obchodních sdělení uchováváme údaje po dobu 3 let od posledního nákupu nebo interakce, nebo do momentu, kdy zákazník vznese námitku proti zpracování či odvolá svůj souhlas.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">V. Příjemci osobních údajů</h2>
            <p>Osobní údaje jsou bezpečně uloženy a chráněny proti zneužití pomocí odpovídajících technických a organizačních opatření.</p>
            <p className="mt-2"><strong>Zpracovatelé</strong>, kteří zpracovávají údaje podle našich pokynů a se kterými máme uzavřeny smlouvy o zpracování osobních údajů:</p>
            <p>Poskytovatel hostingu a provozu webu (Vercel Inc., USA).</p>
            <p>Poskytovatel databáze a autentizace (Supabase Inc., USA).</p>
            <p>Poskytovatel e-mailové platformy pro rozesílání systémových a marketingových zpráv (Resend, Inc., USA).</p>
            <p>Poskytovatel účetních a daňových služeb.</p>
            <p className="mt-2"><strong>Samostatní správci</strong>, kterým údaje předáváme v rozsahu nezbytném pro doručení zásilky a kteří o jejich dalším zpracování rozhodují sami:</p>
            <p>Zásilkovna s.r.o. (Packeta) — doručení na výdejní místa.</p>
            <p>PPL CZ s.r.o. — doručení na adresu.</p>
            <p className="mt-2">Osobní údaje mohou být dále zpřístupněny orgánům veřejné moci, vyžaduje-li to právní předpis.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">VI. Předávání do třetích zemí</h2>
            <p>Někteří z výše uvedených zpracovatelů jsou usazeni ve Spojených státech amerických, případně tam mohou být data zpracovávána. V takovém případě dochází k předání osobních údajů do třetí země mimo Evropský hospodářský prostor.</p>
            <p className="mt-2">Předání je zajištěno vhodnými zárukami podle kapitoly V GDPR — zejména standardními smluvními doložkami schválenými Evropskou komisí podle čl. 46 odst. 2 písm. c) GDPR, případně na základě rozhodnutí Evropské komise o odpovídající úrovni ochrany (rámec EU–US Data Privacy Framework) u příjemců, kteří jsou v tomto rámci certifikováni.</p>
            <p className="mt-2">Kopii použitých záruk vám na vyžádání poskytneme na e-mailu info@vapesport.cz.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">VII. Cookies</h2>
            <p>Web používá nezbytné (technické) cookies zajišťující jeho základní funkce — například obsah košíku nebo přihlášení do účtu. Tyto cookies nevyžadují souhlas.</p>
            <p className="mt-2">Volitelné analytické a marketingové cookies, včetně služby Google Analytics 4, používáme pouze s vaším předchozím souhlasem podle § 89 odst. 3 zákona č. 127/2005 Sb., o elektronických komunikacích.</p>
            <p className="mt-2">Souhlas můžete kdykoli odvolat nebo změnit jeho rozsah prostřednictvím nastavení cookies dostupného v patičce webu. Odvolání souhlasu je stejně snadné jako jeho udělení. Nastavení lze rovněž změnit ve vašem prohlížeči.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">VIII. Kontaktní údaje</h2>
            <p>Pro uplatnění jakýchkoli práv nebo v případě dotazů ohledně ochrany osobních údajů nás kontaktujte na e-mailové adrese: info@vapesport.cz.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">IX. Závěrečná ustanovení</h2>
            <p>Tyto zásady jsou účinné od {UCINNOST_OD} a nahrazují předchozí znění.</p>
            <p className="mt-2">Správce je oprávněn tyto zásady aktualizovat v návaznosti na změnu právních předpisů nebo rozsahu zpracování. Aktuální znění je vždy dostupné na této stránce.</p>
          </div>
        </article>
      </section>
      <Footer />
    </main>
  );
};

export default Privacy;
