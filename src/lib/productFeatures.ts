/**
 * Shared catalogue of product technologies used by the admin editor and the
 * shop. Each entry has a stable `label` (also used as the saved value), a
 * coin image (matching the homepage "Technologie" grid), a Lucide fallback
 * icon, and a `tooltip` shown in hover/popover.
 */
import {
  Hand, Lock, ShieldCheck, Smartphone, Wind, Percent, Pointer,
  Zap, Fingerprint, Wrench, Palette,
  Cable, Anchor, Paperclip, Lightbulb, Sparkles, Umbrella, Maximize2, GlassWater,
  type LucideIcon,
} from "lucide-react";

import gekkoGripIcon from "@/assets/icon-gekkogrip.jpeg";
import armourShellIcon from "@/assets/icon-armourshell.jpeg";
import aquaBlockIcon from "@/assets/icon-aquablock.jpeg";
import maxSpaceIcon from "@/assets/icon-maxspace.jpeg";
import aeroFlowIcon from "@/assets/icon-aeroflow.jpeg";
import pureGuardIcon from "@/assets/icon-pureguard.jpeg";
import smartLinkIcon from "@/assets/icon-smartlink.jpeg";
import voltFitIcon from "@/assets/icon-voltfit.jpeg";
import idLockIcon from "@/assets/icon-idlock.jpeg";
import quickMountIcon from "@/assets/icon-quickmount.jpeg";
import chromaPickIcon from "@/assets/icon-chromapick.jpeg";

import vsLongStrapIcon from "@/assets/icon-vs-longstrap.png";
import vsQuickMountIcon from "@/assets/icon-vs-quickmount.png";
import vsQuickClipIcon from "@/assets/icon-vs-quickclip.jpg";
import vsActiveLedIcon from "@/assets/icon-vs-activeled.png";
import vsNightGlowIcon from "@/assets/icon-vs-nightglow.png";
import vsRainShieldIcon from "@/assets/icon-vs-rainshield.png";
import vsFlexVolumeIcon from "@/assets/icon-vs-flexvolume.png";
import vsBottleDockIcon from "@/assets/icon-vs-bottledock.png";

export interface ProductFeature {
  label: string;
  icon: LucideIcon;
  image: string;
  tooltip: string;
  /** Do které řady technologie patří. MORSEO a klasika se v komunikaci nemíchají. */
  group: "morseo" | "klasika";
}

export const PRODUCT_FEATURES: ReadonlyArray<ProductFeature> = [
  { label: "GekkoGrip™", icon: Hand, image: gekkoGripIcon,
    tooltip: "Pevné uchycení, které hýčká lak.", group: "morseo" },
  { label: "AquaLock™", icon: Lock, image: armourShellIcon,
    tooltip: "Voděodolný zip.", group: "morseo" },
  { label: "HydroGuard™", icon: ShieldCheck, image: aquaBlockIcon,
    tooltip: "Prémiový materiál odolný vodě i špíně.", group: "morseo" },
  { label: "MaxiMobile™", icon: Smartphone, image: maxSpaceIcon,
    tooltip: "Pojme i modely Ultra/Max.", group: "morseo" },
  { label: "AeroFlow™", icon: Wind, image: aeroFlowIcon,
    tooltip: "Aerodynamický tvar, který nezpomaluje.", group: "morseo" },
  { label: "100%HydroGuard™", icon: Percent, image: pureGuardIcon,
    tooltip: "Absolutní ochrana s nulovou nasákavostí.", group: "morseo" },
  { label: "UltraTouch™", icon: Pointer, image: smartLinkIcon,
    tooltip: "Vysoce citlivá slída pro ovládání.", group: "morseo" },
  { label: "E-bikeReady™", icon: Zap, image: voltFitIcon,
    tooltip: "Navrženo pro elektrokola a gravel.", group: "morseo" },
  { label: "ID™", icon: Fingerprint, image: idLockIcon,
    tooltip: "Unikátní design s příběhem v logu.", group: "morseo" },
  { label: "Flexible Touch™", icon: Wrench, image: quickMountIcon,
    tooltip: "Možnost montáže na bolt on systém.", group: "morseo" },
  { label: "MorseoColors™", icon: Palette, image: chromaPickIcon,
    tooltip: "8 barev pro dokonalý match s elektrokolem/gravelem.", group: "morseo" },

  // ── VAPESPORT klasika ──────────────────────────────
  { label: "LongStrap™", icon: Cable, image: vsLongStrapIcon,
    tooltip: "Dlouhé pásky obepnou i široké rámy elektrokol.", group: "klasika" },
  { label: "QuickMount™", icon: Anchor, image: vsQuickMountIcon,
    tooltip: "Rychloupínací KLICKFIX adaptér v balení.", group: "klasika" },
  { label: "QuickClip™", icon: Paperclip, image: vsQuickClipIcon,
    tooltip: "Rychloupínací T-klip — nacvaknutí jednou rukou.", group: "klasika" },
  { label: "ActiveLED™", icon: Lightbulb, image: vsActiveLedIcon,
    tooltip: "Integrované LED světlo pro bezpečnost.", group: "klasika" },
  { label: "NightGlow™", icon: Sparkles, image: vsNightGlowIcon,
    tooltip: "Reflexní prvky pro viditelnost za tmy.", group: "klasika" },
  { label: "RainShield™", icon: Umbrella, image: vsRainShieldIcon,
    tooltip: "Pláštěnka v balení — obsah zůstane suchý.", group: "klasika" },
  { label: "FlexVolume™", icon: Maximize2, image: vsFlexVolumeIcon,
    tooltip: "Rozšiřitelný objem, když potřebuješ naložit víc.", group: "klasika" },
  { label: "BottleDock™", icon: GlassWater, image: vsBottleDockIcon,
    tooltip: "Kapsa na láhev (bidon) po ruce.", group: "klasika" },
];

/** Technologie prémiové řady MORSEO. */
export const MORSEO_FEATURES = PRODUCT_FEATURES.filter((f) => f.group === "morseo");

/** Osvědčené vlastnosti klasické řady VAPESPORT. */
export const KLASIKA_FEATURES = PRODUCT_FEATURES.filter((f) => f.group === "klasika");

const FEATURE_BY_LABEL = new Map(
  PRODUCT_FEATURES.map((f) => [f.label.toLowerCase(), f] as const),
);

/** Match a product's saved feature lines against the master palette. */
export const matchFeatureBadges = (features: ReadonlyArray<string>): ProductFeature[] =>
  features
    .map((line) => FEATURE_BY_LABEL.get(line.trim().toLowerCase()))
    .filter((f): f is ProductFeature => Boolean(f));

/** Check if a saved feature line corresponds to a known technology badge. */
export const isKnownFeature = (line: string): boolean =>
  FEATURE_BY_LABEL.has(line.trim().toLowerCase());
