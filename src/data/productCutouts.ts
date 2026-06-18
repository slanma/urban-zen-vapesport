import vsBrasnaMalaNaRiditkaPe904688 from "@/assets/products/vs-brasna-mala-na-riditka-pe-904688.png";
import vsBrasnaNaMobil55945205 from "@/assets/products/vs-brasna-na-mobil-5-5-945205.png";
import vsBrasnaPodSedloZralokTwist904706 from "@/assets/products/vs-brasna-pod-sedlo-zralok-twist-904706.png";
import vsElektroIiVapesport904683 from "@/assets/products/vs-elektro-ii-vapesport-904683.png";
import vsKlickfix904710 from "@/assets/products/vs-klickfix-904710.png";
import vsLadySMobilem904681 from "@/assets/products/vs-lady-s-mobilem-904681.png";
import vsM2Podsedlo925467 from "@/assets/products/vs-m2-podsedlo-925467.png";
import vsMalyTrojuhlenik3Kapsy904673 from "@/assets/products/vs-maly-trojuhlenik-3kapsy-904673.png";
import vsMobil55Pe904696 from "@/assets/products/vs-mobil-5-5-pe-904696.png";
import vsNeoprenovyObal938229 from "@/assets/products/vs-neoprenovy-obal-938229.png";
import vsObalNaTlumic908656 from "@/assets/products/vs-obal-na-tlumic-908656.png";
import vsPlochyTrojuhelnik4KapsyVape904677 from "@/assets/products/vs-plochy-trojuhelnik-4kapsy-vape-904677.png";
import vsPodsedloMalaSpe904708 from "@/assets/products/vs-podsedlo-mala-spe-904708.png";
import vsRamovaBrasnaNepromokavyZip947097 from "@/assets/products/vs-ramova-brasna-nepromokavy-zip-947097.png";
import vsRamovaBrasnaStredniSe2ZipyASitkou945204 from "@/assets/products/vs-ramova-brasna-stredni-se-2-zipy-a-sitkou-945204.png";
import vsSmbMorseo945206 from "@/assets/products/vs-smb-morseo-945206.png";
import vsSmbMorseoZlata947383 from "@/assets/products/vs-smb-morseo-zlata-947383.png";
import vsSmbVapesport904678 from "@/assets/products/vs-smb-vapesport-904678.png";
import vsStreetBag922789 from "@/assets/products/vs-street-bag-922789.png";
import vsTablet78Pe904716 from "@/assets/products/vs-tablet-7-8-pe-904716.png";
import vsTrojuhelnikElektroI904682 from "@/assets/products/vs-trojuhelnik-elektro-i-904682.png";
import vsTrojuhelnikSw914131 from "@/assets/products/vs-trojuhelnik-sw-914131.png";
import vsUniMaxiTwist904687 from "@/assets/products/vs-uni-maxi-twist-904687.png";
import vsVrch3Brasny912317 from "@/assets/products/vs-vrch-3-brasny-912317.png";
import vsWasabiPodsedloVelka904700 from "@/assets/products/vs-wasabi-podsedlo-velka-904700.png";
import vsWaterproofBikeBagBila945208 from "@/assets/products/vs-waterproof-bike-bag-bila-945208.png";
import vsWaterproofSaddleBag945209 from "@/assets/products/vs-waterproof-saddle-bag-945209.png";

export const productCutouts: Record<string, string> = {
  "vs-brasna-mala-na-riditka-pe-904688": vsBrasnaMalaNaRiditkaPe904688,
  "vs-brasna-na-mobil-5-5-945205": vsBrasnaNaMobil55945205,
  "vs-brasna-pod-sedlo-zralok-twist-904706": vsBrasnaPodSedloZralokTwist904706,
  "vs-elektro-ii-vapesport-904683": vsElektroIiVapesport904683,
  "vs-klickfix-904710": vsKlickfix904710,
  "vs-lady-s-mobilem-904681": vsLadySMobilem904681,
  "vs-m2-podsedlo-925467": vsM2Podsedlo925467,
  "vs-maly-trojuhlenik-3kapsy-904673": vsMalyTrojuhlenik3Kapsy904673,
  "vs-mobil-5-5-pe-904696": vsMobil55Pe904696,
  "vs-neoprenovy-obal-938229": vsNeoprenovyObal938229,
  "vs-obal-na-tlumic-908656": vsObalNaTlumic908656,
  "vs-plochy-trojuhelnik-4kapsy-vape-904677": vsPlochyTrojuhelnik4KapsyVape904677,
  "vs-podsedlo-mala-spe-904708": vsPodsedloMalaSpe904708,
  "vs-ramova-brasna-nepromokavy-zip-947097": vsRamovaBrasnaNepromokavyZip947097,
  "vs-ramova-brasna-stredni-se-2-zipy-a-sitkou-945204": vsRamovaBrasnaStredniSe2ZipyASitkou945204,
  "vs-smb-morseo-945206": vsSmbMorseo945206,
  "vs-smb-morseo-zlata-947383": vsSmbMorseoZlata947383,
  "vs-smb-vapesport-904678": vsSmbVapesport904678,
  "vs-street-bag-922789": vsStreetBag922789,
  "vs-tablet-7-8-pe-904716": vsTablet78Pe904716,
  "vs-trojuhelnik-elektro-i-904682": vsTrojuhelnikElektroI904682,
  "vs-trojuhelnik-sw-914131": vsTrojuhelnikSw914131,
  "vs-uni-maxi-twist-904687": vsUniMaxiTwist904687,
  "vs-vrch-3-brasny-912317": vsVrch3Brasny912317,
  "vs-wasabi-podsedlo-velka-904700": vsWasabiPodsedloVelka904700,
  "vs-waterproof-bike-bag-bila-945208": vsWaterproofBikeBagBila945208,
  "vs-waterproof-saddle-bag-945209": vsWaterproofSaddleBag945209,
};

export const getProductCutout = (productId?: string, baseId?: string) => {
  if (productId && productCutouts[productId]) return productCutouts[productId];
  if (baseId && productCutouts[baseId]) return productCutouts[baseId];
  return undefined;
};
