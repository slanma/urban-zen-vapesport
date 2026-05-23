## Stav dnes

Eshop dnes částečně rozlišuje koncové zákazníky a B2B partnery:

- `useB2BPartner` vrací `isPartner=true` pouze pro přihlášené uživatele se schváleným `b2b_profile` (status `approved`).
- `PriceTag` automaticky zobrazí **VOC cenu** místo retailové, pokud je `isPartner` a produkt má `b2b_price`.
- VOC cena se propisuje na: `ProductDetail`, `Shop`, `Products` (katalog).
- Košík (`Cart`, `CartDrawer`, `useCart`) a checkout (`Checkout`) **B2B vůbec neřeší** — počítají retailovou cenu pro všechny, a objednávka neobsahuje fakturační údaje firmy (IČO/DIČ).

Ano, oddělení je možné a do velké míry už existuje. Plán níže ho dokončí tak, aby celá nákupní cesta (od ceny po fakturu) byla jednoznačně buď B2C, nebo B2B.

## Cíl

- Jeden eshop, dvě nákupní zkušenosti, automatické přepínání podle role:
  - **Host / přihlášený B2C** → retailové ceny vč. DPH, klasický checkout.
  - **Přihlášený schválený B2B partner** → VOC ceny bez DPH (s dopočtem DPH), B2B checkout s předvyplněnými firemními údaji a slevou.
- Nikdy nesmíchat ceny v jedné objednávce — košík se musí "zamknout" do režimu podle přihlášení.

## Co se změní (uživatelsky)

### 1. Vizuální signalizace režimu
- Globální badge v hlavičce vedle ikony uživatele:
  - B2C přihlášený → moss-green tečka (dnes).
  - **B2B partner → malý štítek "B2B / VOC"** moss green, vedle jména.
- Na ProductDetail, Shop, Products, Cart se nad obsah přidá decentní pruh: *"Vidíte velkoobchodní ceny pro partnera {firma}."*

### 2. Ceny v celém toku
- `PriceTag` už B2B přepíná. Doplníme stejnou logiku do:
  - `CartDrawer` (mini košík),
  - `Cart` (souhrn),
  - `Checkout` (souhrn + faktura),
  - `OrderSummaryTable`.
- `useCart` rozšířit o helper `getLinePrice(item, isPartner)` který vrátí buď `b2b_price` (bez DPH) nebo `price` (vč. DPH).
- Souhrny budou pro B2B zobrazovat **3 řádky**: mezisoučet bez DPH, DPH 21 %, celkem; pro B2C jen "celkem vč. DPH".

### 3. Zámek košíku do režimu
- Do `useCart` přidat `mode: "b2c" | "b2b"`, uložené v localStorage spolu s položkami.
- Při změně přihlášení (B2C → B2B nebo naopak) ukázat dialog: *"Změnou účtu se mění ceník. Vyprázdnit košík a pokračovat v B2B režimu?"* — bez smíchání cen.

### 4. B2B checkout
- Pokud `isPartner`, na `/checkout`:
  - Předvyplněné firma, IČO, DIČ, adresa z `b2b_profiles`.
  - Skrýt platební metody nevhodné pro B2B (např. dobírka — dle preference), nabídnout **fakturu se splatností 14 dní**.
  - Aplikovat `discount_percent` z `b2b_profiles` jako dodatečnou slevu (pokud existuje a `b2b_price` ji nezahrnuje — pro tuto fázi předpokládáme, že `b2b_price` je už finální VOC a `discount_percent` se použije pouze pokud `b2b_price` chybí).
  - Doklad označit "Faktura — daňový doklad" s IČO/DIČ; B2C dostává "Účtenku".

### 5. Ochrana proti zneužití
- VOC ceny se **nikdy nesmí dostat do DOM pro nepřihlášené** uživatele → kontrola na úrovni `PriceTag` (už ok) a stejný guard v souhrnných komponentách.
- RLS na `product_overrides` zůstává `SELECT true` (potřebujeme číst veřejné přepisy), ale `b2b_price` sám o sobě není citlivý — citlivá je až vazba na konkrétní objednávku.
- V edge funkci pro odeslání objednávky validovat ceny serverově proti rolím (zabrání podvržení ceny z klienta v budoucí fázi, kdy přidáme objednávky do DB).

## Technické detaily

**Soubory k úpravě**
- `src/hooks/useCart.tsx` — přidat `mode`, helper na cenu, dialog pro reset při změně role.
- `src/components/PriceTag.tsx` — drobné: prop pro variantu zobrazení v košíku (bez/s DPH řádek).
- `src/components/CartDrawer.tsx`, `src/pages/Cart.tsx`, `src/pages/Checkout.tsx`, `src/components/OrderSummaryTable.tsx` — integrace `isPartner` + nové cenové součty.
- `src/components/Navbar.tsx` — B2B štítek.
- Nový `src/components/B2BModeBanner.tsx` — globální pruh "Velkoobchodní režim".
- `src/lib/vat.ts` — pomocné funkce `netToGross`, `grossToNet`, `splitVat`.

**Žádné migrace** nejsou potřeba — `b2b_price`, `b2b_profiles.discount_percent`, `get_b2b_status` už existují.

## Mimo rozsah (návrh na později)

- Tabulkové objednávky v B2B (CSV import, hromadné množstevní slevy).
- B2B-only produkty (skryté pro B2C) — vyžadovalo by `b2b_only` flag v `product_overrides`.
- Ukládání objednávek do DB + admin přehled (dnes objednávky nikam neukládáme).