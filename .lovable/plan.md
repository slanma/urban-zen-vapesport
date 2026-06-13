
## Cíl

Přepsat stránku detailu produktu (`/produkt/:id`) do prestižní podoby B2C/B2B, přidat strukturovaná e-bike data (kompatibilita, motor, baterie), per-barvu sklad, automatické přihození prodloužených pásků do košíku a skrytý hluboký RAG/SEO blok. Adminu přidat formuláře, aby vše šlo plnit ručně.

---

## 1. Databáze (1 migrace na `product_overrides` + 1 row do `site_settings`)

Nová pole v `product_overrides` (vše nullable):

- `subtitle_override TEXT` — B2C "hook" věta pod název
- `ebike_integrated_battery BOOLEAN` — ANO/NE badge
- `ebike_full_suspension BOOLEAN` — ANO/NE badge
- `motor_type TEXT` — "Středový" / "Zadní" / "Bez motoru"
- `battery_location TEXT` — "Integrovaná" / "Na rámu" / "—"
- `dimensions_l_cm NUMERIC`, `dimensions_h_cm NUMERIC`, `dimensions_w_cm NUMERIC`
- `touch_film TEXT` — "Ano – TPU 0.3 mm" apod.
- `material TEXT` — "Cordura 1000D" apod.
- `low_step_compatible BOOLEAN`
- `manufacturer TEXT` (default "Vapesport Handmade CR")
- `problem_bullet TEXT`, `function_bullet TEXT`, `usage_bullet TEXT` — 3 strukturované bullety (Blok C)
- `color_stock JSONB` — `{ "neon-yellow": 0, "black": 5, ... }`; chybějící klíč = skladem
- `compatible_bikes TEXT[]` — značky/modely pro RAG (Haibike, Cube, Specialized Turbo Levo, …)
- `rag_content TEXT` — bohatý text pro AI/SEO skrytý blok (Blok E)
- `max_frame_circumference_cm NUMERIC` — per-produkt přebije globální default

`site_settings` (klíč/hodnota) nové řádky:
- `longer_straps_product_id` = ID produktu "Prodloužené suché zipy/pásky"
- `longer_straps_price_override` = `0` nebo prázdné (defaultní cena)
- `default_max_frame_circumference_cm` = `7.5`

GRANTy + RLS (admin update, public select) zachovány stejně jako stávající politiky.

## 2. Hook `useProductOverrides`

- Přidat nová pole do `ProductOverride` interface, `DEFAULT_OVERRIDE` a `PUBLIC_COLUMNS`.
- `applyProductOverride` rozšířit, aby kopírovalo nová pole na effective product.

## 3. Admin (`AdminProductEdit.tsx`)

Přidat nové sekce ve formuláři, vše ukládáno přes existující `upsert`:

- **Marketing**: subtitle, 3 bullety (Problém / Funkce / Použití) — každý jako textarea
- **E-bike kompatibilita**: 2× Switch (integrovaná baterie, full odpružení) + 2× Select (motor, baterie) + Switch low-step
- **Rozměry & materiál**: 3× číselný input (D×V×Š cm), input dotyková fólie, input materiál, input výrobce
- **Skladovost barev**: pro každou aktivní barvu (`activeColors`) input qty → uloží do `color_stock`
- **Max obvod rámu**: číselný input (override globálu)
- **Kompatibilní kola** (tag input — comma-separated)
- **RAG / Deep AI content**: velká textarea
- Nová podstránka v admin Settings (nebo do AdminOverview) pro `site_settings` klíče (longer straps product ID, default obvod, default cena pásků).

## 4. Detail produktu (`ProductDetail.tsx`) — kompletní přepis layoutu

Pořadí sekcí:

