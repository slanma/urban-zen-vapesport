import { useLocation } from "react-router-dom";
import { Head } from "vite-react-ssg";

// Vlastní titulek + popis pro statické stránky (obchod, o nás, kontakt…).
// Produktové stránky si titulek řeší samy (ProductDetail), proto tu nejsou.
// Titulka "/" zůstává na výchozím titulku z index.html.
const META: Record<string, { title: string; description: string }> = {
  "/obchod": {
    title: "Obchod – cyklobrašny a příslušenství | VAPESPORT",
    description:
      "Prohlédněte si celou nabídku brašen a příslušenství VAPESPORT a MORSEO pro elektrokola, gravel i městská kola.",
  },
  "/kolekce-morseo": {
    title: "Kolekce MORSEO – prémiové brašny na elektrokola | VAPESPORT",
    description:
      "MORSEO – prémiová řada nepromokavých cyklobrašen s promyšleným uchycením a odolnými materiály pro elektrokola a gravel.",
  },
  "/o-nas": {
    title: "O nás – česká značka od roku 1994 | VAPESPORT",
    description:
      "VAPESPORT je česká značka s více než 30 lety zkušeností. Vyrábíme prémiové brašny a příslušenství pro aktivní životní styl.",
  },
  "/kontakt": {
    title: "Kontakt | VAPESPORT",
    description:
      "Spojte se s námi – e-mail, telefon a otevírací doba. Rádi poradíme s výběrem brašny i s B2B spoluprací.",
  },
  "/aplikace-a-sluzby": {
    title: "Aplikace a služby | VAPESPORT",
    description:
      "Chytré systémy a služby VAPESPORT pro prodejny a cykloservisy – B2B nástroje, které nastartují váš obrat.",
  },
  "/obchodni-podminky": {
    title: "Obchodní podmínky | VAPESPORT",
    description: "Obchodní podmínky e-shopu VAPESPORT.",
  },
  "/ochrana-udaju": {
    title: "Ochrana osobních údajů | VAPESPORT",
    description: "Zásady zpracování a ochrany osobních údajů e-shopu VAPESPORT.",
  },
  "/odstoupeni": {
    title: "Odstoupení od smlouvy | VAPESPORT",
    description:
      "Informace a formulář pro odstoupení od kupní smlouvy – e-shop VAPESPORT.",
  },
};

const PageMeta = () => {
  const { pathname } = useLocation();
  const key = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  const meta = META[key];
  if (!meta) return null; // ostatní stránky (titulka, produkty…) si titulek řeší jinde

  return (
    <Head>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
    </Head>
  );
};

export default PageMeta;
