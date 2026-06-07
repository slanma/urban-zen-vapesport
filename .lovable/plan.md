## Cíl
Na stránce `/obchod` přidat pod interaktivní hero kolo nový vizuální "Rozcestník" — 2×2 mřížku 4 prémiových karet kategorií brašen ve stylu "Urban Zen".

## Čeká se na podklady
Uživatel teprve připraví 4 fotografie brašen na betonové zdi (jednu pro každou kategorii). Implementace se spustí, jakmile budou obrázky nahrané do chatu.

## Plánovaná struktura 4 karet

1. **Brašny na řídítka & představec** — rychlý přístup, navigace, telefon. → filtr `?pillar=ridi`
2. **Brašny do rámu** — maximální prostor v těžišti, e-bike nabíječky. → `?pillar=ram`
3. **Brašny pod sedlo** — minimalistický prostor pro nejnutnější výbavu. → `?pillar=sedlo`
4. **Gravel & Bikepacking (Waterproof)** — 100% nepromokavá prémiová řada. → `?pillar=gravel`

(Mapování už existuje v `src/lib/productPillars.ts`, použijeme stejné klíče → konzistentní s `Products.tsx`.)

## Vizuální specifikace

- **Layout:** 2×2 grid, `gap-6`, max šířka stránky, hodně whitespace nad i pod sekcí.
- **Karta:** `aspect-[4/5]` na desktopu, `rounded-2xl`, plnoplošný background image, tmavý gradient overlay zdola (`from-black/70 to-transparent`).
- **Typografie:** název velký bold sans-serif (`font-heading text-2xl md:text-3xl`), krátký popisek tenký (`font-body text-sm opacity-80`), oboje vlevo dole, bílá.
- **Hover:** `group-hover:scale-105` na obrázku (transition 500ms), ztmavení overlay, odhalí se odkaz **„Zobrazit produkty →"** v Moss Green (`text-primary` = `hsl(135 14% 33%)`).
- **Sekce nadpis:** `eyebrow` "Kategorie" + H2 "Vyberte si podle stylu jízdy" + krátký lead.

## Technické detaily

**Nové soubory**
- `src/components/ShopPillarsGrid.tsx` — samostatná komponenta s 4 kartami, čte pole pillarů (`PILLARS` z `productPillars.ts`) + mapu pillar→imageUrl předanou v props.
- `src/assets/pillars/ridi.jpg`, `ram.jpg`, `sedlo.jpg`, `gravel.jpg` — 4 fotky od uživatele.

**Úpravy**
- `src/pages/Shop.tsx` — vložit `<ShopPillarsGrid />` mezi hero bike sekci a sekci s filtrovanými produkty (nebo úplně dolů pod "Další kategorie" — k potvrzení).
- Karty linkují na `/produkty?pillar={key}` (Products.tsx už `pillar` query param čte).

**Žádné změny dat ani backendu** — čistě prezentační vrstva.

## Otevřené otázky (vyřešíme s obrázky)

- Umístění: hned pod hero kolem, nebo až pod produktové listingy? Doporučuji **hned pod hero** — slouží jako sekundární „rozcestník", kdo si nechce klikat puntíky na kole.
- Mobil: 2×2 zachovat (`grid-cols-2`), nebo přepnout na 1 sloupec? Doporučuji **2 sloupce** i na mobilu pro kompaktnost, s menší typografií.
