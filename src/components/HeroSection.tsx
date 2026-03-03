import heroBg from "@/assets/hero-bg-clean.jpg";

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[hsl(0_0%_95%)]">
      {/* Full background image – product scene without text */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Morseovape brašna na betonovém podstavci s mechem"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
      </div>

      {/* Text overlay matching reference position */}
      <div className="relative z-10 flex flex-col items-center text-center pt-[14vh] md:pt-[13vh] px-4">
        <h1 className="text-[clamp(2rem,7.5vw,7.5rem)] font-heading font-extrabold tracking-[-0.01em] text-[hsl(0_0%_12%)] leading-[0.92] mb-4">
          KVALITA VRYTÁ DO KÓDU
        </h1>
        <p className="text-[clamp(0.75rem,1.4vw,1.1rem)] text-[hsl(0_0%_25%)] font-body font-medium tracking-[0.35em] mb-7 uppercase">
          3 ROKY. 0 REKLAMACÍ.
        </p>
        <a
          href="#kolekce"
          className="inline-block bg-[hsl(135_14%_33%)] text-[hsl(0_0%_100%)] font-body font-semibold text-[13px] tracking-[0.2em] uppercase px-10 py-4 rounded-lg hover:bg-[hsl(135_14%_40%)] transition-colors duration-200"
        >
          PROZKOUMAT KOLEKCI
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
