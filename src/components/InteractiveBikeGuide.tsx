import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, Minus } from "lucide-react";
import bikeImg from "@/assets/bike-ebike-hardtail.jpg";
import {
  HOTSPOT_LABELS,
  getProductsByHotspot,
  type Hotspot,
} from "@/data/productHotspots";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { applyProductOverride } from "@/lib/effectiveProduct";
import { getPrimaryImage } from "@/lib/productImages";
import { fmtCZK, grossFromNet } from "@/lib/vat";
import { getEffectiveUnitPricing } from "@/lib/pricing";
import { useB2BPartner } from "@/hooks/useB2BPartner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type BikeGuideMode = "b2c" | "b2b";

interface BikeDot {
  id: Hotspot;
  label: string;
  /** dot center in % of container */
  x: number;
  y: number;
  /** label pill anchor in % of container */
  labelX: number;
  labelY: number;
}

/** Positions calibrated for src/assets/bike-ebike-hardtail.jpg (1920×1088). */
const DOTS: BikeDot[] = [
  { id: "Handlebar",   label: "Řídítka",      x: 82, y: 21, labelX: 88, labelY: 21 },
  { id: "UnderSaddle", label: "Pod sedlo",    x: 38, y: 23, labelX: 46, labelY: 18 },
  { id: "TopTube",     label: "Horní trubka", x: 60, y: 34, labelX: 68, labelY: 33 },
  { id: "Frame",       label: "Rám",          x: 56, y: 58, labelX: 62, labelY: 66 },
  { id: "RearRack",    label: "Nosič",        x: 21, y: 34, labelX: 12, labelY: 30 },
];

interface Props {
  mode?: BikeGuideMode;
  /** Optional controlled active hotspot (for parent-driven filtering). */
  activeHotspot?: Hotspot;
  onActiveChange?: (h: Hotspot) => void;
  /** Called when user presses "Přidat do objednávky" in B2B popup. */
  onB2BAdd?: (productId: string, qty: number) => void;
  /** Hide the bottom pill filter row. */
  hideFilterBar?: boolean;
  /** Hide intro heading (for embedding). */
  compact?: boolean;
}

