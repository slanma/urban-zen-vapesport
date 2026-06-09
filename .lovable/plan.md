Problém je v tom, že aktuálně jste na trase `/admin-dashboard`, což je starší samostatná administrace. Její záložka „Produkty“ stále obsahuje pouze placeholder text „Správa produktů bude dostupná v další verzi.“ Skutečná produktová tabulka už existuje na nové trase `/admin/produkty` v komponentě `AdminProductTable`.

Plán opravy:

1. Upravit starou administraci `/admin-dashboard`
   - Změnit kliknutí na položku „Produkty“ tak, aby přesměrovalo na `/admin/produkty` místo přepnutí na interní placeholder view.
   - Tím se otevře existující plnohodnotná správa produktů s tabulkou, kategoriemi, cenami, viditelností a skladovostí.

2. Odstranit matoucí placeholder
   - Sekci `view === "products"` ve starém dashboardu buď odstranit, nebo nahradit bezpečným přesměrováním na `/admin/produkty`, aby se už nikdy nezobrazila hláška „dostupná v další verzi“.

3. Zachovat B2B administraci
   - Ostatní části `/admin-dashboard` nechám beze změny, zejména B2B partnery, registrace, slevové kódy a nastavení.

4. Ověření
   - Po úpravě zkontrolovat, že kliknutí na „Produkty“ z administrace vede na `/admin/produkty` a renderuje `AdminProductTable` místo prázdného placeholderu.