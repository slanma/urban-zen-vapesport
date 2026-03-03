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

const FeaturesGrid = () => {
  return (
    <section id="kolekce" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center text-foreground mb-4">
          Technologie, které definují standard
        </h2>
        <p className="text-muted-foreground text-center text-lg mb-16 max-w-2xl mx-auto">
          Každý detail je navržen s precizností švýcarského hodinářství.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="group flex flex-col items-center text-center p-6 rounded-2xl bg-card hover:bg-secondary transition-colors duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-20 h-20 rounded-full overflow-hidden mb-5">
                <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-heading font-semibold text-base text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
