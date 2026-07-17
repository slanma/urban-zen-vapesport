// Počty kusů v kartonu (podklad pro velkoobchod).
// Párováno podle interního ID produktu. Používá se ve feedu i v B2B objednávce.
export const CARTON_PER_ID: Record<string, number> = {
  // MORSEO
  "vs-ramova-brasna-nepromokavy-zip-945203": 50,
  "vs-ramova-brasna-stredni-se-2-zipy-a-sitkou-945204": 25,
  "vs-brasna-na-mobil-5-5-945205": 50,
  "vs-smb-morseo-945206": 50,
  "vs-waterproof-bike-bag-bila-945208": 50,
  "vs-waterproof-saddle-bag-945209": 50,
  "vs-ramova-brasna-nepromokavy-zip-947097": 50,
  "vs-smb-morseo-zlata-947383": 50,
  "vs-ramova-brasna-nepromokavy-zip-bila-947404": 50,
  // Vapesport (žralok 310121, led žralok 410121, spe 410046, lady 410048)
  "vs-brasna-pod-sedlo-zralok-twist-904706": 50,
  "vs-podsedlo-twist-zralok-led-410121": 50,
  "vs-podsedlo-mala-spe-904708": 50,
  "vs-lady-s-mobilem-904681": 50,
};

/** Vrátí počet kusů v kartonu pro dané ID, nebo null když karton není nastaven. */
export const getCartonSize = (id: string): number | null => CARTON_PER_ID[id] ?? null;

/** Zda partner (dle názvu firmy) má povolené kartonové balení. */
export const partnerHasCartons = (_companyName?: string | null): boolean => true;
