import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Po přechodu na jinou stránku (změna cesty) posune okno nahoru,
 * aby nová stránka (např. detail produktu) začínala od začátku
 * a uživatel nemusel rolovat nahoru.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
