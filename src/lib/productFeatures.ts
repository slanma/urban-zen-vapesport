/**
 * Shared catalogue of product technologies used by the admin editor and the
 * shop. Each entry has a stable `label` (also used as the saved value), a
 * coin image (matching the homepage "Technologie" grid), a Lucide fallback
 * icon, and a `tooltip` shown in hover/popover.
 */
import {
  Hand, Lock, ShieldCheck, Smartphone, Wind, Percent, Pointer,
  Zap, Fingerprint, Wrench, Palette, type LucideIcon,
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

export interface ProductFeature {
  label: string;
  icon: LucideIcon;
  image: string;
  tooltip: string;
}

export const PRODUCT_FEATURES: ReadonlyArray<ProductFeature> = [
  { label: "GekkoGrip™", icon: Hand, image: gekkoGripIcon,
    tooltip: "Pevné uchycení, které hýčká lak." },
  { label: "AquaLock™", icon: Lock, image: armourShellIcon,
    tooltip: "Voděodolný zip." },
  { label: "HydroGuard™", icon: ShieldCheck, image: aquaBlockIcon,
    tooltip: "Prémiový materiál odolný vodě i špíně." },
  { label: "MaxiMobile™", icon: Smartphone, image: maxSpaceIcon,
    tooltip: "Pojme i modely Ultra/Max." },
  { label: "AeroFlow™", icon: Wind, image: aeroFlowIcon,
    tooltip: "Aerodynamický tvar, který nezpomaluje." },
  { label: "100%HydroGuard™", icon: Percent, image: pureGuardIcon,
    tooltip: "Absolutní ochrana s nulovou nasákovostí." },
  { label: "UltraTouch™", icon: Pointer, image: smartLinkIcon,
    tooltip: "Vysoce citlivá slída pro ovládání." },
  { label: "E-bikeReady™", icon: Zap, image: voltFitIcon,
    tooltip: "Navrženo pro elektrokola a gravel." },
  { label: "ID™", icon: Fingerprint, image: idLockIcon,
    tooltip: "Unikátní design s příběhem v logu." },
  { label: "Flexible Touch™", icon: Wrench, image: quickMountIcon,
    tooltip: "Možnost montáže na bolt on systém." },
  { label: "MorseoColors™", icon: Palette, image: chromaPickIcon,
    tooltip: "8 barev pro dokonalý match s elektrokolem/gravelem." },
];

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
