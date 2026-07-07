# Oprava rozostřeného hero obrázku na hlavní stránce

## Problém
Hero obrázek (`src/assets/hero-bg-clean.jpg`) má rozlišení pouze **1344×768 px**. Na monitorech širších než ~1344 px (uživatel má 2137 px) prohlížeč obrázek zvětšuje přes `object-cover` na celou šířku i výšku viewportu, což způsobuje:

- rozmazaný mech i beton pod brašnou,
- pocit, že „celá stránka je rozostřená", protože hero zabírá celou první obrazovku.

Není to problém CSS blur filtru — jde čistě o nedostatečné rozlišení zdrojového JPG.

## Řešení
Vygenerovat nový hero obrázek ve vyšším rozlišení (**1920×1080**, případně větší) se stejnou kompozicí:

- brašna Morseovape na betonovém podstavci,
- mech vpravo dole u podstavce,
- světle šedé pozadí (studio),
- žádný text (text je overlay v Reactu).

Nahradit stávající `src/assets/hero-bg-clean.jpg` novou verzí — cesta a název souboru zůstávají stejné, takže `HeroSection.tsx` neupravovat.

## Technické detaily
- Použít `imagegen--generate_image` (model `standard` kvůli detailům materiálu — mech, beton, textilie), rozměr 1920×1080, uložit na `src/assets/hero-bg-clean.jpg`.
- Ověřit rozměry přes `PIL` po vygenerování.
- Ověřit vizuálně přes Playwright screenshot v šířce 1920 px, že mech je ostrý a stránka se zobrazuje bez blur artefaktů.

## Co se **nemění**
- HeroSection.tsx, layout, typografie, tlačítko, pozice textu — všechno zůstává 1:1.
- Ostatní obrázky a stránky.
