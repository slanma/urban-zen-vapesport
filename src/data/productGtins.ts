// GTIN (EAN-13) mapping pro MORSEO varianty.
// Obnoveno z GS1 exportu prefixu 859418251 (2026-07-22).
// Klíč: id produktu z feedProducts.ts -> slug barvy (dle available_colors) -> EAN-13.
// "blackout-g" = šedá / výchozí varianta (v GS1 registrována bez barevné přípony).
//
// POZNÁMKA k pokrytí:
//  - Plochý trojúhelník: 8/8 barev má GTIN.
//  - Střední trojúhelník / Elektro II: GS1 má i barvy, které se na webu neprodávají
//    (uloženy zde do zásoby — feed použije jen ty z available_colors).
//  - SMB: GTINy patří SMB XXL 8" (947383), ne 6,7" — XXL nahradil 6,7", stejné EANy. 8/8 barev.
//  - Transformer 5,5": GS1 má jen base + bílá; zbylých 6 webových barev GTIN NEMÁ.

export const productGtins: Record<string, Record<string, string>> = {
  // MORSEO Plochý trojúhelník 2-kapsý  (kód M311055)
  "vs-ramova-brasna-nepromokavy-zip-945203": {
    "blackout-g": "8594182511253",
    "coral-code": "8594182511260",
    "lazurite-blue": "8594182511277",
    "dandelite-yellow": "8594182511284",
    "lime-spark": "8594182511291",
    "flamingo-luxe": "8594182511307",
    "golden-wheat": "8594182511314",
    "arctic-white": "8594182511321",
  },
  // MORSEO Střední trojúhelník 2-kapsý  (kód M410102)
  "vs-ramova-brasna-stredni-se-2-zipy-a-sitkou-945204": {
    "blackout-g": "8594182511338",
    "coral-code": "8594182511345",
    "lazurite-blue": "8594182511352",
    "dandelite-yellow": "8594182511369",
    "lime-spark": "8594182511376",
    "flamingo-luxe": "8594182511383",
    "golden-wheat": "8594182511390",
    "arctic-white": "8594182511406",
  },
  // MORSEO SMB XXL 8"  (GTINy SMB nahrazeny za XXL — sdílejí EAN)
  "vs-smb-morseo-zlata-947383": {
    "blackout-g": "8594182511413",
    "coral-code": "8594182511420",
    "lazurite-blue": "8594182511437",
    "dandelite-yellow": "8594182511444",
    "lime-spark": "8594182511451",
    "flamingo-luxe": "8594182511468",
    "golden-wheat": "8594182511475",
    "arctic-white": "8594182511482",
  },
  // MORSEO Elektro II  (kód M410006)
  "vs-ramova-brasna-nepromokavy-zip-947097": {
    "blackout-g": "8594182511499",
    "coral-code": "8594182511505",
    "lazurite-blue": "8594182511512",
    "dandelite-yellow": "8594182511529",
    "lime-spark": "8594182511536",
    "flamingo-luxe": "8594182511543",
    "golden-wheat": "8594182511550",
    "arctic-white": "8594182511567",
  },
  // MORSEO Transformer 5,5"  (kód M411104)
  "vs-brasna-na-mobil-5-5-945205": {
    "blackout-g": "8594182511574",
    "arctic-white": "8594182511581",
  },
};

/** Vrátí EAN-13 pro daný produkt + barvu, nebo undefined když není. */
export function getGtin(productId: string, colorSlug: string): string | undefined {
  return productGtins[productId]?.[colorSlug];
}