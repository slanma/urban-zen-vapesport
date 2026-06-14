import { useEffect, useMemo, useRef, useState, KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Eye, ExternalLink, LogOut, Loader2, ShoppingCart, Send } from "lucide-react";
import bikeSilhouette from "@/assets/bike-lineart.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useB2BPartner } from "@/hooks/useB2BPartner";
import { useProductOverrides, type ProductOverride } from "@/hooks/useProductOverrides";
import { useCart } from "@/hooks/useCart";
import { products, type Product } from "@/data/products";
import { applyProductOverride } from "@/lib/effectiveProduct";
import { getEffectiveUnitPricing } from "@/lib/pricing";
import { fmtCZK, grossFromNet } from "@/lib/vat";
import { productHotspotEntries, type Hotspot } from "@/data/productHotspots";
import { supabase } from "@/integrations/supabase/client";

const HOTSPOT_POSITIONS: { id: Hotspot; label: string; x: number; y: number }[] = [
  { id: "Frame",        label: "Přední trojúhelník rámu", x: 54, y: 42 },
  { id: "UnderSaddle",  label: "Pod sedlo",               x: 41, y: 25 },
  { id: "Handlebar",    label: "Na řídítka",              x: 80, y: 22 },
  { id: "TopTube",      label: "Na horní rámovou trubku", x: 60, y: 28 },
];

interface BaseRow {
  baseId: string;
  base: Product;
  variants: Product[];
  override: ProductOverride;
}

