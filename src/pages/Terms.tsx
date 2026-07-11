import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24 px-6 lg:px-12 max-w-3xl mx-auto">
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-10">
          Obchodní podmínky
        </h1>
        <article className="font-body text-base leading-relaxed text-foreground space-y-6">
          <p className="font-semibold uppercase tracking-wide">
            Obchodní podmínky společnosti Vapesport Vlach s.r.o.
          </p>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">I. Úvodní ustanovení</h2>
            <p>
              Tyto obchodní podmínky upravují práva a povinnosti mezi společností Vapesport Vlach s.r.o. (dále jen „prodávající") a zákazníky (dále jen „kupující") při prodeji zboží a poskytování služeb prostřednictvím webových stránek www.vapesport.cz, jakož i při přímém prodeji.
            </p>
            <p className="mt-3"><strong>Prodávající:</strong></p>
            <p>Název společnosti: Vapesport Vlach s.r.o.</p>
            <p>Sídlo: Paskovská 636/275, Ostrava-Hrabová, 720 00</p>
            <p>IČ: 05819369, DIČ: CZ05819369 (plátce DPH)</p>
            <p>Zapsaná v obchodním rejstříku vedeném Krajským soudem v Ostravě, sp. zn. C 69479</p>
            <p>E-mail: info@vapesport.cz, Telefon: +420 606 080 922</p>
            <p>Datová schránka: 9becuy2</p>
            <p className="mt-3">Kupujícím může být spotřebitel (koncový zákazník v rámci B2C) nebo podnikatel (velkoobchodní partner, nakupující na IČO v rámci B2B). Pokud tyto podmínky nestanoví jinak, vztahují se na oba typy kupujících.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">II. Uzavření kupní smlouvy a objednávka služeb</h2>
            <p>Kupní smlouva (nebo smlouva o poskytnutí služby) vzniká odesláním objednávky kupujícím prostřednictvím e-shopu a jejím následným potvrzením prodávajícím na e-mailovou adresu kupujícího.</p>
            <p className="mt-2">Kupující je povinen uvést správné, pravdivé a úplné údaje při objednávce.</p>
            <p className="mt-2">Předmětem smlouvy může být nákup zboží (cyklistické brašny a doplňky) nebo objednávka jednorázových služeb nabízených prodávajícím (např. tréninky, konzultace a obdobné služby).</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">III. Cena a platba</h2>
            <p className="font-semibold">Ceny v českých korunách (CZK) pro koncové zákazníky (B2C):</p>
            <p>Ceny uvedené na webových stránkách jsou konečné, včetně DPH a všech zákonných poplatků. Cena nezahrnuje náklady na dopravu zboží, které jsou zobrazeny v košíku před dokončením objednávky.</p>
            <p className="mt-3 font-semibold">Ceny v eurech (EUR) pro B2B obchodníky:</p>
            <p>Prodávající poskytuje obchodním partnerům (B2B) ceník v eurech, který je stanoven na základě aktuálního kurzu české koruny vůči euru v době jeho vystavení.</p>
            <p>Pokud se kurz české koruny vůči euru změní o více než ±5 % oproti kurzu uvedenému v odeslaném ceníku, prodávající si vyhrazuje právo ceny v eurech jednostranně upravit.</p>
            <p>Výsledná cena bude pevně potvrzena při vystavení faktury, a to podle kurzu České národní banky (ČNB) platného v den vystavení faktury.</p>
            <p className="mt-3 font-semibold">Způsoby platby:</p>
            <p>Bankovním převodem na účet prodávajícího (včetně platby pomocí QR kódu).</p>
            <p>Dobírkou při převzetí zboží (pouze u fyzického zboží).</p>
            <p>On-line platební kartou přes platební bránu.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">IV. Dodání fyzického zboží a realizace služeb</h2>
            <p><strong>Fyzické zboží:</strong> Prodávající dodá zboží na adresu uvedenou kupujícím při objednávce, případně na výdejní místo zvolené kupujícím. Náklady na dopravu jsou specifikovány v procesu objednávky. Nebezpečí škody na zboží přechází na kupujícího převzetím zboží.</p>
            <p>Nepřevzetím řádně objednané zásilky kupní smlouva nezaniká. Nepřevezme-li kupující zásilku (např. při platbě na dobírku), vzniká prodávajícímu nárok na náhradu skutečně vynaložených nákladů spojených s dodáním (poštovné k zákazníkovi i zpět). Prodávající je oprávněn vyzvat kupujícího k jejich úhradě.</p>
            <p className="mt-2"><strong>Služby:</strong> V případě jednorázových služeb objednaných přes e-shop se konkrétní realizace, termín a podmínky plnění řeší s kupujícím následně (osobně, telefonicky nebo e-mailem), případně dle potvrzené specifikace v objednávce. U digitálního plnění nebo konzultací se podmínky dodání řídí individuální dohodou.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">V. Odstoupení od smlouvy</h2>
            <p><strong>A. Prodej zboží koncovým spotřebitelům (B2C):</strong></p>
            <p>Kupující (spotřebitel) má právo odstoupit od smlouvy do 14 dnů od převzetí zboží bez udání důvodu.</p>
            <p>Zboží musí být vráceno nepoškozené, nepoužité, kompletní a v původním obalu. Náklady spojené s vrácením zboží prodávajícímu hradí v plné výši kupující.</p>
            <p>Kupující bere na vědomí, že v případě odstoupení od smlouvy nese náklady spojené s vrácením zboží prodávajícímu, a to i v případě, vrací-li se zboží, které nemůže být pro svou povahu vráceno obvyklou poštovní cestou.</p>
            <p>Prodávající vrátí přijaté peněžní prostředky (včetně nákladů na dodání ve výši nejlevnějšího nabízeného způsobu) do 14 dnů od odstoupení, a to stejným způsobem, jakým je přijal. Prodávající není povinen vrátit peníze dříve, než mu kupující zboží předá nebo prokáže jeho odeslání.</p>
            <p>Spotřebitel odpovídá prodávajícímu za snížení hodnoty zboží, které vzniklo v důsledku nakládání s tímto zbožím jinak, než je nutné s ním nakládat s ohledem na jeho povahu a vlastnosti. Pokud je vrácené zboží poškozené, opotřebené či částečně spotřebované, vzniká prodávajícímu vůči kupujícímu nárok na náhradu škody. Nárok na úhradu škody je prodávající oprávněn jednostranně započíst proti nároku kupujícího na vrácení kupní ceny.</p>
            <p>Výjimky z práva na odstoupení: Kupující nemůže odstoupit od smlouvy u zboží, které bylo vyrobeno nebo upraveno na zakázku podle přání kupujícího (§ 1837 občanského zákoníku).</p>
            <p className="mt-2"><strong>B. Poskytování služeb koncovým spotřebitelům (B2C):</strong></p>
            <p>V případě objednávky jednorázových služeb (např. tréninky, konzultace a obdobné služby), které jsou splněny nebo započaty s výslovným souhlasem kupujícího před uplynutím lhůty 14 dnů od objednání, právo kupujícího na odstoupení od smlouvy zaniká okamžikem splnění/poskytnutí služby.</p>
            <p>Zakoupením jednorázové lekce/voucheru kupující vyjadřuje souhlas s okamžitým zajištěním kapacity služby. Podmínky storna nebo přesunu termínu ze strany zákazníka se řeší individuální dohodou.</p>
            <p className="mt-2"><strong>C. Vztahy s podnikateli (B2B):</strong></p>
            <p>Pokud je kupujícím podnikatel (nákup na IČO), právo na odstoupení od smlouvy do 14 dnů bez udání důvodu nevzniká. Jakékoli storno objednávky nebo vrácení zboží podléhá schválení prodávajícího.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">VI. Reklamace a záruka</h2>
            <p>Na veškeré nové fyzické zboží se pro koncové spotřebitele vztahuje zákonná záruka 24 měsíců. Pro podnikatele (B2B) se záruční lhůta řídí individuální dohodou nebo platným právním řádem ČR pro podnikatelské subjekty.</p>
            <p className="mt-2">Reklamaci kupující uplatní u prodávajícího na adrese sídla nebo e-mailem na info@vapesport.cz; doporučujeme přiložit doklad o koupi a popis vady. Je-li vada odstranitelná, může spotřebitel požadovat opravu nebo dodání nové věci; není-li to možné, přiměřenou slevu nebo odstoupení od smlouvy.</p>
            <p className="mt-2">Reklamace spotřebitele bude vyřízena nejpozději do 30 dnů od jejího uplatnění a doručení reklamovaného zboží prodávajícímu, pokud se strany nedohodnou na delší lhůtě.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">VII. Ochrana osobních údajů</h2>
            <p>Ochrana osobních údajů kupujícího je podrobně popsána v samostatném dokumentu „Zásady ochrany osobních údajů", který je dostupný v patičce webu.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">VIII. Mimosoudní řešení sporů a dozor</h2>
            <p>K mimosoudnímu řešení spotřebitelských sporů z kupní smlouvy je příslušná Česká obchodní inspekce, se sídlem Štěpánská 796/44, 110 00 Praha 1, internetová adresa www.coi.cz (návrh lze podat na adrese adr.coi.cz).</p>
            <p className="mt-2">Spotřebitel může využít rovněž platformu pro řešení sporů on-line na adrese ec.europa.eu/consumers/odr.</p>
            <p className="mt-2">Dozor nad dodržováním povinností vykonává Česká obchodní inspekce, v oblasti ochrany osobních údajů Úřad pro ochranu osobních údajů a v oblasti živnostenského podnikání příslušný živnostenský úřad.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">IX. Závěrečná ustanovení</h2>
            <p>Tyto obchodní podmínky jsou platné a účinné v tomto znění pro všechny objednávky realizované od data jejich zveřejnění.</p>
            <p>Veškeré vztahy se řídí právním řádem České republiky.</p>
            <p>Prodávající si vyhrazuje právo tyto obchodní podmínky měnit či doplňovat v závislosti na změně legislativy či obchodní politiky společnosti.</p>
          </div>
        </article>
      </section>
      <Footer />
    </main>
  );
};

export default Terms;
