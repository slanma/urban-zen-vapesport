import heroFinal from "@/assets/hero-final.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start pt-24 bg-[hsl(0_0%_92%)] overflow-hidden">
      <div className="container mx-auto px-4 text-center flex flex-col items-center mt-16 md:mt-24">
        <h1 className="text-[clamp(2.2rem,7vw,7rem)] font-heading font-bold tracking-[-0.02em] text-[hsl(0_0%_15%)] leading-[0.9] mb-5 whitespace-nowrap">
          KVALITA VRYTÁ DO KÓDU
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-[hsl(0_0%_30%)] font-body font-medium tracking-[0.3em] mb-8 uppercase">
          3 ROKY. 0 REKLAMACÍ.
        </p>
        <a
          href="#kolekce"
          className="inline-block bg-[hsl(100_20%_38%)] text-primary-foreground font-body font-semibold text-[13px] tracking-[0.18em] uppercase px-9 py-3.5 rounded-md hover:bg-[hsl(100_20%_44%)] transition-colors duration-200"
        >
          PROZKOUMAT KOLEKCI
        </a>
      </div>

      {/* Product – seamlessly integrated into the background */}
      <div className="mt-auto w-full flex justify-center pt-8">
        <img
          src={heroFinal}
          alt="Morseovape brašna na betonovém podstavci s mechem"
          className="w-full max-w-[900px] h-auto object-contain"
          loading="eager"
        />
      </div>
    </section>
  );
};

export default HeroSection;
