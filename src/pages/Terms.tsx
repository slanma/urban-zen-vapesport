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
            <p className="mt-3">
              Prodávající: Vapesport Vlach s.r.o., Sídlo: Paskovská 636/275, Ostrava-Hrabová, 720 00, IČ: 05819369, E-mail: info@vapesport.cz, Telefon: +420 606 080 922.
            </p>
            <p className="mt-3">Kupujícím může být spotřebitel (B2C) nebo podnikatel (B2B).</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">II. Uzavření kupní smlouvy a objednávka služeb</h2>
            <p>1. Kupní smlouva vzniká odesláním objednávky kupujícím a jejím následným potvrzením prodávajícím na e-mailovou adresu kupujícího.</p>
            <p>2. Předmětem smlouvy může být nákup zboží (cyklistické brašny a doplňky) nebo objednávka jednorázových služeb (např. golfový trénink, jednorázové AI konzultace).</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">III. Cena a platba</h2>
            <p>Ceny v CZK pro koncové zákazníky (B2C) jsou konečné, včetně DPH.</p>
            <p className="mt-3 font-semibold">Ceny v EUR pro B2B obchodníky:</p>
            <p>1. Prodávající poskytuje B2B partnerům ceník v eurech stanovený na základě aktuálního kurzu.</p>
            <p>2. Pokud se kurz CZK/EUR změní o více než ±5 %, prodávající si vyhrazuje právo ceny v EUR upravit.</p>
            <p>3. Výsledná cena bude fakturována podle kurzu ČNB platného v den vystavení faktury.</p>
            <p className="mt-3">Platba je možná bankovním převodem, dobírkou nebo on-line kartou.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">IV. Dodání zboží a realizace služeb</h2>
            <p>1. Fyzické zboží je dodáno na adresu nebo výdejní místo zvolené kupujícím.</p>
            <p>2. U jednorázových služeb (golfový trénink) se konkrétní termín a čas řeší s kupujícím následně osobně, telefonicky nebo e-mailovou dohodou.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">V. Odstoupení od smlouvy</h2>
            <p><strong>A. Zboží (B2C):</strong> Spotřebitel má právo odstoupit od smlouvy do 14 dnů od převzetí zboží bez udání důvodu. Náklady na vrácení zboží hradí kupující. Výjimkou je zboží upravené na zakázku.</p>
            <p className="mt-2"><strong>B. Služby (B2C):</strong> U jednorázových služeb (golfový trénink, konzultace) splněných s výslovným souhlasem před uplynutím 14 dnů právo na odstoupení zaniká okamžikem poskytnutí služby.</p>
            <p className="mt-2"><strong>C. Podnikatelé (B2B):</strong> Nákupem na IČO právo na odstoupení do 14 dnů nevzniká.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">VI. Reklamace a záruka</h2>
            <p>Zákonná záruka pro spotřebitele je 24 měsíců. Reklamace bude vyřízena nejpozději do 30 dnů.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">VII. Ochrana osobních údajů</h2>
            <p>Ochrana osobních údajů je popsána v samostatném dokumentu „Zásady ochrany osobních údajů".</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold mt-8 mb-3">VIII. Závěrečná ustanovení</h2>
            <p>Tyto obchodní podmínky jsou platné a účinné od data jejich zveřejnění.</p>
          </div>
        </article>
      </section>
      <Footer />
    </main>
  );
};

export default Terms;
