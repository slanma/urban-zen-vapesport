/**
 * Shared catalogue of product technologies used by the admin editor and the
 * shop. Each entry has a stable `label` (also used as the saved value), a
 * Lucide icon name, and a `tooltip` shown on hover in the shop / B2B.
 */
import {
  Hand, Lock, ShieldCheck, Smartphone, Wind, Percent, Pointer,
  Zap, Fingerprint, Wrench, Palette, type LucideIcon,
} from "lucide-react";

export interface ProductFeature {
  label: string;
  icon: LucideIcon;
  tooltip: string;
}

export const PRODUCT_FEATURES: ReadonlyArray<ProductFeature> = [
  { label: "GekkoGrip™", icon: Hand,
    tooltip: "Pevné uchycení, které hýčká lak." },
  { label: "AquaLock™", icon: Lock,
    tooltip: "Voděodolný zip." },
  { label: "HydroGuard™", icon: ShieldCheck,
    tooltip: "Prémiový materiál odolný vodě i špíně." },
  { label: "MaxiMobile™", icon: Smartphone,
    tooltip: "Pojme i modely Ultra/Max." },
  { label: "AeroFlow™", icon: Wind,
    tooltip: "Aerodynamický tvar, který nezpomaluje." },
  { label: "100%HydroGuard™", icon: Percent,
    tooltip: "Absolutní ochrana s nulovou nasákovostí." },
  { label: "UltraTouch™", icon: Pointer,
    tooltip: "Vysoce citlivá slída pro ovládání." },
  { label: "E-bikeReady™", icon: Zap,
    tooltip: "Navrženo pro elektrokola a gravel." },
  { label: "ID™", icon: Fingerprint,
    tooltip: "Unikátní design s příběhem v logu." },
  { label: "Flexible Touch™", icon: Wrench,
    tooltip: "Možnost montáže na bolt on systém." },
  { label: "MorseoColors™", icon: Palette,
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
