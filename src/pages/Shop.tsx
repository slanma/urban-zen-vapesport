import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ebikeSilhouette from "@/assets/ebike-silhouette.png";
import { products } from "@/data/products";

interface Hotspot {
  id: string;
  label: string;
  categoryName: string;
  ariaDescription: string;
  /** Position as % from top-left of the bike image */
  top: string;
  left: string;
  productIds: string[];
  linkTo: string;
}

const hotspots: Hotspot[] = [
  {
    id: "frame",
    label: "Do rámu",
    categoryName: "Rámové brašny",
    ariaDescription:
      "Zobrazit brašny umisťované do hlavního trojúhelníku rámu elektrokola",
    top: "40%",
    left: "40%",
    productIds: ["morseo-elektro-ii", "morseo-stredni-trojuhelnik"],
    linkTo: "/produkty",
  },
  {
    id: "saddle",
    label: "Pod sedlo",
    categoryName: "Podsedlové brašny",
    ariaDescription:
      "Zobrazit brašny uchycené pod sedlo a na sedlovku elektrokola",
    top: "22%",
    left: "31%",
    productIds: ["podsedlo-twist"],
    linkTo: "/produkty",
  },
  {
    id: "handlebars",
    label: "Na řídítka",
    categoryName: "Brašny na řídítka",
    ariaDescription:
      "Zobrazit brašny montované na řídítka elektrokola",
    top: "13%",
    left: "63%",
    productIds: ["brasna-mala-riditka"],
    linkTo: "/produkty",
  },
  {
    id: "toptube",
    label: "Na horní trubku",
    categoryName: "Brašny na horní trubku",
    ariaDescription:
      "Zobrazit brašny na mobil montované na horní trubku rámu",
    top: "24%",
    left: "48%",
    productIds: ["morseo-smb-xxl"],
    linkTo: "/produkty",
  },
  {
    id: "carrier",
    label: "Na nosič",
    categoryName: "Brašny na nosič",
    ariaDescription:
      "Zobrazit brašny a tašky určené na zadní nosič elektrokola",
    top: "22%",
    left: "24%",
    productIds: ["morseo-wdb"],
    linkTo: "/produkty",
  },
  {
    id: "battery",
    label: "Ochrana baterie",
    categoryName: "Ochrana a baterie",
    ariaDescription:
      "Zobrazit neoprenové obaly a ochranu baterie elektrokola",
    top: "50%",
    left: "47%",
    productIds: ["neopren-baterie"],
    linkTo: "/produkty",
  },
];

const Shop = () => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const getProduct = (id: string) => products.find((p) => p.id === id);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero heading */}
      <section className="pt-32 pb-8 px-6 lg:px-12 max-w-[1400px] mx-auto text-center">
        <span className="text-xs font-body font-semibold tracking-[0.25em] uppercase text-muted-foreground">
          Interaktivní průvodce
        </span>
        <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mt-3 text-foreground">
          Kam ji umístíte?
        </h1>
        <p className="font-body text-muted-foreground max-w-xl mx-auto mt-4 text-base leading-relaxed">
          Klikněte na konkrétní místo na kole a objevte brašny navržené přesně
          pro danou pozici.
        </p>
      </section>

      {/* Bike hotspot navigator */}
      <section
        className="px-6 lg:px-12 max-w-[1100px] mx-auto pb-24"
        aria-label="Interaktivní navigace brašen podle umístění na elektrokole"
      >
        <div className="relative w-full aspect-[16/9] mx-auto select-none">
          {/* Bike image */}
          <img
            src={ebikeSilhouette}
            alt="Boční profil moderního elektrokola s vyznačenými místy pro brašny"
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />

          {/* Hotspot dots */}
          {hotspots.map((hs) => {
            const isActive = activeHotspot === hs.id;
            const hsProducts = hs.productIds
              .map(getProduct)
              .filter(Boolean);

            return (
              <div
                key={hs.id}
                className="absolute"
                style={{ top: hs.top, left: hs.left }}
                onMouseEnter={() => setActiveHotspot(hs.id)}
                onMouseLeave={() => setActiveHotspot(null)}
                onFocus={() => setActiveHotspot(hs.id)}
                onBlur={() => setActiveHotspot(null)}
              >
                {/* Pulsing dot */}
                <button
                  aria-label={hs.ariaDescription}
                  className="relative w-7 h-7 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer group"
                >
                  {/* Outer pulse ring */}
                  <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-40" />
                  {/* Static ring */}
                  <span className="absolute inset-1 rounded-full border-2 border-primary bg-background/80" />
                  {/* Inner dot */}
                  <span className="relative w-2.5 h-2.5 rounded-full bg-primary" />
                </button>

                {/* Label underneath */}
                <span className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-body font-semibold text-foreground bg-background/90 px-2 py-0.5 rounded shadow-sm pointer-events-none">
                  {hs.label}
                </span>

                {/* Popover on hover */}
                {isActive && (
                  <div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 bg-card border border-border shadow-xl rounded-lg p-4 z-30 animate-scale-in"
                    role="tooltip"
                  >
                    <h3 className="font-heading text-sm font-bold text-foreground mb-3">
                      {hs.categoryName}
                    </h3>

                    {/* Product thumbnails */}
                    <div className="flex gap-3 mb-3">
                      {hsProducts.slice(0, 2).map((product) =>
                        product ? (
                          <div key={product.id} className="flex-1">
                            <div className="aspect-square bg-muted rounded-md overflow-hidden mb-1.5">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-[10px] font-body font-medium text-muted-foreground leading-tight truncate">
                              {product.name}
                            </p>
                          </div>
                        ) : null
                      )}
                    </div>

                    <Link
                      to={hs.linkTo}
                      className="text-xs font-body font-semibold text-primary hover:underline underline-offset-2"
                    >
                      Zobrazit nabídku →
                    </Link>

                    {/* Screen-reader only description */}
                    <span className="sr-only">{hs.ariaDescription}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Semantic structured data for AI crawlers */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Kategorie cyklistických brašen podle umístění na elektrokole",
              description:
                "Interaktivní průvodce brašnami – vyberte si podle umístění na kole: rám, sedlo, řídítka, horní trubka, nosič nebo baterie.",
              itemListElement: hotspots.map((hs, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: hs.categoryName,
                description: hs.ariaDescription,
              })),
            }),
          }}
        />
      </section>

      {/* Quick category cards below */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {hotspots.map((hs) => (
            <Link
              key={hs.id}
              to={hs.linkTo}
              className="group flex flex-col items-center gap-3 p-5 bg-card border border-border rounded-xl hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              aria-label={hs.ariaDescription}
            >
              <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="w-3 h-3 rounded-full bg-primary" />
              </span>
              <span className="font-heading text-sm font-bold text-foreground text-center leading-tight">
                {hs.label}
              </span>
              <span className="text-[11px] font-body text-muted-foreground text-center">
                {hs.categoryName}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Shop;
