import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Po přechodu na NOVOU stránku (klik na odkaz) posune okno nahoru,
 * aby nová stránka (např. detail produktu) začínala od začátku.
 *
 * Při návratu zpět / vpřed (navigační typ "POP") to ale NEDĚLÁ —
 * nechá prohlížeč obnovit původní pozici scrollu, takže „Zpět na katalog"
 * vrátí uživatele přesně tam, kde v katalogu skončil, a ne na začátek.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType(); // "POP" | "PUSH" | "REPLACE"

  useEffect(() => {
    if (navType === "POP") return; // návrat zpět/vpřed → obnoví prohlížeč
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, navType]);

  return null;
};

export default ScrollToTop;
