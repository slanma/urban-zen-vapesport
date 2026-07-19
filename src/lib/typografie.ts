/**
 * Česká typografie: jednoznakové i krátké předložky a spojky nemají zůstávat
 * na konci řádku. Nahradíme mezeru za nimi pevnou mezerou (NBSP), takže se
 * přilepí k následujícímu slovu — funguje responsivně (mobil i desktop),
 * protože jde o obsah textu, ne o CSS.
 *
 * Příklad: „Brašny na dobrodružství po zpevněných…“
 *   → „na“ i „po“ se přilepí k dalšímu slovu a nezůstanou na konci řádku.
 */

const NBSP = "\u00A0";

// Předložky a spojky, které přilepujeme k následujícímu slovu.
const BINDERS = [
  // jednoznakové (dle typografických pravidel povinné)
  "k", "s", "v", "z", "o", "u", "a", "i",
  // krátké předložky
  "na", "do", "po", "od", "ze", "se", "ke", "ku", "ve", "za", "ob",
  "bez", "pod", "nad", "pro", "při", "přes", "před", "mezi", "pře",
  // krátké spojky
  "ani", "ale", "či",
];

// Seřadit delší napřed, ať „přes“ vyhraje nad „pře“ apod.
const GROUP = [...BINDERS].sort((a, b) => b.length - a.length).join("|");

// (začátek | mezera/závorka/uvozovka/pomlčka) + předložka + mezera(y)
const RE = new RegExp(`(^|[\\s(\\[„“"'‚‘/–—-])(${GROUP})[ \\t]+`, "gi");

/**
 * Vloží pevné mezery za krátké předložky/spojky. Bezpečné pro obyčejný text
 * i pro texty s rich-text značkami (**tučně**, [lg]…[/lg]) — mění jen mezery.
 */
export const fixWidows = (text: string): string => {
  if (!text) return text;
  let out = text;
  // Dvě iterace kvůli řetězcům dvou předložek za sebou („na do…“).
  for (let i = 0; i < 2; i++) {
    out = out.replace(RE, (_m, pre: string, w: string) => `${pre}${w}${NBSP}`);
  }
  return out;
};
