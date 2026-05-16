import { useState } from "react";
import bikeSilhouette from "@/assets/bike-silhouette.png";
import heroProduct from "@/assets/hero-product.jpg";

interface MountPoint {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
}

const mountPoints: MountPoint[] = [
  { id: "frame", label: "Rám", description: "Ideální pro rychlý přístup během jízdy.", x: 49.2, y: 56.8 },
  { id: "handlebar", label: "Řídítka", description: "Kompaktní uchycení pro navigaci a nabíjení.", x: 45.4, y: 43.2 },
  { id: "saddle", label: "Sedlovka", description: "Diskrétní umístění pod sedlem.", x: 53.5, y: 43.4 },
  { id: "rack", label: "Nosič", description: "Maximální kapacita pro delší cesty.", x: 60.2, y: 50.5 },
];

const BikeConfigurator = () => {
  const [activePoint, setActivePoint] = useState<string | null>(null);
  const activeMount = mountPoints.find((p) => p.id === activePoint);

  return (
    <section id="obchod" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center text-foreground mb-4">
          KAM S NÍ?
        </h2>
        <p className="text-muted-foreground text-center text-lg mb-16 max-w-xl mx-auto">
          Klikněte na zelený bod a objevte možnosti uchycení.
        </p>

        <div className="relative max-w-3xl mx-auto">
          <img
            src={bikeSilhouette}
            alt="Silueta kola s body uchycení"
            className="w-full h-auto opacity-80"
          />

          {/* Mount points */}
          {mountPoints.map((point) => (
            <button
              key={point.id}
              onClick={() => setActivePoint(activePoint === point.id ? null : point.id)}
              className={`absolute w-5 h-5 rounded-full border-2 transition-all duration-300 cursor-pointer
                ${activePoint === point.id
                  ? "bg-primary border-primary scale-150 shadow-lg"
                  : "bg-primary/70 border-primary-foreground hover:scale-125 animate-pulse"
                }`}
              style={{ left: `${point.x}%`, top: `${point.y}%`, transform: "translate(-50%, -50%)" }}
              aria-label={`Uchycení: ${point.label}`}
            />
          ))}

          {/* Info tooltip */}
          {activeMount && (
            <div
              className="absolute bg-card border border-border rounded-xl p-5 shadow-xl max-w-xs animate-scale-in z-10"
              style={{
                left: `${Math.min(activeMount.x + 5, 65)}%`,
                top: `${activeMount.y + 8}%`,
              }}
            >
              <div className="flex items-start gap-4">
                <img
                  src={heroProduct}
                  alt="Morseovape pouzdro"
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div>
                  <h4 className="font-heading font-semibold text-foreground text-sm mb-1">
                    {activeMount.label}
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {activeMount.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BikeConfigurator;
