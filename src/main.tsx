import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./App";
import "./index.css";

// Po nasazení nové verze webu dostanou "kousky" stránek (chunky) nové názvy.
// Klient, který má otevřenou starou verzi, pak při přechodu na jinou stránku
// hledá starý kousek, který už na serveru není → prohlížeč dostane HTML místo
// JS a spadne to na "Unexpected token '<'". Vite na to má událost
// `vite:preloadError` — jednorázově načteme stránku znovu (fresh verze).
// Časová pojistka brání nekonečné smyčce obnovování.
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", () => {
    const now = Date.now();
    const last = Number(sessionStorage.getItem("vs-preload-reload-ts") || 0);
    if (now - last > 10000) {
      sessionStorage.setItem("vs-preload-reload-ts", String(now));
      window.location.reload();
    }
  });
}

// Prerender (SSG) při buildu, hydratace v prohlížeči.
export const createRoot = ViteReactSSG({ routes });
