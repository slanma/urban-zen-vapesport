
# Vylepšení admin rozhraní Vapesport

Rozsáhlejší úprava admin portálu rozdělená do logických fází. Každá fáze je samostatně testovatelná.

## Fáze 1 — Reálná data: objednávky

Vytvořit datový model objednávek v databázi a napojit ho na admin přehled.

- Nová tabulka `orders` (číslo objednávky, zákazník, e-mail, telefon, adresa, položky JSONB, mezisoučet, DPH, doprava, celkem, stav, typ B2C/B2B, created_at)
- Stavy: `nova`, `zpracovava_se`, `odeslano`, `dorucena`, `zrusena`
- RLS: admin čte/edituje vše; uživatel vidí jen vlastní podle e-mailu / user_id; veřejnost může vkládat (z checkoutu)
- GRANT pro `authenticated`, `service_role`, omezený `anon` INSERT
- Napojit checkout flow tak, aby ukládal do `orders` (zachovat stávající chování)
- Admin přehled + stránka „Objednávky" načítá živá data

## Fáze 2 — Plná CRUD správa produktů

Rozšířit stávající stránku `/admin/produkty` o:

- Inline editaci ceny, B2B ceny, stavu skladu a viditelnosti přímo v tabulce
- Tlačítka rychlých akcí: skrýt/zobrazit, vyprodáno/skladem
- Detail produktu (`/admin/produkty/:id`) — již existuje, doplnit chybějící pole
- Bulk akce: hromadné skrytí/označení vyprodáno (checkboxy v tabulce)

## Fáze 3 — Vyhledávání, filtry, stránkování

Sdílené komponenty pro tabulky:

- `DataTableToolbar` — search input + filtry stavů
- `DataTablePagination` — stránkování (10/25/50 na stránku)
- Aplikovat na: Objednávky, B2B partneři, Produkty
- Filtry stavů jako přepínací chips, sticky toolbar

## Fáze 4 — Vizuální polish + dark mode

- Nové KPI karty s mini-trendem (sparkline z `recharts`)
- Graf objednávek za posledních 14 dní
- Jemné mikroanimace (fade-in, hover lift)
- Přepínač světlý/tmavý režim v hlavičce adminu, persistován v `localStorage`
- Dark tokeny pro admin layout (nově `--admin-bg`, `--admin-surface`)
- Sticky horní lišta s breadcrumbs a user menu

## Fáze 5 — Notifikace adminovi (UI + e-mail)

- Realtime publikace pro `orders`, `b2b_profiles`, `withdrawal_requests`
- Hook `useAdminNotifications` — sleduje nové řádky, zvyšuje badge počty v sidebaru, zobrazuje toast
- Zvukový signál (volitelně utlumitelný)
- Centrum oznámení v hlavičce (rolovací seznam posledních 20)
- Edge funkce `notify-admin-event` — odešle e-mail na admin adresu (Lovable Emails)
- Triggery (DB) po INSERT do `orders` zavolají edge funkci přes `pg_net` nebo, jednodušeji, edge funkce je volána z klientského checkout flow / existujících míst, kde se data zakládají

## Technické poznámky

- Nové soubory: `src/pages/admin/AdminOrdersDetail.tsx`, `src/components/admin/DataTableToolbar.tsx`, `src/components/admin/DataTablePagination.tsx`, `src/components/admin/StatCard.tsx`, `src/components/admin/NotificationCenter.tsx`, `src/components/admin/ThemeToggle.tsx`, `src/hooks/useAdminNotifications.tsx`, `src/hooks/useAdminTheme.tsx`
- Upravené: `src/pages/admin/AdminLayout.tsx`, `AdminOverview.tsx`, `AdminOrders.tsx`, `AdminProductTable.tsx`, `src/index.css` (dark tokeny pro admin)
- Migrace: `orders` tabulka + RLS + GRANT + realtime publikace; realtime také pro `b2b_profiles` a `withdrawal_requests`
- Edge funkce: `notify-admin-event` (Lovable Emails — pokud není ještě nastavena infrastruktura, doplnit ji v rámci fáze 5)
- Existující stránka `AdminDashboard.tsx` (legacy mock) bude ponechána, ale postupně odpojena od navigace; primární je `AdminLayout` + dílčí stránky

## Otázka před implementací

Rozsah je velký (cca 10 nových souborů + migrace + edge funkce + e-mailová infrastruktura). Plně implementovat všech 5 fází najednou nebo začít fází 1+2+3 (data + CRUD + filtry) a notifikace/dark mode přidat samostatně ve druhé iteraci?
