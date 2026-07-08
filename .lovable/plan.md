## Cíl
Odstranit „věčné Načítám…" ve všech admin sekcích, kde se natahují data z backendu. Ke každému fetchi zajistit tři stavy: loading (spinner), prázdno (hláška), chyba (hláška + tlačítko „Zkusit znovu"). Loading vždy končí i při chybě.

## Změny (pouze frontend, žádné DB změny)

### 1. `src/pages/admin/AdminSettings.tsx` — sekce Bankovní účty
- Přidat `loadError` state.
- `load()` obalit `try/catch/finally`; `setLoading(false)` v `finally`.
- Render: `loading` → spinner „Načítám…", `loadError` → „Načtení se nepodařilo." + tlačítko „Zkusit znovu" (volá `load()`), prázdno → „Zatím žádné bankovní účty.", jinak seznam.
- Stejný pattern aplikovat i na načítání `site_settings` (GA4) — přidat error stav s retry.

### 2. `src/pages/admin/AdminPromoCodes.tsx`
- Přidat `loadError` state, `try/catch/finally` do `load()`.
- Render: loading / error+retry / „Zatím žádné slevové kódy." / tabulka.

### 3. `src/pages/admin/AdminB2B.tsx`
- Aktuálně chybí loading/error state úplně (fetch bez indikátoru).
- Přidat `loading` a `loadError` (samostatné pro obě záložky, nebo sdílené) a sjednotit načtení do jedné funkce s `try/catch/finally`.
- V každé záložce (Čekající, Schválení): spinner při loadingu, „Načtení se nepodařilo." + „Zkusit znovu" při chybě, stávající prázdné hlášky ponechat.

### 4. `src/pages/admin/AdminOrders.tsx`
- Přidat `loadError` state, `load()` do `try/catch/finally`.
- Render uvnitř tabulky: loading (stávající) / error + „Zkusit znovu" / prázdno (stávající) / tabulka.

## Mimo záběr
- Vzhled, barvy, fonty, layout beze změny — jen textové hlášky + tlačítko retry ve stávajícím stylu (`Button variant="outline" size="sm"`).
- Žádné změny DB, RLS ani API.
- Fetche mimo admin (obchod, B2B portál) se nemění.
