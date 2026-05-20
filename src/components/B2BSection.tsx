import woodTexture from "@/assets/wood-texture.jpg";

const B2BSection = () => {
  return (
    <section
      id="onas"
      className="relative py-20 md:py-32 bg-cover bg-center"
      style={{ backgroundImage: `url(${woodTexture})` }}
    >
      <div className="absolute inset-0 bg-foreground/60" />
      <div className="relative container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary-foreground mb-6">
          Česká značka od roku 1994
        </h2>
        <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Více než 30 let zkušeností na trhu. Každý výrobek je navržen s důrazem
          na kvalitu, která přežije generace.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { value: "30+", label: "let na trhu" },
            { value: "0%", label: "reklamací" },
            { value: "100%", label: "česká značka" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-5xl md:text-6xl font-heading font-bold text-primary-foreground mb-2">
                {stat.value}
              </span>
              <span className="text-primary-foreground/70 text-sm uppercase tracking-widest font-heading">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default B2BSection;
