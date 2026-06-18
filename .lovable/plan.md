Zjistil jsem, proč to působí jako „uložené, ale neviditelné“:

- U konkrétního produktu `vs-maly-trojuhlenik-3kapsy-904673` jsou technologie v databázi uložené správně.
- Barvy ale uložené nejsou: `colors_override` je u tohoto produktu stále `null`, proto se v obchodě nemají z čeho zobrazit.
- V B2C katalogu `/produkty` se aktuálně technologie ani barvy na kartách vůbec nevykreslují, i když v `/obchod` už část logiky je.
- V B2B velkoobchodu se barvy používají pro varianty, ale technologie se v řádku produktu nezobrazují.

Plán úprav:

1. Upravit administraci produktu tak, aby výběr technologií fungoval stejně jasně jako barvy:
   - aktivní chipy budou zřetelně zaškrtnuté,
   - hodnota se bude ukládat přes `features_override`,
   - po uložení zůstane výběr viditelný i po reloadu.

2. Zkontrolovat a zpřesnit ukládání barev:
   - barvy zůstanou ukládané do `colors_override`,
   - uložení přes hlavní tlačítko bude vždy posílat aktuálně vybrané barvy,
   - administrace bude lépe ukazovat, že neaktivní barva znamená „nezobrazuje se v obchodě“.

3. Doplnit zobrazení technologií a barev do B2C katalogu `/produkty`:
   - na produktových kartách se zobrazí stejné technologické ikonky jako v `/obchod`,
   - pod nimi se zobrazí barevné swatche, pokud jsou pro produkt uložené.

4. Doplnit zobrazení technologií do B2B velkoobchodu:
   - u názvu produktu v B2B matrixu se zobrazí ikonky uložených technologií,
   - v rozbaleném popisu se vypíšou klíčové vlastnosti z administrace.

5. Ověřit konkrétní produkt:
   - po uložení v administraci ověřit databázový záznam,
   - zkontrolovat detail produktu `/produkt/vs-maly-trojuhlenik-3kapsy-904673`,
   - zkontrolovat `/produkty`, `/obchod` a B2B velkoobchod, že berou stejné uložené hodnoty.