import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/** Datum účinnosti obchodních podmínek. Při každé úpravě textu změňte i tuto hodnotu. */
const UCINNOST_OD = "9. 8. 2026";

/**
 * Cesty na související stránky. Obojí ověřeno proti routingu aplikace.
 */
const ROUTE_PRIVACY = "/ochrana-udaju";
const ROUTE_WITHDRAWAL = "/odstoupeni";

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
          <p className="text-sm text-muted-foreground">Účinné od {UCINNOST_OD}</p>

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
            <p className="mt-3">Kupujícím může být spotřebitel (koncový zákazník v rámci B2C) nebo podnikatel (velkoobchodní partner nebo objednatel služeb, nakupující na IČO v rámci B2B). Pokud tyto podmínky nestanoví jinak, vztahují se na oba typy kupujících.</p>
            <p className="mt-3"><strong>Spotřebitelem</strong> se rozumí každý člověk, který mimo rámec své podnikatelské činnosti nebo mimo rámec samostatného výkonu svého povolání uzavírá smlouvu s prodávajícím nebo s ním jinak jedná (§ 419 občanského zákoníku). Ustanovení označená jako B2C se vztahují výhradně na spotřebitele.</p>
            <p className="mt-3">Právní vztahy mezi prodávajícím a kupujícím se řídí právním řádem České republiky, zejména zákonem č. 89/2012 Sb., občanský zákoník, a je-li kupujícím spotřebitel, také zákonem č. 634/1992 Sb., o ochraně spotřebitele.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">II. Informace před uzavřením smlouvy</h2>
            <p>V souladu s § 1811 a § 1820 občanského zákoníku prodávající sděluje, že:</p>
            <p className="mt-2">Náklady na prostředky komunikace na dálku se neliší od základní sazby a prodávající si za jejich použití neúčtuje žádné poplatky.</p>
            <p>Ceny zboží jsou uvedeny včetně DPH; náklady na dodání jsou uvedeny samostatně v objednávkovém procesu.</p>
            <p>Prodávající nepožaduje zálohu ani jinou obdobnou platbu, s výjimkou zboží nebo služeb připravovaných na zakázku, o čemž je kupující vždy předem informován.</p>
            <p>Prodávající není ve vztahu ke kupujícímu vázán žádnými kodexy chování ve smyslu § 1826 odst. 1 písm. e) občanského zákoníku.</p>
            <p>Smlouvu lze uzavřít v českém jazyce. Uzavřená smlouva je archivována v elektronické podobě, není přístupná třetím osobám a kupujícímu je zaslána v textové podobě na jeho e-mail.</p>
            <p>Kupující má právo od smlouvy odstoupit za podmínek uvedených v článku VI a v případě sporu právo na jeho mimosoudní řešení podle článku XI.</p>
            <p className="mt-2">Je-li u zboží uvedena sleva, prodávající vedle zlevněné ceny uvádí rovněž nejnižší cenu, za kterou zboží nabízel v době 30 dnů před poskytnutím slevy (§ 12a zákona o ochraně spotřebitele).</p>
            <p className="mt-2">Fotografie u zboží mají ilustrativní charakter; rozhodující je textový popis a technická specifikace.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">III. Uzavření kupní smlouvy a objednávka služeb</h2>
            <p>Prezentace zboží na webových stránkách má informativní charakter; ustanovení § 1732 odst. 2 občanského zákoníku se nepoužije.</p>
            <p className="mt-2">Kupující odesílá objednávku kliknutím na tlačítko, které je jednoznačně označeno tak, aby z něj vyplývala povinnost k platbě (§ 1826 odst. 2 občanského zákoníku). Bezprostředně nad tímto tlačítkem je uvedena celková cena k úhradě. Před odesláním má kupující možnost všechny zadané údaje zkontrolovat a změnit. Odesláním objednávky kupující potvrzuje, že se seznámil s těmito obchodními podmínkami a souhlasí s nimi.</p>
            <p className="mt-2">Kupní smlouva (nebo smlouva o poskytnutí služby) je uzavřena okamžikem doručení potvrzení objednávky ze strany prodávajícího na e-mailovou adresu kupujícího. Automatické oznámení o přijetí objednávky do systému se za potvrzení nepovažuje, není-li v něm výslovně uvedeno jinak.</p>
            <p className="mt-2">Prodávající zašle kupujícímu bez zbytečného odkladu po uzavření smlouvy potvrzení o uzavřené smlouvě v textové podobě, včetně těchto obchodních podmínek a poučení o právu odstoupit od smlouvy (§ 1824a občanského zákoníku).</p>
            <p className="mt-2">Kupující je povinen uvést správné, pravdivé a úplné údaje při objednávce.</p>
            <p className="mt-2">Předmětem smlouvy může být nákup zboží (cyklistické brašny a doplňky) nebo objednávka služeb nabízených prodávajícím.</p>
            <p className="mt-2">Prodávající je oprávněn od smlouvy odstoupit, pokud zboží není dostupné a nelze jej nahradit, došlo ke zjevné chybě v uvedené ceně, nebo kupující neuhradil kupní cenu ve lhůtě splatnosti u platby předem. O odstoupení prodávající kupujícího neprodleně informuje a již uhrazenou částku vrátí do 14 dnů.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">IV. Cena a platba</h2>
            <p className="font-semibold">Ceny v českých korunách (CZK) pro koncové zákazníky (B2C):</p>
            <p>Ceny uvedené na webových stránkách jsou konečné, včetně DPH a všech zákonných poplatků. Cena nezahrnuje náklady na dopravu zboží ani případný příplatek za zvolený způsob platby; obojí je zobrazeno v košíku před dokončením objednávky.</p>
            <p className="mt-3 font-semibold">Ceny v eurech (EUR) pro B2B obchodníky:</p>
            <p>Prodávající poskytuje obchodním partnerům (B2B) ceník v eurech, který je stanoven na základě aktuálního kurzu české koruny vůči euru v době jeho vystavení.</p>
            <p>Pokud se kurz české koruny vůči euru změní o více než ±5 % oproti kurzu uvedenému v odeslaném ceníku, prodávající si vyhrazuje právo ceny v eurech v ceníku jednostranně upravit. Tato úprava se nevztahuje na již potvrzené objednávky.</p>
            <p>Výsledná cena bude pevně potvrzena při vystavení faktury, a to podle kurzu České národní banky (ČNB) platného v den vystavení faktury.</p>
            <p className="mt-3 font-semibold">Způsoby platby:</p>
            <p>Bankovním převodem na účet prodávajícího, a to i pomocí QR platby.</p>
            <p>Dobírkou při převzetí zboží — u zásilek doručovaných prostřednictvím Zásilkovny nebo PPL, s příplatkem uvedeným v košíku.</p>
            <p>Hotově při osobním odběru na prodejně.</p>
            <p>Platbou na fakturu se splatností — pouze pro schválené B2B partnery.</p>
            <p className="mt-2">Dostupné způsoby platby se mohou lišit podle zvoleného způsobu dopravy; aktuální kombinace jsou vždy zobrazeny v objednávkovém procesu.</p>
            <p className="mt-3">Daňový doklad vystaví prodávající v elektronické podobě a zašle jej na e-mail kupujícího, s čímž kupující souhlasí.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">V. Dodání fyzického zboží a realizace služeb</h2>
            <p><strong>Fyzické zboží:</strong> Prodávající dodá zboží způsobem zvoleným kupujícím v objednávce — prostřednictvím výdejních míst Zásilkovny, doručením na adresu přepravcem, nebo osobním odběrem na prodejně. Náklady na dopravu jsou specifikovány v procesu objednávky. Prodávající dodá zboží bez zbytečného odkladu, nejpozději do 30 dnů od uzavření kupní smlouvy, nedohodnou-li se strany jinak. Při platbě předem začíná dodací lhůta běžet od připsání platby na účet prodávajícího.</p>
            <p className="mt-2"><strong>Přechod nebezpečí škody:</strong> Je-li kupujícím spotřebitel, přechází na něj nebezpečí škody na zboží okamžikem převzetí zboží spotřebitelem nebo jím určenou třetí osobou odlišnou od dopravce. Určí-li dopravce spotřebitel, aniž mu byl prodávajícím nabídnut, přechází nebezpečí předáním zboží dopravci. Je-li kupujícím podnikatel, přechází nebezpečí škody předáním zboží prvnímu dopravci.</p>
            <p className="mt-2">Nepřevzetím řádně objednané zásilky kupní smlouva nezaniká. Nepřevezme-li kupující zásilku (např. při platbě na dobírku), vzniká prodávajícímu nárok na náhradu skutečně vynaložených nákladů spojených s dodáním (poštovné k zákazníkovi i zpět). Prodávající je oprávněn vyzvat kupujícího k jejich úhradě. Tímto není dotčeno právo spotřebitele odstoupit od smlouvy podle článku VI.</p>
            <p className="mt-2"><strong>Jednorázové služby:</strong> V případě jednorázových služeb objednaných přes e-shop (např. tréninky, konzultace a obdobné služby) se konkrétní realizace, termín a podmínky plnění řeší s kupujícím následně (osobně, telefonicky nebo e-mailem), případně dle potvrzené specifikace v objednávce.</p>
            <p className="mt-2"><strong>Služby poskytované opakovaně:</strong> U služeb s pravidelnou měsíční platbou (zejména správa a provoz webu, správa sociálních sítí, newsletter, grafické podklady, měsíční kontrola a aktualizace) se plnění poskytuje průběžně po dobu trvání smlouvy. Není-li ujednáno jinak, uzavírá se smlouva na dobu neurčitou s měsíčním zúčtovacím obdobím a výpovědní dobou jeden měsíc, která počíná běžet prvním dnem měsíce následujícího po doručení výpovědi. Kterákoli strana může smlouvu vypovědět i bez udání důvodu. Jednorázově uhrazené položky (např. pořízení webu, natočení materiálů, naplnění webu produkty) se při ukončení smlouvy nevracejí. Podmínky předání dat, obsahu a přístupů při ukončení spolupráce se řídí individuální dohodou.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">VI. Odstoupení od smlouvy</h2>
            <p><strong>A. Prodej zboží koncovým spotřebitelům (B2C):</strong></p>
            <p>Kupující (spotřebitel) má právo odstoupit od smlouvy do 14 dnů bez udání důvodu (§ 1829 občanského zákoníku).</p>
            <p className="mt-2">Lhůta začíná běžet ode dne převzetí zboží. Je-li předmětem smlouvy několik kusů zboží objednaných v jedné objednávce a dodávaných samostatně, běží lhůta ode dne převzetí poslední dodávky; u zboží sestávajícího z několika položek nebo částí ode dne převzetí poslední položky nebo části. Lhůta je zachována, je-li odstoupení odesláno nejpozději poslední den lhůty.</p>
            <p className="mt-2">Nebyl-li spotřebitel o právu odstoupit od smlouvy poučen, může odstoupit do 1 roku a 14 dnů od počátku běhu lhůty. Byl-li poučen v průběhu této doby, běží 14denní lhůta ode dne poučení.</p>
            <p className="mt-2">Odstoupit lze jakýmkoli jednoznačným prohlášením vůči prodávajícímu, zejména prostřednictvím{" "}
              <Link className="underline hover:no-underline" to={ROUTE_WITHDRAWAL}>formuláře pro odstoupení od smlouvy</Link>{" "}
              na tomto webu, e-mailem na info@vapesport.cz nebo písemně na adresu sídla. Prodávající potvrdí spotřebiteli přijetí odstoupení bez zbytečného odkladu v textové podobě.</p>
            <p className="mt-2">Spotřebitel zašle nebo předá zboží prodávajícímu bez zbytečného odkladu, nejpozději do 14 dnů od odstoupení od smlouvy. Náklady spojené s vrácením zboží prodávajícímu hradí v plné výši kupující, a to i v případě, vrací-li se zboží, které nemůže být pro svou povahu vráceno obvyklou poštovní cestou.</p>
            <p className="mt-2">Prodávající vrátí přijaté peněžní prostředky (včetně nákladů na dodání ve výši nejlevnějšího prodávajícím nabízeného způsobu dodání) do 14 dnů od odstoupení, a to stejným způsobem, jakým je přijal, nedohodnou-li se strany jinak. Prodávající není povinen vrátit peníze dříve, než mu kupující zboží předá nebo prokáže jeho odeslání.</p>
            <p className="mt-2">Spotřebitel je oprávněn zboží vyzkoušet a seznámit se s jeho povahou, vlastnostmi a funkčností obdobně, jako by tak učinil v kamenné prodejně. Spotřebitel však odpovídá prodávajícímu za snížení hodnoty zboží, které vzniklo v důsledku nakládání s tímto zbožím jinak, než je k takovému seznámení nutné (§ 1833 občanského zákoníku) — zejména v důsledku užívání zboží v provozu, jeho znečištění, poškození nebo opotřebení. Nárok na náhradu snížení hodnoty je prodávající oprávněn jednostranně započíst proti nároku kupujícího na vrácení kupní ceny; vzniklou újmu je prodávající povinen prokázat.</p>
            <p className="mt-2"><strong>Výjimky z práva na odstoupení (§ 1837 občanského zákoníku):</strong> Spotřebitel nemůže odstoupit od smlouvy zejména o dodávce zboží vyrobeného podle jeho požadavků nebo přizpůsobeného jeho osobním potřebám (např. brašna v individuálním provedení nebo s potiskem na zakázku), zboží v zapečetěném obalu, které z hygienických důvodů není vhodné vrátit poté, co jej spotřebitel porušil, a zboží, jehož cena závisí na výchylkách finančního trhu nezávisle na vůli prodávajícího.</p>
            <p className="mt-2">Byl-li spolu se zbožím poskytnut dárek, pozbývá darovací smlouva odstoupením od kupní smlouvy účinnosti a spotřebitel je povinen dárek vrátit spolu se zbožím.</p>

            <p className="mt-4"><strong>B. Poskytování služeb koncovým spotřebitelům (B2C):</strong></p>
            <p>I u smlouvy o poskytnutí služby má spotřebitel právo odstoupit do 14 dnů od jejího uzavření.</p>
            <p className="mt-2">Požaduje-li spotřebitel, aby poskytování služby začalo již v průběhu této lhůty, musí o to prodávajícího výslovně požádat. Prodávající spotřebitele současně poučí, že splněním služby právo na odstoupení zaniká. Toto poučení je součástí objednávkového procesu a spotřebitel je při objednávce výslovně potvrzuje.</p>
            <p className="mt-2">Právo odstoupit od smlouvy zaniká okamžikem úplného poskytnutí služby, byly-li splněny obě uvedené podmínky (§ 1837 písm. a) občanského zákoníku).</p>
            <p className="mt-2">Odstoupí-li spotřebitel od smlouvy v době, kdy již bylo s poskytováním služby započato, ale služba dosud nebyla poskytnuta zcela, uhradí prodávajícímu poměrnou část sjednané ceny odpovídající rozsahu již poskytnutého plnění (§ 1834 občanského zákoníku).</p>
            <p className="mt-2">Nebyl-li u zakoupeného voucheru dosud sjednán ani zahájen termín plnění, právo na odstoupení do 14 dnů trvá v plném rozsahu. Podmínky storna nebo přesunu již sjednaného termínu ze strany zákazníka se řeší individuální dohodou.</p>

            <p className="mt-4"><strong>C. Vztahy s podnikateli (B2B):</strong></p>
            <p>Pokud je kupujícím podnikatel (nákup na IČO), právo na odstoupení od smlouvy do 14 dnů bez udání důvodu nevzniká. Jakékoli storno objednávky nebo vrácení zboží podléhá schválení prodávajícího. Tím není dotčeno právo vypovědět smlouvu o opakovaně poskytovaných službách podle článku V.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">VII. Práva z vadného plnění</h2>
            <p><strong>Jakost při převzetí.</strong> Prodávající odpovídá kupujícímu, že zboží při převzetí nemá vady — zejména že odpovídá ujednanému popisu, druhu, množství a jakosti, je vhodné k účelu, k němuž se zboží tohoto druhu obvykle používá, je dodáno s ujednaným příslušenstvím a pokyny k použití a odpovídá vlastnostem obvyklým pro zboží téhož druhu, které může kupující rozumně očekávat (§ 2161 občanského zákoníku).</p>
            <p className="mt-2"><strong>Domněnka vadnosti.</strong> Projeví-li se vada v průběhu jednoho roku od převzetí, má se za to, že zboží bylo vadné již při převzetí, ledaže to povaha zboží nebo vady vylučuje.</p>
            <p className="mt-2"><strong>Lhůta pro uplatnění.</strong> Spotřebitel může vytknout vadu, která se u zboží projeví v době 2 let od převzetí (§ 2165 občanského zákoníku). Vytkl-li kupující vadu oprávněně, tato doba neběží po dobu, po kterou kupující nemůže zboží užívat.</p>
            <p className="mt-2"><strong>Práva kupujícího.</strong> Má-li zboží vadu, může kupující požadovat její odstranění, a to podle své volby dodáním nového zboží bez vady nebo opravou zboží — ledaže je zvolený způsob nemožný nebo ve srovnání s druhým nepřiměřeně nákladný (§ 2169 občanského zákoníku). Prodávající odstraní vadu v přiměřené době po jejím vytknutí a bezplatně tak, aby tím kupujícímu nezpůsobil značné obtíže.</p>
            <p className="mt-2"><strong>Sleva a odstoupení.</strong> Kupující může požadovat přiměřenou slevu z kupní ceny nebo odstoupit od smlouvy, pokud prodávající vadu odmítl odstranit nebo ji neodstranil řádně, pokud se vada projeví opakovaně, pokud je vada podstatným porušením smlouvy, nebo pokud je z prohlášení prodávajícího či z okolností zjevné, že vada nebude odstraněna v přiměřené době nebo bez značných obtíží pro kupujícího (§ 2171 občanského zákoníku). Od smlouvy nelze odstoupit, je-li vada nevýznamná.</p>
            <p className="mt-2"><strong>Kdy práva z vadného plnění nevznikají.</strong> Prodávající neodpovídá za vady vzniklé běžným opotřebením (zejména oděr tkaniny a potisku, opotřebení zipů, spon, suchých zipů a úchytů běžným používáním), mechanickým poškozením, nesprávným používáním v rozporu s návodem a doporučeným účelem, nesprávnou údržbou či praním, přetěžováním nad deklarovanou nosnost, ani za vady způsobené neodbornou úpravou zboží kupujícím nebo třetí osobou.</p>
            <p className="mt-2"><strong>Záruka za jakost.</strong> Poskytne-li prodávající nad rámec zákonných práv záruku za jakost, je její rozsah a doba uvedena u konkrétního zboží nebo v záručním listu vydaném v textové podobě. Zárukou nejsou dotčena zákonná práva kupujícího z vadného plnění.</p>
            <p className="mt-2"><strong>B2B.</strong> Je-li kupujícím podnikatel, řídí se práva z vadného plnění § 2099 a násl. občanského zákoníku. Kupující je povinen zboží prohlédnout co nejdříve po přechodu nebezpečí škody a zjevné vady vytknout bez zbytečného odkladu, nejpozději do 5 pracovních dnů od převzetí. Skryté vady je kupující povinen vytknout bez zbytečného odkladu poté, co je mohl při dostatečné péči zjistit; strany si výslovně ujednávají, že lhůta pro vytčení skryté vady podle § 2112 odst. 1 občanského zákoníku se zkracuje na 12 měsíců od odevzdání zboží.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">VIII. Uplatnění reklamace</h2>
            <p>Reklamaci kupující uplatní u prodávajícího na adrese sídla nebo e-mailem na info@vapesport.cz. Doporučujeme přiložit doklad o koupi, popis vady a uvést preferovaný způsob vyřízení.</p>
            <p className="mt-2">Prodávající vydá kupujícímu písemné potvrzení o uplatnění reklamace, ve kterém uvede datum uplatnění, obsah reklamace, požadovaný způsob vyřízení a kontaktní údaje kupujícího (§ 19 odst. 1 zákona o ochraně spotřebitele).</p>
            <p className="mt-2">Je-li kupujícím spotřebitel, prodávající o reklamaci rozhodne ihned, ve složitých případech do 3 pracovních dnů; do této lhůty se nezapočítává doba přiměřená podle druhu výrobku potřebná k odbornému posouzení vady. Reklamaci včetně odstranění vady prodávající vyřídí a o jejím vyřízení spotřebitele informuje nejpozději do 30 dnů ode dne jejího uplatnění, nedohodnou-li se strany na delší lhůtě. Marné uplynutí této lhůty se považuje za podstatné porušení smlouvy a spotřebitel je oprávněn od smlouvy odstoupit nebo požadovat přiměřenou slevu.</p>
            <p className="mt-2">Prodávající vydá kupujícímu potvrzení o datu a způsobu vyřízení reklamace, včetně potvrzení o provedení opravy a době jejího trvání, případně písemné odůvodnění zamítnutí reklamace.</p>
            <p className="mt-2">Nevyzvedne-li si kupující zboží v přiměřené době poté, co byl vyrozuměn o vyřízení reklamace a možnosti zboží převzít, je prodávající oprávněn požadovat úplatu za uskladnění.</p>
            <p className="mt-2">Kupující má právo na úhradu účelně vynaložených nákladů spojených s uplatněním oprávněné reklamace. Reklamované zboží by mělo být předáno přiměřeně čisté.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">IX. Obchodní sdělení</h2>
            <p>Prodávající je oprávněn zasílat kupujícímu, který u něj zakoupil zboží nebo služby, obchodní sdělení týkající se vlastních obdobných výrobků a služeb na e-mailovou adresu poskytnutou v souvislosti s nákupem, a to na základě § 7 odst. 3 zákona č. 480/2004 Sb., o některých službách informační společnosti.</p>
            <p className="mt-2">Kupující má právo zasílání obchodních sdělení kdykoli bezplatně odmítnout, a to jak při uzavření smlouvy, tak při zaslání každé jednotlivé zprávy — prostřednictvím odkazu pro odhlášení v patičce e-mailu nebo zprávou na info@vapesport.cz.</p>
            <p className="mt-2">Osobám, které u prodávajícího dosud nenakoupily, jsou obchodní sdělení zasílána výhradně na základě předchozího souhlasu.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">X. Ochrana osobních údajů</h2>
            <p>Ochrana osobních údajů kupujícího je podrobně popsána v samostatném dokumentu{" "}
              <Link className="underline hover:no-underline" to={ROUTE_PRIVACY}>Zásady ochrany osobních údajů</Link>, který je dostupný rovněž v patičce webu.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">XI. Mimosoudní řešení sporů a dozor</h2>
            <p>K mimosoudnímu řešení spotřebitelských sporů z kupní smlouvy je příslušná Česká obchodní inspekce, Ústřední inspektorát — oddělení ADR, Gorazdova 1969/24, 120 00 Praha 2, e-mail adr@coi.gov.cz, internetová adresa coi.gov.cz/informace-o-adr/.</p>
            <p className="mt-2">Řízení lze zahájit na návrh spotřebitele, pokud se mu spor nepodařilo vyřešit přímo s prodávajícím. Návrh lze podat nejpozději do 1 roku ode dne, kdy spotřebitel uplatnil své právo u prodávajícího poprvé. Řízení je pro spotřebitele bezplatné.</p>
            <p className="mt-2">V případě přeshraničního sporu v rámci EU se spotřebitel může obrátit na Evropské spotřebitelské centrum ČR (www.evropskyspotrebitel.cz).</p>
            <p className="mt-2">Dozor nad dodržováním povinností vykonává Česká obchodní inspekce (www.coi.gov.cz), v oblasti ochrany osobních údajů Úřad pro ochranu osobních údajů a v oblasti živnostenského podnikání příslušný živnostenský úřad.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">XII. Závěrečná ustanovení</h2>
            <p>Tyto obchodní podmínky jsou účinné od {UCINNOST_OD}. Pro konkrétní objednávku je vždy rozhodné znění účinné ke dni jejího odeslání.</p>
            <p className="mt-2">Prodávající si vyhrazuje právo tyto obchodní podmínky měnit či doplňovat v závislosti na změně legislativy či obchodní politiky společnosti. Změnou obchodních podmínek nejsou dotčena práva a povinnosti vzniklá po dobu účinnosti předchozího znění.</p>
            <p className="mt-2">Je-li některé ustanovení těchto obchodních podmínek neplatné nebo neúčinné, nastoupí namísto něj ustanovení, jehož smysl se neplatnému ustanovení co nejvíce přibližuje. Neplatností nebo neúčinností jednoho ustanovení není dotčena platnost ostatních ustanovení.</p>
            <p className="mt-2">Vztahuje-li se na smluvní vztah zahraniční prvek, řídí se vztah českým právem; volbou práva není spotřebitel zbaven ochrany, kterou mu poskytují ustanovení právního řádu státu jeho obvyklého bydliště, od nichž se nelze smluvně odchýlit.</p>
          </div>
        </article>
      </section>
      <Footer />
    </main>
  );
};

export default Terms;
