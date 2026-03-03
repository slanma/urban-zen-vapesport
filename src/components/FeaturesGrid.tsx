import { Shield, Grip, Droplets, Maximize, Wind, Recycle } from "lucide-react";

const features = [
  {
    icon: Grip,
    title: "GekkoGrip™",
    description: "Pevné uchycení, které hýčká lak.",
  },
  {
    icon: Shield,
    title: "ArmourShell™",
    description: "Tvrdá skořepina chrání obsah při nárazu.",
  },
  {
    icon: Droplets,
    title: "AquaBlock™",
    description: "Vodoodpudivý materiál pro každé počasí.",
  },
  {
    icon: Maximize,
    title: "FlexFit™",
    description: "Modulární vnitřní prostor. Vaše pravidla.",
  },
  {
    icon: Wind,
    title: "AeroFlow™",
    description: "Ventilační systém proti přehřívání.",
  },
  {
    icon: Recycle,
    title: "EcoWeave™",
    description: "Recyklované materiály. Nulová kompromisace.",
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="group flex flex-col items-center text-center p-8 rounded-2xl bg-card hover:bg-secondary transition-colors duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-muted-foreground group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
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
