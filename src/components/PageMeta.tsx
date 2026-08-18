import { useLocation } from "react-router-dom";
import { Head } from "vite-react-ssg";
import {
  SITE,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
} from "@/lib/seo";

/**
 * Titulek, popis a náhledový obrázek pro sdílení – pro KAŽDOU stránku.
 *
 * Proč to je tady a ne v index.html: statické značky v index.html se nedají
 * přepsat, takže by na každé podstránce zůstal titulek a náhled z titulky.
 * Tady je jeden zdroj pravdy a každá cesta má svoje.
 *
 * Produktové stránky (/produkt/…) si titulek, popis i obrázek řeší samy
 * v ProductDetail (mají vlastní fotku a admin override), proto je tu
 * přeskakujeme a pošleme jen značky, které nezávisí na produktu.
 */
type Meta = { title: string; description: string; image?: string };

const META: Record<string, Meta> = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    image: "/og/og-default.jpg",
  },
  "/obchod": {
    title: "Obchod – cyklobrašny a příslušenství | VAPESPORT",
    description:
      "Prohlédněte si celou nabídku brašen a příslušenství VAPESPORT a MORSEO pro elektrokola, gravel i městská kola. Vyberte podle místa na kole.",
    image: "/og/og-obchod.jpg",
  },
  "/produkty": {
    title: "Katalog brašen | VAPESPORT",
    description:
      "Kompletní katalog cyklobrašen VAPESPORT a MORSEO – rámové, podsedlové, na řídítka, na mobil i na nosič.",
    image: "/og/og-obchod.jpg",
  },
  "/kolekce-morseo": {
    title: "Kolekce MORSEO EVO – prémiové brašny na elektrokola | VAPESPORT",
    description:
      "MORSEO EVO – devět kousků prémiových rámových brašen pro elektrokola a gravel. Úzký profil, voděodolný zip a silikonové pásky, které šetří lak.",
    image: "/og/og-kolekce-morseo.jpg",
  },
  "/outdoor": {
    title: "Outdoor návleky – na turistiku, trail i běžky | VAPESPORT",
    description:
      "Návleky VAPESPORT pro turistiku, trekking a běžky. Ochrana proti blátu, vodě a sněhu — vysoké, nízké i běžecké střihy ve velikostech M–XL.",
    image: "/og/og-outdoor.jpg",
  },
  "/o-nas": {
    title: "O nás – česká značka od roku 1994 | VAPESPORT",
    description:
      "VAPESPORT je česká značka s více než 30 lety zkušeností. Dvě generace, řemeslo z 90. let a designový purismus 21. století.",
    image: "/og/og-o-nas.jpg",
  },
  "/kontakt": {
    title: "Kontakt | VAPESPORT",
    description:
      "Spojte se s námi – e-mail, telefon a otevírací doba. Rádi poradíme s výběrem brašny i s B2B spoluprací. Ostrava-Hrabová, Po–Pá 9:00–14:00.",
    image: "/og/og-kontakt.jpg",
  },
  "/aplikace-a-sluzby": {
    title: "Aplikace a služby pro cykloprodejny | VAPESPORT",
    description:
      "Weby a e-shopy na míru, správa sociálních sítí a chytrá automatizace pro cykloprodejny a servisy. Od dodavatele, který rozumí cyklobranži.",
    image: "/og/og-aplikace-a-sluzby.jpg",
  },
  "/obchodni-podminky": {
    title: "Obchodní podmínky | VAPESPORT",
    description: "Obchodní podmínky e-shopu VAPESPORT.",
  },
  "/ochrana-udaju": {
    title: "Ochrana osobních údajů | VAPESPORT",
    description:
      "Zásady zpracování a ochrany osobních údajů e-shopu VAPESPORT.",
  },
  "/odstoupeni": {
    title: "Odstoupení od smlouvy | VAPESPORT",
    description:
      "Informace a formulář pro odstoupení od kupní smlouvy – e-shop VAPESPORT.",
  },
  "/b2b-login": {
    title: "B2B velkoobchod – přihlášení pro partnery | VAPESPORT",
    description:
      "Přihlášení do velkoobchodního portálu VAPESPORT. Velkoobchodní ceny, objednávky a podklady pro partnerské prodejny.",
  },
};

const PageMeta = () => {
  const { pathname } = useLocation();
  const path = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  const isProduct = path.startsWith("/produkt/");

  // Neznámá cesta (B2B portál, admin, 404…) dostane výchozí sadu,
  // ať nikde nechybí titulek a náhledový obrázek.
  const meta = META[path] ?? {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  };
  const image = absoluteUrl(meta.image ?? DEFAULT_OG_IMAGE);

  return (
    <Head>
      {/* POZOR: react-helmet čte jen PŘÍMÉ potomky <Head>. Značky zabalené
          do fragmentu (<>…</>) se zahodí a v HTML pak nejsou — proto je tu
          každá podmínka zvlášť a žádné obalování. */}
      <meta property="og:site_name" content="Vapesport" />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="cs_CZ" />
      <meta name="author" content="Vapesport Vlach s.r.o." />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@vapesport" />
      <meta name="twitter:creator" content="@vapesport" />

      {/* Produktové stránky si titulek, popis a fotku řeší samy v ProductDetail. */}
      {isProduct ? null : <title>{meta.title}</title>}
      {isProduct ? null : <meta name="description" content={meta.description} />}
      {isProduct ? null : <meta property="og:title" content={meta.title} />}
      {isProduct ? null : (
        <meta property="og:description" content={meta.description} />
      )}
      {isProduct ? null : <meta property="og:image" content={image} />}
      {isProduct ? null : <meta property="og:image:width" content="1200" />}
      {isProduct ? null : <meta property="og:image:height" content="630" />}
      {isProduct ? null : <meta property="og:image:alt" content={meta.title} />}
      {isProduct ? null : <meta name="twitter:title" content={meta.title} />}
      {isProduct ? null : (
        <meta name="twitter:description" content={meta.description} />
      )}
      {isProduct ? null : <meta name="twitter:image" content={image} />}
    </Head>
  );
};

export default PageMeta;
export { SITE };
