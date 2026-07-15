import gekkoGripIcon from "@/assets/icon-gekkogrip.jpeg";
import smartLinkIcon from "@/assets/icon-smartlink.jpeg";
import armourShellIcon from "@/assets/icon-armourshell.jpeg";
import voltFitIcon from "@/assets/icon-voltfit.jpeg";
import maxSpaceIcon from "@/assets/icon-maxspace.jpeg";
import idLockIcon from "@/assets/icon-idlock.jpeg";
import quickMountIcon from "@/assets/icon-quickmount.jpeg";
import chromaPickIcon from "@/assets/icon-chromapick.jpeg";
import aquaBlockIcon from "@/assets/icon-aquablock.jpeg";
import aeroFlowIcon from "@/assets/icon-aeroflow.jpeg";
import pureGuardIcon from "@/assets/icon-pureguard.jpeg";

import vsLongStrapIcon from "@/assets/icon-vs-longstrap.png";
import vsQuickMountIcon from "@/assets/icon-vs-quickmount.png";
import vsActiveLedIcon from "@/assets/icon-vs-activeled.png";
import vsNightGlowIcon from "@/assets/icon-vs-nightglow.png";
import vsRainShieldIcon from "@/assets/icon-vs-rainshield.png";
import vsFlexVolumeIcon from "@/assets/icon-vs-flexvolume.png";
import vsBottleDockIcon from "@/assets/icon-vs-bottledock.png";
import vsQuickClipIcon from "@/assets/icon-vs-quickclip.jpg";

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { products, type Product } from "@/data/products";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { getPrimaryImage } from "@/lib/productImages";

const features = [
  {
    image: gekkoGripIcon,
    title: "GekkoGrip™",
    description: "Pevné uchycení, které hýčká lak.",
  },
  {
    image: armourShellIcon,
    title: "AquaLock™",
    description: "Voděodolný zip",
  },
  {
    image: aquaBlockIcon,
    title: "HydroGuard™",
    description: "Prémiová materiál odolný vodě i špíně.",
  },
  {
    image: maxSpaceIcon,
    title: "MaxiMobile™",
    description: "Pojme i modely Ultra/Max",
  },
  {
    image: aeroFlowIcon,
    title: "AeroFlow™",
    description: "Aerodynamický tvar, který nezpomaluje.",
  },
  {
    image: pureGuardIcon,
    title: "100%HydroGuard™",
    description: "Absolutní ochrana s nulovou nasákovostí.",
  },
  {
    image: smartLinkIcon,
    title: "UltraTouch™",
    description: "Vysoce citlivá slída pro ovládání.",
  },
  {
    image: voltFitIcon,
    title: "E-bikeReady™",
    description: "Navrženo pro elektrokola a gravel.",
  },
  {
    image: idLockIcon,
    title: "ID™",
    description: "Unikátní design s příběhem v logu.",
  },
  {
    image: quickMountIcon,
    title: "Flexible Touch™",
    description: "Možnost montáže na bolt on systém.",
  },
  {
    image: chromaPickIcon,
    title: "MorseoColors™",
    description: "8 barev pro dokonalý match s elektrokolem/gravelem.",
  },
];

const vapesportFeatures = [
  {
    image: vsLongStrapIcon,
    title: "LongStrap™",
    description: "Dlouhé pásky obepnou i široké rámy elektrokol.",
  },
  {
    image: vsQuickMountIcon,
    title: "QuickMount™",
    description: "Rychloupínací KLICKFIX adaptér v balení.",
  },
  {
    image: vsQuickClipIcon,
    title: "QuickClip™",
    description: "Rychloupínací T-klip — nacvaknutí jednou rukou.",
  },
  {
    image: vsActiveLedIcon,
    title: "ActiveLED™",
    description: "Integrované LED světlo pro bezpečnost.",
  },
  {
    image: vsNightGlowIcon,
    title: "NightGlow™",
    description: "Reflexní prvky pro viditelnost za tmy.",
  },
  {
    image: vsRainShieldIcon,
    title: "RainShield™",
    description: "Pláštěnka v balení — obsah zůstane suchý.",
  },
  {
    image: vsFlexVolumeIcon,
    title: "FlexVolume™",
    description: "Rozšiřitelný objem, když potřebuješ naložit víc.",
  },
  {
    image: vsBottleDockIcon,
    title: "BottleDock™",
    description: "Kapsa na láhev (bidon) po ruce.",
  },
];

const FeaturesGrid = () => {
  const { get } = useProductOverrides();
  return (
    <section id="kolekce" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center text-foreground mb-4">
          Technologie, které dělají rozdíl
        </h2>
        <p className="text-muted-foreground text-center text-lg mb-16 max-w-2xl mx-auto">
          Chytré detaily našich brašen prověřené v terénu.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              image={feature.image}
              description={feature.description}
              get={get}
            />
          ))}
        </div>

        <div className="mt-24 pt-16 border-t border-border">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-center text-foreground mb-4">
            Klasika VAPESPORT
          </h3>
          <p className="text-muted-foreground text-center text-lg mb-16 max-w-2xl mx-auto">
            Osvědčené vlastnosti prověřené v terénu.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {vapesportFeatures.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                image={feature.image}
                description={feature.description}
                get={get}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Klikací technologická karta. Po kliknutí se otevře bublina (popover)
 * se seznamem brašen, které danou technologii mají.
 */
const FeatureCard = ({
  title,
  image,
  description,
  get,
}: {
  title: string;
  image: string;
  description: string;
  get: ReturnType<typeof useProductOverrides>["get"];
}) => {
  const matched = useMemo(() => {
    const needle = title.trim().toLowerCase();
    return products
      .filter((p) => get(p.id).visible)
      .filter((p) => {
        const ov = get(p.id);
        const feats = ov.features_override ?? p.features ?? [];
        return feats.some((f) => f.trim().toLowerCase() === needle);
      })
      .filter(
        (p, i, arr) =>
          arr.findIndex((x) => (x.baseId ?? x.id) === (p.baseId ?? p.id)) === i,
      );
  }, [title, get]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group flex flex-col items-center text-center p-6 rounded-2xl bg-card hover:bg-secondary transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="w-20 h-20 rounded-full overflow-hidden mb-5">
            <img src={image} alt={title} className="w-full h-full object-cover" />
          </div>
          <h3 className="font-heading font-semibold text-base text-foreground mb-1">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
          <span className="mt-3 text-xs font-body font-semibold uppercase tracking-wide text-primary">
            {matched.length} brašen →
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-80 max-h-96 overflow-y-auto p-3 z-50">
        <p className="font-heading font-bold text-foreground mb-2">
          {title}{" "}
          <span className="text-muted-foreground font-body font-normal text-sm">
            ({matched.length})
          </span>
        </p>
        {matched.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Zatím žádné brašny s touto technologií.
          </p>
        ) : (
          <ul className="space-y-1">
            {matched.map((p: Product) => (
              <li key={p.id}>
                <Link
                  to={`/produkt/${p.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <img
                    src={getPrimaryImage(p, get(p.id))}
                    alt={p.name}
                    loading="lazy"
                    className="w-12 h-12 object-contain bg-white rounded shrink-0"
                  />
                  <span className="flex-1 text-sm font-body text-foreground leading-snug">
                    {p.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default FeaturesGrid;
