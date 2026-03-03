import heroProduct from "@/assets/hero-product-v2.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start pt-32 md:pt-36 bg-gradient-to-b from-[hsl(0_0%_92%)] via-[hsl(0_0%_90%)] to-background overflow-hidden">
      <div className="container mx-auto px-4 text-center flex-1 flex flex-col items-center justify-center -mt-8">
        <h1 className="text-[clamp(2.8rem,8vw,8rem)] font-heading font-bold tracking-[-0.02em] text-foreground leading-[0.92] mb-6 animate-fade-in-up">
          KVALITA VRYTÁ DO KÓDU
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-body font-medium tracking-[0.25em] mb-10 animate-fade-in-up uppercase" style={{ animationDelay: "0.15s" }}>
          3 ROKY. 0 REKLAMACÍ.
        </p>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <a
            href="#kolekce"
            className="inline-block bg-primary text-primary-foreground font-body font-semibold text-sm tracking-[0.15em] uppercase px-10 py-4 rounded-lg hover:bg-moss-light transition-colors duration-200"
          >
            PROZKOUMAT KOLEKCI
          </a>
        </div>
      </div>

      {/* Product hero image – wider, overlapping bottom */}
      <div className="w-full max-w-4xl mx-auto px-4 -mb-4 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
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