const B2BWholesale = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isPartner, profile, loading: partnerLoading } = useB2BPartner();
  const { overrides, get, loading: overridesLoading } = useProductOverrides();
  const cart = useCart();

  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [hoverHotspot, setHoverHotspot] = useState<Hotspot | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showDescription, setShowDescription] = useState<Record<string, boolean>>({});
  /** key = baseId::color → qty */
  const [qtyState, setQtyState] = useState<Record<string, number>>({});
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (authLoading || partnerLoading) return;
    if (!user) navigate("/b2b-login");
  }, [user, authLoading, partnerLoading, navigate]);

  // Build base rows: collapse colored variants under their baseId, ignore single non-base products with no variants? we keep both.
  const baseRows: BaseRow[] = useMemo(() => {
    const map = new Map<string, BaseRow>();
    for (const p of products) {
      const key = p.baseId ?? p.id;
      if (!map.has(key)) {
        // Choose base (no color) or first
        const base = products.find((x) => (x.baseId ?? x.id) === key && !x.color) ?? p;
        map.set(key, { baseId: key, base, variants: [], override: get(base.id) });
      }
      map.get(key)!.variants.push(p);
    }
    return Array.from(map.values()).map((r) => ({
      ...r,
      override: get(r.base.id),
      base: applyProductOverride(r.base, get(r.base.id)),
    }));
  }, [overrides, get]);

  const hotspotIdsByHotspot: Record<Hotspot, Set<string>> = useMemo(() => {
    const m: Record<string, Set<string>> = {};
    for (const e of productHotspotEntries) {
      m[e.hotspot] = m[e.hotspot] ?? new Set<string>();
      m[e.hotspot].add(e.productId);
    }
    return m as Record<Hotspot, Set<string>>;
  }, []);

  const filteredRows = useMemo(() => {
    if (!activeHotspot) return baseRows;
    const ids = hotspotIdsByHotspot[activeHotspot] ?? new Set<string>();
    return baseRows.filter((r) => ids.has(r.baseId));
  }, [baseRows, activeHotspot, hotspotIdsByHotspot]);

  const getQty = (baseId: string, color: string) => qtyState[`${baseId}::${color}`] ?? 0;
  const setQty = (baseId: string, color: string, q: number) =>
    setQtyState((p) => ({ ...p, [`${baseId}::${color}`]: Math.max(0, q | 0) }));

  const modelTotalQty = (row: BaseRow) => {
    const colors = row.override.colors_override ?? row.base.available_colors ?? [];
    if (colors.length === 0) return getQty(row.baseId, "__single__");
    return colors.reduce((s, c) => s + getQty(row.baseId, c), 0);
  };

  const baseUnitNet = (row: BaseRow) => {
    const pricing = getEffectiveUnitPricing(row.base, row.override, isPartner, profile?.discount_percent ?? 0);
    return Math.round(pricing.unitNet);
  };
  /** ≥10 ks z jednoho modelu → automatická sleva 2 % */
  const VOLUME_THRESHOLD = 10;
  const VOLUME_DISCOUNT = 0.02;
  const qualifiesForVolume = (row: BaseRow) => modelTotalQty(row) >= VOLUME_THRESHOLD;
  const unitNet = (row: BaseRow) => {
    const base = baseUnitNet(row);
    return qualifiesForVolume(row) ? Math.round(base * (1 - VOLUME_DISCOUNT)) : base;
  };

  const modelTotalNet = (row: BaseRow) => unitNet(row) * modelTotalQty(row);
  const modelTotalGross = (row: BaseRow) => Math.round(grossFromNet(modelTotalNet(row)));

  const grandTotalNet = useMemo(
    () => baseRows.reduce((s, r) => s + modelTotalNet(r), 0),
    [baseRows, qtyState, isPartner, profile?.discount_percent],
  );
  const grandTotalGross = Math.round(grossFromNet(grandTotalNet));
  const grandTotalQty = useMemo(
    () => baseRows.reduce((s, r) => s + modelTotalQty(r), 0),
    [baseRows, qtyState],
  );

  const toggleExpand = (baseId: string) => setExpanded((p) => ({ ...p, [baseId]: !p[baseId] }));
  const collapse = (baseId: string) => setExpanded((p) => ({ ...p, [baseId]: false }));

  const stockFor = (row: BaseRow, color: string): number => {
    const cs = row.override.color_stock;
    if (cs && typeof cs === "object" && color in cs) return Number(cs[color]) || 0;
    return row.override.stock_qty ?? 0;
  };

  const handleHotspotClick = (h: Hotspot) => {
    setActiveHotspot((cur) => (cur === h ? null : h));
    // Scroll right panel top
    document.getElementById("b2b-matrix-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrollToRow = (baseId: string) => {
    const el = rowRefs.current[baseId];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    setExpanded((p) => ({ ...p, [baseId]: true }));
  };

  const sendToCart = () => {
    let added = 0;
    baseRows.forEach((row) => {
      const colors = row.override.colors_override ?? row.base.available_colors ?? [];
      const list = colors.length ? colors : ["__single__"];
      list.forEach((c) => {
        const q = getQty(row.baseId, c);
        if (q > 0) {
          cart.addItem(row.base.id, q, c === "__single__" ? null : c);
          added += q;
        }
      });
    });
    if (added > 0) {
      cart.openDrawer();
      setQtyState({});
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await signOut();
    navigate("/b2b-login");
  };

  if (authLoading || partnerLoading || overridesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isPartner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary p-8 text-center">
        <div>
          <h1 className="text-2xl font-heading font-bold mb-3">Tato sekce je jen pro schválené B2B partnery.</h1>
          <p className="text-muted-foreground mb-6">Vyčkejte prosím na schválení vaší registrace.</p>
          <Button onClick={handleLogout} variant="outline" className="gap-2"><LogOut className="w-4 h-4" />Odhlásit</Button>
        </div>
      </div>
    );
  }

  // Suggestions: pick up to 3 other base rows
  const suggestionsFor = (row: BaseRow) =>
    baseRows.filter((r) => r.baseId !== row.baseId).slice(0, 3);

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-heading text-xl font-bold tracking-tight">Vapesport <span className="text-primary text-sm">B2B Velkoobchod</span></Link>
            <Link to="/b2b-dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Rychlá objednávka</Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden md:inline">{profile?.company_name ?? user?.email}</span>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}><LogOut className="w-4 h-4" />Odhlásit</Button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6">
        {/* ── Left fixed cockpit ─────────────────────────── */}
        <aside className="lg:sticky lg:top-20 self-start h-fit">
          <div className="bg-background border border-border rounded-xl p-5">
            <h2 className="font-heading text-lg font-bold mb-1">Kam s ní?</h2>
            <p className="text-xs text-muted-foreground mb-4">Klikněte na bod a filtrujte matrix vpravo.</p>
            <div className="relative">
              <img src={bikeSilhouette} alt="Silueta e-kola" className="w-full h-auto opacity-80" />
              {HOTSPOT_POSITIONS.map((h) => {
                const isActive = activeHotspot === h.id;
                return (
                  <button
                    key={h.id}
                    onClick={() => handleHotspotClick(h.id)}
                    onMouseEnter={() => setHoverHotspot(h.id)}
                    onMouseLeave={() => setHoverHotspot(null)}
                    className={`absolute w-5 h-5 rounded-full border-2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                      isActive ? "bg-primary border-primary scale-150 shadow-lg" : "bg-primary/70 border-primary-foreground hover:scale-125 animate-pulse"
                    }`}
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                    aria-label={h.label}
                  />
                );
              })}
              {hoverHotspot && (() => {
                const h = HOTSPOT_POSITIONS.find((x) => x.id === hoverHotspot)!;
                const ids = hotspotIdsByHotspot[hoverHotspot] ?? new Set<string>();
                const thumbs = baseRows.filter((r) => ids.has(r.baseId)).slice(0, 4);
                return (
                  <div className="absolute z-20 bg-background border border-border rounded-lg p-2 shadow-lg" style={{ left: `${Math.min(h.x + 5, 60)}%`, top: `${h.y + 6}%` }}>
                    <p className="text-xs font-semibold mb-1">{h.label}</p>
                    <div className="flex gap-1">
                      {thumbs.map((t) => (
                        <img key={t.baseId} src={t.base.image} alt="" className="w-10 h-10 object-cover rounded" />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="mt-4 space-y-1">
              {HOTSPOT_POSITIONS.map((h) => (
                <button
                  key={h.id}
                  onClick={() => handleHotspotClick(h.id)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${activeHotspot === h.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  {h.label}
                </button>
              ))}
              {activeHotspot && (
                <button onClick={() => setActiveHotspot(null)} className="w-full text-xs text-muted-foreground underline mt-2">Zrušit filtr</button>
              )}
            </div>
          </div>
        </aside>

        {/* ── Right scrollable matrix ─────────────────────── */}
        <main>
          <div id="b2b-matrix-top" />
          <div className="bg-background border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-[60px_1fr_140px_90px_160px_50px] gap-3 px-4 py-3 bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <div>Foto</div>
              <div>Kód / Název</div>
              <div className="text-right">B2B / ks bez DPH</div>
              <div className="text-center">Množství</div>
              <div className="text-right">Konečná cena s DPH</div>
              <div />
            </div>
            <div className="divide-y divide-border">
              {filteredRows.map((row) => {
                const colors = row.override.colors_override ?? row.base.available_colors ?? [];
                const totalQty = modelTotalQty(row);
                const isOpen = !!expanded[row.baseId];
                const showDesc = !!showDescription[row.baseId];
                const unit = unitNet(row);
                const base = baseUnitNet(row);
                const code = row.override.sku_override ?? row.base.id;
                const detailHref = `/produkt/${row.base.id}`;
                const colorInputKeys = (colors.length ? colors : ["__single__"]);

                return (
                  <div key={row.baseId} ref={(el) => (rowRefs.current[row.baseId] = el)}>
                    {/* Parent row */}
                    <div className="grid grid-cols-[60px_1fr_120px_90px_140px_50px] gap-3 px-4 py-3 items-center hover:bg-muted/20">
                      <a href={detailHref} target="_blank" rel="noopener noreferrer" className="block">
                        <img src={row.base.image} alt={row.base.name} className="w-12 h-12 rounded object-cover shadow-sm" />
                      </a>
                      <div className="min-w-0">
                        <a href={detailHref} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                          {code} <ExternalLink className="w-3 h-3" />
                        </a>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm leading-tight">{row.base.name}</span>
                          <button
                            onClick={() => setShowDescription((p) => ({ ...p, [row.baseId]: !p[row.baseId] }))}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Eye className="w-3 h-3" />Popis
                          </button>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-bold">{fmtCZK(base)}</div>
                      </div>
                      <div className="text-center font-mono">{totalQty}</div>
                      <div className="text-right">
                        <div className="font-bold text-sm">{fmtCZK(modelTotalNet(row))}</div>
                        <div className="text-xs text-muted-foreground">{fmtCZK(modelTotalGross(row))} s DPH</div>
                      </div>
                      <button onClick={() => toggleExpand(row.baseId)} className="justify-self-end p-2 hover:bg-muted rounded" aria-label="Rozbalit varianty">
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Inline description card */}
                    {showDesc && (
                      <div className="px-4 pb-4 -mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm">
                          {row.override.subtitle_override && (
                            <p className="font-semibold text-foreground mb-2">{row.override.subtitle_override}</p>
                          )}
                          <p className="text-muted-foreground mb-3">{row.base.shortDescription}</p>
                          <ul className="space-y-1 text-foreground">
                            {row.override.problem_bullet && <li>• {row.override.problem_bullet}</li>}
                            {row.override.function_bullet && <li>• {row.override.function_bullet}</li>}
                            {row.override.usage_bullet && <li>• {row.override.usage_bullet}</li>}
                          </ul>
                          {(row.override.compatible_bikes?.length ?? 0) > 0 && (
                            <p className="mt-3 text-xs text-muted-foreground">
                              <strong>Kompatibilita e-bike:</strong> {row.override.compatible_bikes!.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Expanded variants */}
                    {isOpen && (
                      <div className="bg-muted/10 px-4 py-3 border-t border-border">
                        <div className="space-y-2">
                          {colorInputKeys.map((color, idx) => {
                            const qty = getQty(row.baseId, color);
                            const stock = stockFor(row, color);
                            const inputKey = `${row.baseId}::${color}`;
                            const isLast = idx === colorInputKeys.length - 1;
                            return (
                              <div key={color} className="grid grid-cols-[20px_1fr_140px_120px] gap-3 items-center">
                                <span className="w-4 h-4 rounded-full border border-border" style={{ background: colorHex(color) }} />
                                <span className="text-sm font-medium">{color === "__single__" ? "Jediná varianta" : color}</span>
                                <span className={`text-xs ${stock > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                                  {stock > 0 ? `🟢 ${stock} ks skladem` : "Na dotaz"}
                                </span>
                                <Input
                                  type="number"
                                  min={0}
                                  value={qty || ""}
                                  data-input-key={inputKey}
                                  onChange={(e) => setQty(row.baseId, color, parseInt(e.target.value) || 0)}
                                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      collapse(row.baseId);
                                    }
                                  }}
                                  placeholder="0"
                                  className="h-10 text-right"
                                />
                              </div>
                            );
                          })}
                        </div>

                        {/* Suggested */}
                        <div className="mt-4 pt-3 border-t border-border">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Doporučené do setu (Často kupováno společně):</p>
                          <div className="flex gap-2">
                            {suggestionsFor(row).map((s) => (
                              <button
                                key={s.baseId}
                                onClick={() => handleScrollToRow(s.baseId)}
                                className="flex items-center gap-2 px-2 py-1 bg-background border border-border rounded hover:border-primary transition-colors"
                                title={s.base.name}
                              >
                                <img src={s.base.image} alt="" className="w-8 h-8 object-cover rounded" />
                                <span className="text-xs max-w-[100px] truncate">{s.base.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredRows.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">Žádné produkty pro tento filtr.</div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Sticky summary */}
      <div className="sticky bottom-0 bg-foreground text-primary-foreground border-t border-border z-40">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-5 text-sm">
            <span className="flex items-center gap-2 font-semibold"><ShoppingCart className="w-5 h-5" />Celkem v draftu:</span>
            <span className="font-bold">{grandTotalQty} ks</span>
            <span className="font-bold">{fmtCZK(grandTotalNet)} bez DPH</span>
            <span className="opacity-75">({fmtCZK(grandTotalGross)} s DPH)</span>
          </div>
          <Button size="lg" className="h-12 px-8 gap-2" disabled={grandTotalQty === 0} onClick={sendToCart}>
            <Send className="w-4 h-4" />Přidat do košíku
          </Button>
        </div>
      </div>
    </div>
  );
};

// Loose color → CSS color map for the dot indicator.
const colorHex = (name: string): string => {
  const map: Record<string, string> = {
    "Černá": "#111111",
    "Bílá": "#f5f5f5",
    "Šedá": "#9ca3af",
    "Neon zelená": "#39ff14",
    "Neon žlutá": "#f7ff00",
    "Modrá": "#1d4ed8",
    "Růžová": "#ec4899",
    "Červená": "#dc2626",
    "Zlatá": "#d4af37",
    "Tyrkysová světlá": "#5eead4",
    "Tyrkysová tmavá": "#0d9488",
  };
  return map[name] ?? "#94a3b8";
};

export default B2BWholesale;