const InteractiveBikeGuide = ({
  mode = "b2c",
  activeHotspot,
  onActiveChange,
  onB2BAdd,
  hideFilterBar,
  compact,
}: Props) => {
  const [internalActive, setInternalActive] = useState<Hotspot | null>(null);
  const active = activeHotspot ?? internalActive;
  const setActive = (h: Hotspot) => {
    if (onActiveChange) onActiveChange(h);
    else setInternalActive((prev) => (prev === h ? null : h));
  };

  const { get } = useProductOverrides();
  const { isPartner, profile } = useB2BPartner();
  const [qtyByProduct, setQtyByProduct] = useState<Record<string, number>>({});

  const productsForActive = useMemo(
    () =>
      active
        ? getProductsByHotspot(active)
            .filter((p) => get(p.id).visible)
            .map((p) => applyProductOverride(p, get(p.id)))
            .filter((p, i, arr) => arr.findIndex((x) => (x.baseId ?? x.id) === (p.baseId ?? p.id)) === i)
            .slice(0, 6)
        : [],
    [active, get],
  );

  const activeDot = active ? DOTS.find((d) => d.id === active) ?? null : null;

  const setQty = (id: string, q: number) =>
    setQtyByProduct((p) => ({ ...p, [id]: Math.max(0, q | 0) }));

  return (
    <div className="w-full">
      {!compact && (
        <div className="text-center mb-6">
          <span className="text-xs font-body font-semibold tracking-[0.25em] uppercase text-muted-foreground">
            Interaktivní průvodce
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight mt-2 text-foreground">
            Kam ji umístíte?
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto mt-3 text-sm md:text-base leading-relaxed">
            Klikněte na konkrétní místo na kole a zobrazte brašny určené přesně pro danou pozici.
          </p>
        </div>
      )}

      {/* Stage */}
      <div
        className="relative w-full max-w-[1200px] mx-auto aspect-[16/9] bg-white rounded-2xl overflow-hidden border border-border select-none"
        role="group"
        aria-label="Interaktivní e-kolo s body pro brašny"
      >
        <img
          src={bikeImg}
          alt="Boční profil elektrokola s vyznačenými místy pro brašny"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          draggable={false}
        />

        {/* Connector line to label (SVG overlay) */}
        {activeDot && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line
              x1={activeDot.x}
              y1={activeDot.y}
              x2={activeDot.labelX}
              y2={activeDot.labelY}
              stroke="hsl(var(--primary))"
              strokeWidth={0.25}
              strokeDasharray="0.8 0.6"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}

        {/* Hotspots */}
        {DOTS.map((d) => {
          const isActive = active === d.id;
          return (
            <button
              key={d.id}
              type="button"
              aria-label={`${d.label}: zobrazit produkty`}
              aria-pressed={isActive}
              onClick={() => setActive(d.id)}
              onMouseEnter={() => setActive(d.id)}
              className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{ left: `${d.x}%`, top: `${d.y}%` }}
            >
              {!isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-primary/25 animate-ping"
                />
              )}
              <span
                aria-hidden="true"
                className={`absolute inset-1.5 rounded-full border-2 transition-colors ${
                  isActive
                    ? "border-primary bg-primary"
                    : "border-primary bg-background/90 group-hover:bg-primary/20"
                }`}
              />
              <span
                aria-hidden="true"
                className={`relative w-2 h-2 rounded-full transition-colors ${
                  isActive ? "bg-primary-foreground" : "bg-primary"
                }`}
              />
            </button>
          );
        })}

        {/* Labels */}
        {DOTS.map((d) => {
          const isActive = active === d.id;
          return (
            <span
              key={`lbl-${d.id}`}
              aria-hidden="true"
              className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] md:text-xs font-body font-semibold px-2.5 py-1 rounded-md shadow-sm pointer-events-none transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/95 text-foreground border border-border"
              }`}
              style={{ left: `${d.labelX}%`, top: `${d.labelY}%` }}
            >
              {d.label}
            </span>
          );
        })}

        {/* Product popup carousel */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-3 w-[95%] max-w-[880px] bg-background/95 backdrop-blur border border-border rounded-xl shadow-lg p-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
          role="region"
          aria-label={`Produkty pro pozici ${HOTSPOT_LABELS[active]}`}
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs font-body font-bold tracking-widest uppercase text-primary">
              {HOTSPOT_LABELS[active]} · {productsForActive.length}{" "}
              {productsForActive.length === 1 ? "produkt" : productsForActive.length < 5 ? "produkty" : "produktů"}
            </p>
            {mode === "b2c" && (
              <Link
                to="/obchod"
                className="text-[11px] font-body font-semibold text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                Celý katalog <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {productsForActive.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">
              Pro tuto pozici zatím nemáme produkt.
            </p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
              {productsForActive.map((p) => {
                const ov = get(p.id);
                const pricing = getEffectiveUnitPricing(
                  p,
                  ov,
                  mode === "b2b" && isPartner,
                  profile?.discount_percent ?? 0,
                );
                const netPrice = Math.round(pricing.unitNet);
                const grossPrice = Math.round(grossFromNet(netPrice));
                const stock = ov.stock_qty ?? 0;
                const qty = qtyByProduct[p.id] ?? 0;
                return (
                  <div
                    key={p.id}
                    className="snap-start shrink-0 w-[160px] bg-card border border-border rounded-lg overflow-hidden flex flex-col"
                  >
                    <Link to={`/produkt/${p.id}`} className="block bg-white aspect-square p-2">
                      <img
                        src={getPrimaryImage(p, ov)}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-contain"
                      />
                    </Link>
                    <div className="p-2 flex flex-col gap-1 flex-1">
                      <Link
                        to={`/produkt/${p.id}`}
                        className="text-[11px] font-heading font-bold text-foreground leading-tight line-clamp-2 hover:text-primary"
                      >
                        {p.name}
                      </Link>
                      {mode === "b2b" ? (
                        <>
                          <div className="text-[11px] font-mono">
                            <span className="font-bold">{fmtCZK(netPrice)}</span>
                            <span className="text-muted-foreground"> bez DPH</span>
                          </div>
                          <div className={`text-[10px] ${stock > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                            {stock > 0 ? `${stock} ks skladem` : "Na dotaz"}
                          </div>
                          <div className="mt-auto flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setQty(p.id, qty - 1)}
                              className="w-6 h-6 rounded border border-border hover:bg-muted flex items-center justify-center"
                              aria-label="Ubrat"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <Input
                              type="number"
                              min={0}
                              value={qty || ""}
                              onChange={(e) => setQty(p.id, parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="h-6 w-10 px-1 text-center text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => setQty(p.id, qty + 1)}
                              className="w-6 h-6 rounded border border-border hover:bg-muted flex items-center justify-center"
                              aria-label="Přidat"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <Button
                              size="sm"
                              className="ml-auto h-6 px-2 text-[10px]"
                              disabled={qty <= 0}
                              onClick={() => onB2BAdd?.(p.id, qty)}
                            >
                              Do obj.
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-[11px] font-mono font-bold">{fmtCZK(grossPrice)}</div>
                          <Link
                            to={`/produkt/${p.id}`}
                            className="mt-auto text-[11px] font-body font-semibold text-primary inline-flex items-center gap-1 hover:underline"
                          >
                            Detail <ArrowRight className="w-3 h-3" />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom pill filter bar */}
      {!hideFilterBar && (
        <div
          className="flex flex-wrap justify-center gap-2 mt-6"
          role="tablist"
          aria-label="Vyberte umístění brašny na kole"
        >
          {DOTS.map((d) => {
            const isActive = active === d.id;
            return (
              <button
                key={d.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(d.id)}
                className={`min-h-11 px-5 py-2 rounded-full text-sm font-body font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-foreground hover:bg-accent"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InteractiveBikeGuide;
