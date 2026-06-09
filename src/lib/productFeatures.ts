/**
 * Shared catalogue of product features used by the admin editor and the
 * shop. Each entry has a stable `label` (also the textarea line), a Lucide
 * icon name, and a `tooltip` shown on hover in the shop.
 */
import {
  Droplets, ShieldCheck, Sun, CloudRain, Hand, Link as LinkIcon,
  Zap, Footprints, Baby, Smartphone, Layers, Flag, HeartHandshake,
  Boxes, Bike, type LucideIcon,
} from "lucide-react";

export interface ProductFeature {
  label: string;
  icon: LucideIcon;
  tooltip: string;
}

export const PRODUCT_FEATURES: ReadonlyArray<ProductFeature> = [
  { label: "Voděodolný materiál", icon: Droplets,
    tooltip: "Vnější tkanina odpuzuje vodu — drobný déšť a stříkance brašnu nepromočí." },
  { label: "Vodě odolné zipy", icon: ShieldCheck,
    tooltip: "Zalité zipy chrání obsah brašny proti zatékání vody i v hustém dešti." },
  { label: "Reflexní prvky", icon: Sun,
    tooltip: "Reflexní detaily zvyšují viditelnost cyklisty za šera a v noci." },
  { label: "Pláštěnka v balení", icon: CloudRain,
    tooltip: "K brašně dostanete pláštěnku navíc pro plnou ochranu v silném dešti." },
  { label: "Suchý zip — uchycení", icon: Hand,
    tooltip: "Rychlé uchycení na rám pomocí silných suchých zipů — bez nářadí." },
  { label: "KLICKFIX adaptér", icon: LinkIcon,
    tooltip: "Univerzální KLICKFIX adaptér je součástí — brašnu jedním klikem sundáte." },
  { label: "Vhodné pro elektrokolo", icon: Zap,
    tooltip: "Tvar a uchycení padnou i na rámy elektrokol (HAIBIKE, LECTRON apod.)." },
  { label: "Vhodné pro koloběžku", icon: Footprints,
    tooltip: "Funguje i na rámech koloběžek pro dospělé." },
  { label: "Vhodné pro dětské kolo", icon: Baby,
    tooltip: "Menší rozměry pasují i na rámy dětských kol." },
  { label: "Dotyková fólie na mobil", icon: Smartphone,
    tooltip: "Průhledná fólie reaguje na dotyk — telefon ovládáte přes brašnu." },
  { label: "Materiál PE 600D", icon: Layers,
    tooltip: "Pevná tkanina PE 600D — odolná proti oděru a dlouhé životnosti." },
  { label: "Vyrobeno v ČR", icon: Flag,
    tooltip: "Šito v České republice, ne dovoz z Asie." },
  { label: "Ruční výroba", icon: HeartHandshake,
    tooltip: "Každý kus je sešitý ručně v naší dílně." },
  { label: "Vnitřní organizér", icon: Boxes,
    tooltip: "Vnitřní přihrádky a kapsy pro přehledné uspořádání drobností." },
  { label: "Nosič na zadní blatník", icon: Bike,
    tooltip: "Připravené pro montáž na zadní nosič / blatník kola." },
];

const FEATURE_BY_LABEL = new Map(
  PRODUCT_FEATURES.map((f) => [f.label.toLowerCase(), f] as const),
);

/** Match a product's free-text feature lines against the master palette. */
export const matchFeatureBadges = (features: ReadonlyArray<string>): ProductFeature[] =>
  features
    .map((line) => FEATURE_BY_LABEL.get(line.trim().toLowerCase()))
    .filter((f): f is ProductFeature => Boolean(f));
