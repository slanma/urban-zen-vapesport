import { useLocation } from "react-router-dom";
import { Head } from "vite-react-ssg";

const SITE = "https://www.vapesport.cz";

// Nastaví správnou canonical + og:url pro KAŽDOU stránku podle aktuální cesty.
// Díky tomu má titulka, obchod i každý produkt vlastní kanonickou adresu
// (ne jednu společnou z index.html). Řídí se hlavní doménou s www.
const Canonical = () => {
  const { pathname } = useLocation();
  // Normalizace: kořen necháme jako "/", jinak odstraníme koncové lomítko.
  const path = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  const url = `${SITE}${path}`;

  return (
    <Head>
      <link rel="canonical" href={url} />
      <meta property="og:url" content={url} />
    </Head>
  );
};

export default Canonical;
