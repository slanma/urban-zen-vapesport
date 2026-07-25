// AUTO-GENEROVÁNO z tabulky „Typ kola" (dle Lucie). Zdroj mapování: vyplněný Excel.
// Úprava: klidně edituj labely/subtitle níže; mapování productBikeTypes měň dle potřeby.

export interface BikeType {
  id: string;
  label: string;
  image: string;      // cesta v /public
  subtitle: string;
}

export const BIKE_TYPES: BikeType[] = [
  { id: "gravel", label: "Gravel", image: "/images/kola/gravel.jpg", subtitle: "Brašny na dobrodružství po zpevněných i nezpevněných cestách." },
  { id: "celoodpruzene", label: "Odpružené elektrokolo", image: "/images/kola/celoodpruzene-ebike.jpg", subtitle: "Odolné brašny, které drží i v náročném terénu." },
  { id: "elektrokolo", label: "Elektrokolo", image: "/images/kola/elektrokolo.jpg", subtitle: "Prostor na nabíječku, nářadí i věci na každý den." },
  { id: "silnicka", label: "Silnička", image: "/images/kola/silnicka.jpg", subtitle: "Lehké a nenápadné brašny pro rychlou jízdu." },
  { id: "mestske", label: "Městské elektrokolo", image: "/images/kola/mestske-ebike.jpg", subtitle: "Praktické brašny pro dojíždění a město." },
  { id: "horske", label: "Horské kolo", image: "/images/kola/horske.jpg", subtitle: "Brašny, které vydrží terén, bláto i nárazy." },
  { id: "detske", label: "Dětské kolo", image: "/images/kola/detske.jpg", subtitle: "Malé brašny akorát pro dětská kola." },
];

/** productId (základní, feed) → seznam typů kol, pro které se brašna hodí. */
export const productBikeTypes: Record<string, string[]> = {
  "vs-ramova-brasna-nepromokavy-zip-947097": ["gravel","elektrokolo","horske"],
  "vs-ramova-brasna-nepromokavy-zip-945203": ["gravel","celoodpruzene","elektrokolo","horske","detske"],
  "vs-ramova-brasna-nepromokavy-zip-bila-947404": ["gravel","celoodpruzene","elektrokolo","horske","detske"],
  "vs-smb-morseo-945206": ["gravel","celoodpruzene","elektrokolo","silnicka","mestske","horske","detske"],
  "vs-smb-morseo-zlata-947383": ["gravel","celoodpruzene","elektrokolo","silnicka","mestske","horske","detske"],
  "vs-ramova-brasna-stredni-se-2-zipy-a-sitkou-945204": ["gravel","elektrokolo","horske"],
  "vs-brasna-na-mobil-5-5-945205": ["gravel","celoodpruzene","elektrokolo","silnicka","mestske","horske","detske"],
  "vs-waterproof-bike-bag-bila-945208": ["gravel","celoodpruzene","elektrokolo","silnicka","mestske","horske","detske"],
  "vs-waterproof-saddle-bag-945209": ["gravel","celoodpruzene","elektrokolo","silnicka","mestske","horske","detske"],
  "vs-brasna-mala-na-riditka-pe-904688": ["gravel","celoodpruzene","elektrokolo","mestske","horske"],
  "vs-brasna-na-miru-951815": ["gravel","celoodpruzene","elektrokolo","silnicka","mestske","horske","detske"],
  "vs-vapesport-904698": ["gravel","celoodpruzene","elektrokolo","mestske","horske"],
  "vs-vapesport-904699": ["gravel","celoodpruzene","elektrokolo","mestske","horske"],
  "vs-brasna-pod-sedlo-zralok-twist-904706": ["gravel","celoodpruzene","elektrokolo","silnicka","mestske","horske","detske"],
  "vs-cyklo-batoh-9l-904713": ["gravel","celoodpruzene","elektrokolo","silnicka","mestske","horske","detske"],
  "vs-klickfix-bottle-941236": ["gravel","celoodpruzene","elektrokolo","silnicka","mestske","horske","detske"],
  "vs-klickfix-904710": ["gravel","celoodpruzene","elektrokolo","silnicka","mestske","horske","detske"],
  "vs-lady-s-mobilem-904681": ["celoodpruzene","elektrokolo","mestske","horske","detske"],
  "vs-m2-podsedlo-925467": ["gravel","celoodpruzene","elektrokolo","silnicka","mestske","horske","detske"],
  "vs-maly-trojuhlenik-3kapsy-904673": ["gravel","elektrokolo","horske"],
  "vs-mobil-5-5-pe-904696": ["gravel","celoodpruzene","elektrokolo","silnicka","mestske","horske","detske"],
  "vs-neoprenova-sada-na-prevoz-elektrokola-943570": ["celoodpruzene","elektrokolo","mestske"],
  "vs-neoprenovy-obal-938229": ["celoodpruzene","elektrokolo","mestske"],
  "vs-obal-na-display-na-miru-210604": ["celoodpruzene","elektrokolo","mestske"],
  "vs-obal-na-prevoz-elektrokola-943567": ["celoodpruzene","elektrokolo","mestske"],
  "vs-obal-na-tlumic-908656": ["gravel","celoodpruzene","elektrokolo","silnicka"],
  "vs-plochy-trojuhelnik-4kapsy-vape-904677": ["gravel","celoodpruzene","elektrokolo","horske"],
  "vs-podsedlo-mala-spe-904708": ["gravel","celoodpruzene","elektrokolo","silnicka","mestske","horske","detske"],
  "vs-podsedlo-twist-zralok-led-410121": ["gravel","celoodpruzene","elektrokolo","silnicka","mestske","horske","detske"],
  "vs-smb-vapesport-904678": ["gravel","celoodpruzene","elektrokolo","silnicka","mestske","horske","detske"],
  "vs-street-bag-922789": ["elektrokolo","mestske"],
  "vs-tablet-7-8-pe-904716": ["gravel","celoodpruzene","elektrokolo","silnicka","mestske","horske","detske"],
  "vs-trojuhelnik-elektro-i-904682": ["elektrokolo"],
  "vs-trojuhelnik-sw-914131": ["gravel","celoodpruzene","elektrokolo","silnicka","horske","detske"],
  "vs-uni-maxi-twist-904687": ["gravel","celoodpruzene","elektrokolo","silnicka","mestske","horske","detske"],
  "vs-velky-trojuhelnik-3kapsy-410002": ["gravel","elektrokolo","horske"],
};

export const getBikeType = (id: string | null | undefined): BikeType | undefined =>
  BIKE_TYPES.find((b) => b.id === id);

/** Sedí daná brašna (dle základního productId) k danému typu kola? */
export const productMatchesBikeType = (productId: string, typeId: string): boolean =>
  (productBikeTypes[productId] ?? []).includes(typeId);
