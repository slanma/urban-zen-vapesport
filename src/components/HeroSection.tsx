import heroProduct from "@/assets/hero-product.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 bg-gradient-to-b from-concrete-light to-background overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tight text-foreground leading-[0.95] animate-fade-in-up mb-6">
          KVALITA VRYTÁ
          <br />
          DO KÓDU
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-heading font-medium tracking-widest mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          3 ROKY NA TRHU. 0 REKLAMACÍ.
        </p>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <a
            href="#kolekce"
            className="inline-block bg-primary text-primary-foreground font-heading font-semibold text-sm tracking-widest uppercase px-10 py-4 rounded-lg hover:bg-moss-light transition-colors"
          >
            PROZKOUMAT KOLEKCI
          </a>
        </div>
      </div>

      <div className="mt-12 md:mt-16 w-full max-w-lg mx-auto animate-scale-in" style={{ animationDelay: "0.6s" }}>
        <img
          src={heroProduct}
          alt="Morseovape pouzdro na betonovém podstavci obklopené mechem"
          className="w-full h-auto object-contain"
          loading="eager"
        />
      </div>
    </section>
  );
};

export default HeroSection;