```
[Breadcrumb: Kategorie / E-bike označení]
[H1: Název (KÓD)]              ← jeden bold heading
[Subtitle — B2C hook]
[Galerie | Pravý sloupec:
   Cena (B2C s DPH dominantně + bez DPH šedě, nebo B2B obráceně)
   Meta line: Kód: … | Skladem: Ano
   Color cells (out-of-stock barvy = šedé, strike-through, disabled)
   E-bike badges (4 prominentní pilulky)
   Quantity selector [-] 1 [+]  +  Přidat do košíku
   Vol. input: Obvod rámové trubky (cm)
   Blok C: 3 bullety (🎯 / 🛠️ / 🚴)
   Akordeon (Specifikace, Klíčové vlastnosti)
]
[Blok D: technická tabulka — celá šířka]
[Existující description_html / tech_params_html]
[Blok E: RAG/SEO skrytý kontejner — `sr-only` + ARIA, ale crawlovatelný; obsahuje rag_content, kompatibilní kola, rozměry, klíčová slova]
[JSON-LD Product schema rozšířený o nová pole]
```

### Logika cen
- Pokud `useB2BPartner().isPartner` → dominantní cena = `b2b_price` bez DPH; sekundárně B2C s DPH.
- Jinak dominantně B2C s DPH; sekundárně bez DPH.

### Logika košíku — auto-injekce pásků
V `ProductDetail`:
- Načíst `site_settings.longer_straps_product_id` + `default_max_frame_circumference_cm`.
- Pole `frameCircumference` (number | "").
- Při kliknutí na "Přidat do košíku":
  1. `addItem(product.id, qty, selectedColor)`
  2. Pokud `frameCircumference > (override.max_frame_circumference_cm ?? default)`:
     - `addItem(longer_straps_product_id, 1, null)` s flagem `auto: true` (rozšířit `CartItem` o nepovinné `meta?: { autoFor?: string }` pro budoucí faktury).
     - Toast: "Přidáno: Prodloužené suché zipy (váš obvod přesahuje XX cm)."

### Color cells
- `color_stock[slug] === 0` → třída `opacity-40 line-through pointer-events-none`, `disabled`.

### E-bike badges
Komponenta `EbikeBadges` čte `override.ebike_integrated_battery` a `ebike_full_suspension`, renderuje 2 pilulky ANO/NE (zelená/červená sémantický token).

### Technická tabulka (Blok D)
Nová komponenta `TechSpecTable` — minimalistická 2-sloupcová tabulka tailwind, řádky jen pokud má override hodnotu.

### Blok E — RAG/SEO
```tsx
<section aria-label="Rozšířené technické informace" className="sr-only">
  <h2>Hluboké technické informace pro AI vyhledávání</h2>
  <p>{rag_content}</p>
  <ul>{compatible_bikes.map(...)}</ul>
  ...
</section>
```
`sr-only` = neviditelné uživateli, ale plně čitelné Googlebotem a RAG ingestorem.

## 5. Cart / typy

- `CartItem` rozšířit o `meta?: { autoFor?: string; auto?: boolean }`.
- `CartDrawer` & `Cart.tsx` u auto-položky zobrazí badge "Automaticky přidáno" a deaktivuje odstranění (nebo umožní odstranění s warning toastem).

## 6. SEO

- Rozšíření JSON-LD: `gtin`, `mpn` = SKU, `brand` = manufacturer, `additionalProperty` array s e-bike kompatibilitou.

---

## Technické poznámky

- Migrace 1× přidává sloupce do `product_overrides` a vkládá tři site_settings řádky.
- Žádné breaking změny — všechna pole nullable, fallback na existující chování.
- Nové komponenty: `TechSpecTable.tsx`, `EbikeBadges.tsx`, `ProblemSolutionBullets.tsx`, `QuantitySelector.tsx`, `ColorCells.tsx`, `LongerStrapsField.tsx` (každá < 100 řádků).
- `ProductDetail.tsx` se výrazně zkrátí složením z těchto komponent.
- TypeScript typy `Database` se přegenerují po migraci → potom upravit hook + admin + detail.

## Co po nasazení doplníte ručně

1. V administraci u každého produktu vyplnit nová pole (rozměry, motor, baterie, bullety, RAG text).
2. V site_settings nastavit ID produktu pro prodloužené pásky + výchozí obvod 7.5 cm.
3. Skladovost po barvách (color_stock) nastavit u variantních produktů.
