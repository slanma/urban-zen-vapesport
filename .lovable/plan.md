## Cíl
V B2B prostředí už nepoužívat napevno 30% slevu. Defaultní chování = obchodník vidí běžnou VOC (MOC) cenu. Sleva se aplikuje pouze pokud má v jeho profilu (`b2b_profiles.discount_percent`) hodnotu > 0 nastavenou administrátorem.

## Změny v `src/pages/B2BDashboard.tsx`

1. **Logika slevy**
   - `b2bDiscount` → nahradit konstantou `discountPercent = profile?.discount_percent ?? 0` a multiplikátorem `priceMultiplier = (100 - discountPercent) / 100`.
   - Když `discountPercent === 0`, použít `product.price` přímo (žádné násobení).
   - Odstranit fallback `"30 %"` v `discountLabel` a v payloadu pro checkout (pošle se `""` nebo se klíč vynechá, když není sleva).

2. **Zobrazení ceny v tabulce produktů** (řádky 437–441)
   - **Bez slevy** (default): jen jeden řádek – `{product.price} Kč` tučně jako hlavní B2B cena. Žádné „MOC", žádné přeškrtnutí, žádný label „Sleva".
   - **Se slevou** (`discountPercent > 0`):
     - Horní řádek: `MOC {product.price} Kč` – malé, přeškrtnuté, šedé.
     - Spodní řádek: `{b2bPrice} Kč` – tučné, v `text-primary`.
     - Pod tím malý label `Sleva {discountPercent} %`.

3. **Souhrn dole / celková cena**
   - `totalPrice` bude i nadále počítat s `priceMultiplier`, ale když je sleva 0, vyjde rovno MOC – beze změny chování.

## Změny v `src/pages/B2BCheckout.tsx`

4. **Věta nad košíkem** (řádek 257)
   - Pokud `payload.discountLabel` je prázdný / `"0 %"`, větu „Ceny jsou se slevou …" nezobrazovat – ukázat jen „Zkontrolujte zboží před pokračováním."
   - Když sleva existuje, zachovat původní text.

## Mimo rozsah
- Žádné DB změny (sloupec `discount_percent` v `b2b_profiles` už existuje a admin ho nastavuje).
- Žádné úpravy admin rozhraní.
- Žádné změny v `B2BWholesale.tsx` (sleva tam už byla odstraněna dřív).

## Technické detaily
- Soubory: `src/pages/B2BDashboard.tsx`, `src/pages/B2BCheckout.tsx`.
- Cena pro výpočet `b2bPrice` v jednom kroku: `Math.round(product.price * (100 - discountPercent) / 100)`.
- Pomocná proměnná `hasDiscount = discountPercent > 0` pro podmíněný JSX render.
