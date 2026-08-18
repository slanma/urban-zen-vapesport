import { useState, useMemo, useEffect } from "react";
import { getCartonSize, partnerHasCartons } from "@/data/cartons";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getProductById, products } from "@/data/products";
import { getVariantValues } from "@/lib/variantOptions";
import ImageZoom from "@/components/ImageZoom";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Minus, ShoppingCart, Send, LogOut, Loader2 } from "lucide-react";
import bikeImg from "@/assets/bike-ebike-hardtail.png";
import {
  HOTSPOT_LABELS,
  getProductsByHotspot,
  type Hotspot,
} from "@/data/productHotspots";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { useB2BPartner } from "@/hooks/useB2BPartner";
import { getEffectiveUnitPricing } from "@/lib/pricing";
import { fmtCZK, netFromGross, grossFromNet } from "@/lib/vat";
import { resolveColor } from "@/lib/colorPalette";
import { supabase } from "@/integrations/supabase/client";

/** Outdoor není pozice na kole — je to samostatná kategorie sortimentu. */
type HotspotFilter = Hotspot | "All" | "Outdoor";

interface BikeDot {
  id: Hotspot;
  label: string;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
}

const BIKE_DOTS: BikeDot[] = [
  { id: "Handlebar",    label: "Řídítka",       x: 65, y: 10, labelX: 79, labelY: 6 },
  { id: "TopTube",      label: "Horní trubka",  x: 59, y: 19, labelX: 52, labelY: 10 },
  { id: "UnderSaddle",  label: "Pod sedlo",     x: 32, y: 18, labelX: 22, labelY: 13 },
  { id: "RearRack",     label: "Nosič",         x: 18, y: 31, labelX: 13, labelY: 28 },
  { id: "Frame",        label: "Rám",           x: 43, y: 43, labelX: 41, labelY: 54 },
  { id: "BatteryCover", label: "Kryty baterie", x: 53, y: 47, labelX: 60, labelY: 55 },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const ACCESS_TIMEOUT_MS = 12000;

interface StoredB2BSession {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user?: { id: string; email?: string };
}

interface B2BProfileData {
  company_name: string;
  status: string;
}

interface CartItem {
  productId: string;
  qty: number;
  color?: string | null;
}

const skuMap: Record<string, string> = {
  "morseo-elektro-ii": "ME-EVO-001",
  "morseo-stredni-trojuhelnik": "ME-EVO-002",
  "morseo-smb-xxl": "ME-EVO-003",
  "morseo-wdb": "ME-EVO-004",
  "velky-trojuhelnik": "VL-LEG-001",
  "brasna-mala-riditka": "VL-LEG-002",
  "podsedlo-twist": "VL-LEG-003",
  "neopren-baterie": "VL-LEG-004",
};

const getAuthStorageKey = () => {
  const host = new URL(SUPABASE_URL).host;
  const projectRef = host.split(".")[0];
  return `sb-${projectRef}-auth-token`;
};

const getStoredSession = (): StoredB2BSession | null => {
  try {
    const raw = window.localStorage.getItem(getAuthStorageKey());
    if (!raw) return null;
    return JSON.parse(raw) as StoredB2BSession;
  } catch {
    return null;
  }
};

const clearStoredSession = () => window.localStorage.removeItem(getAuthStorageKey());

const fetchProfile = async (session: StoredB2BSession): Promise<B2BProfileData | null> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), ACCESS_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/b2b_profiles?select=company_name,status&user_id=eq.${session.user?.id}&limit=1`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${session.access_token}`,
          Accept: "application/json",
        },
        signal: controller.signal,
      }
    );

    if (!response.ok) throw new Error(`Ověření profilu selhalo (${response.status}).`);
    const rows = (await response.json()) as B2BProfileData[];
    return rows[0] ?? null;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Ověření B2B účtu trvá příliš dlouho. Zkuste stránku obnovit.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const B2BDashboard = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);

  // „Zopakovat poslední objednávku" – předvyplnění košíku z nástěnky
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("vapesport_b2b_prefill");
      if (raw) {
        const items = JSON.parse(raw) as CartItem[];
        if (Array.isArray(items) && items.length) {
          setCart(items.map((i) => ({ productId: i.productId, qty: i.qty, color: i.color ?? null })));
        }
        sessionStorage.removeItem("vapesport_b2b_prefill");
      }
    } catch {
      /* ignore */
    }
  }, []);
  const [profile, setProfile] = useState<B2BProfileData | null>(null);
  const [accountLabel, setAccountLabel] = useState("");
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [activeHotspot, setActiveHotspot] = useState<HotspotFilter>("All");

  const { get: getOverride } = useProductOverrides();
  const { profile: b2bProfile } = useB2BPartner();
  const discount = b2bProfile?.discount_percent ?? 0;

  /**
   * VOC unit price (net) for a product respecting admin overrides and the
   * partner's individually approved discount. No discount applied unless the
   * admin explicitly set `discount_percent` on the b2b_profile.
   */
  const getUnitNet = (productId: string): number => {
    const product = getProductById(productId);
    if (!product) return 0;
    const pricing = getEffectiveUnitPricing(product, getOverride(productId), true, discount);
    return pricing.unitNet;
  };

  const outdoorProductsList = useMemo(
    () => products.filter((p) => p.category === "outdoor"),
    [],
  );

  const visibleProducts = useMemo(() => {
    const base =
      activeHotspot === "All"
        ? products
        : activeHotspot === "Outdoor"
          ? outdoorProductsList
          : (() => {
              const ids = new Set(getProductsByHotspot(activeHotspot).map((p) => p.id));
              return products.filter((p) => ids.has(p.id));
            })();
    // MORSEO kolekci nabízíme vždy jako první (kde pro danou pozici existuje).
    // Řazení je stabilní, takže pořadí uvnitř skupin zůstává zachované.
    return [...base].sort((a, b) => {
      const am = a.category === "morseo-evo" ? 0 : 1;
      const bm = b.category === "morseo-evo" ? 0 : 1;
      return am - bm;
    });
  }, [activeHotspot, outdoorProductsList]);

  useEffect(() => {
    const checkAccess = async () => {
      const session = getStoredSession();
      if (!session?.access_token || !session.user?.id) {
        clearStoredSession();
        navigate("/b2b-login", { replace: true });
        return;
      }

      try {
        const profileData = await fetchProfile(session);
        if (profileData?.status !== "approved") {
          clearStoredSession();
          navigate("/b2b-login", { replace: true });
          return;
        }

        setProfile(profileData);
        setAccountLabel(profileData.company_name || session.user.email || "B2B účet");
      } catch (error) {
        console.error("[B2BDashboard] access check failed:", error);
        setAccessError(error instanceof Error ? error.message : "B2B účet se nepodařilo ověřit.");
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [navigate]);

  const sameItem = (c: CartItem, id: string, color: string | null) =>
    c.productId === id && (c.color ?? null) === (color ?? null);

  const getQty = (id: string, color: string | null = null) =>
    cart.find((c) => sameItem(c, id, color))?.qty ?? 0;

  const setQty = (id: string, qty: number, color: string | null = null) => {
    if (qty < 0) return;
    setCart((prev) => {
      const exists = prev.find((c) => sameItem(c, id, color));
      if (!exists && qty > 0) return [...prev, { productId: id, qty, color: color ?? null }];
      if (qty === 0) return prev.filter((c) => !sameItem(c, id, color));
      return prev.map((c) => (sameItem(c, id, color) ? { ...c, qty } : c));
    });
  };

  const addToCart = (id: string) => setQty(id, getQty(id) || 1);

  const cartonEnabled = partnerHasCartons(profile?.company_name);
  const totalItems = useMemo(() => cart.reduce((sum, c) => sum + c.qty, 0), [cart]);
  const totalPrice = useMemo(
    () => cart.reduce((sum, c) => sum + getUnitNet(c.productId) * c.qty, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cart, discount, getOverride]
  );

  const [submitting, setSubmitting] = useState(false);

  const handleLogout = async () => {
    clearStoredSession();
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    navigate("/b2b-login", { replace: true });
  };

  const handleSubmitOrder = () => {
    const session = getStoredSession();
    if (!session?.access_token || !session.user?.id) {
      toast.error("Pro pokračování se přihlaste znovu.");
      navigate("/b2b-login", { replace: true });
      return;
    }
    if (cart.length === 0) return;

    const items = cart.map((c) => {
      const product = getProductById(c.productId);
      const unitPrice = getUnitNet(c.productId); // NET (VOC bez DPH)
      const colorLabel = c.color ? resolveColor(c.color).label : null;
      return {
        productId: c.productId,
        sku: skuMap[c.productId] || c.productId,
        name: colorLabel ? `${product?.name ?? c.productId} – ${colorLabel}` : (product?.name ?? c.productId),
        color: c.color ?? null,
        qty: c.qty,
        unitPrice,
      };
    });

    const payload = {
      items,
      discountLabel: "",
      accountLabel,
      email: session.user.email ?? "",
      companyName: profile?.company_name ?? null,
      userId: session.user.id,
      accessToken: session.access_token,
    };

    try {
      sessionStorage.setItem("vapesport_b2b_checkout", JSON.stringify(payload));
      navigate("/b2b-pokladna");
    } catch (error) {
      console.error("[B2BDashboard] redirect to checkout failed:", error);
      toast.error("Nepodařilo se otevřít košík. Zkuste to prosím znovu.");
    }
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (accessError) {
    return (
      <main className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <section className="w-full max-w-md bg-background border border-border rounded-lg p-8 text-center space-y-5">
          <h1 className="text-2xl font-heading font-bold text-foreground">B2B účet nelze ověřit</h1>
          <p className="text-destructive text-base font-medium">{accessError}</p>
          <Button onClick={() => window.location.reload()} className="w-full h-12 font-bold">
            Zkusit znovu
          </Button>
          <Button variant="outline" onClick={handleLogout} className="w-full h-12 font-bold">
            Zpět na přihlášení
          </Button>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <nav className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-4 md:px-8" aria-label="B2B navigace">
          <a href="/" className="font-heading text-xl font-bold text-foreground tracking-tight">
            Vapesport <span className="text-primary font-medium text-sm ml-1">B2B</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/b2b-nastenka" className="text-sm text-muted-foreground hover:text-primary hover:underline hidden sm:inline">
              Nástěnka
            </a>
            <a href="/b2b-velkoobchod" className="text-sm text-muted-foreground hover:text-primary hover:underline hidden sm:inline">
              Podrobná matice →
            </a>
            <span className="text-base text-muted-foreground hidden sm:inline">
              {accountLabel}
            </span>
            <Button variant="outline" size="sm" className="gap-2 text-base h-10 px-4" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Odhlásit
            </Button>
          </div>
        </nav>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        <section aria-labelledby="b2b-order-heading">
          <header className="mb-8">
            <h1 id="b2b-order-heading" className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
              Rychlá B2B objednávka
            </h1>
            <p className="text-lg text-muted-foreground">
              Vyberte produkty a zadejte množství.&nbsp;
            </p>
          </header>

          {/* Interactive e-bike filter */}
          <section
            aria-label="Filtrace produktů podle umístění na elektrokole"
            className="mb-8 bg-background border border-border rounded-lg p-4 md:p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_280px] gap-6 items-center">
              <div
                className="relative inline-block w-full max-w-[640px] mx-auto select-none"
                role="group"
                aria-label="Body na elektrokole představující umístění brašen"
              >
                <img
                  src={bikeImg}
                  alt="Boční profil elektrokola s vyznačenými místy pro brašny"
                  className="w-full h-auto block object-contain pointer-events-none"
                  draggable={false}
                />

                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  {BIKE_DOTS.map((d) => (
                    <line
                      key={d.id}
                      x1={d.x}
                      y1={d.y}
                      x2={d.labelX}
                      y2={d.labelY}
                      stroke="hsl(var(--primary))"
                      strokeWidth={0.2}
                      strokeDasharray="0.8 0.6"
                      vectorEffect="non-scaling-stroke"
                      opacity={activeHotspot === d.id ? 0.9 : 0.45}
                    />
                  ))}
                </svg>

                {BIKE_DOTS.map((d) => {
                  const isActive = activeHotspot === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      aria-label={`Zobrazit brašny: ${d.label}`}
                      aria-pressed={isActive}
                      onClick={() => setActiveHotspot(isActive ? "All" : d.id)}
                      className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer group rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      style={{ left: `${d.x}%`, top: `${d.y}%` }}
                    >
                      {!isActive && (
                        <span aria-hidden="true" className="absolute inset-2 rounded-full border-2 border-primary animate-ping opacity-40" />
                      )}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-2.5 rounded-full border-2 transition-colors ${
                          isActive ? "border-primary bg-primary" : "border-primary bg-background/80 group-hover:bg-primary/20"
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

                {BIKE_DOTS.map((d) => {
                  const isLabelActive = activeHotspot === d.id;
                  return (
                    <button
                      key={`lbl-${d.id}`}
                      type="button"
                      aria-label={`${d.label}: zobrazit brašny`}
                      aria-pressed={isLabelActive}
                      onClick={() => setActiveHotspot(isLabelActive ? "All" : d.id)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] font-body font-semibold px-2.5 py-1 rounded-md shadow-sm cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isLabelActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-background/90 text-foreground border border-border hover:bg-primary/15"
                      }`}
                      style={{ left: `${d.labelX}%`, top: `${d.labelY}%` }}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Kategorie podle umístění
                </p>
                <div className="flex flex-wrap gap-2" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeHotspot === "All"}
                    onClick={() => setActiveHotspot("All")}
                    className={`min-h-10 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      activeHotspot === "All"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-secondary text-foreground hover:bg-accent"
                    }`}
                  >
                    Vše ({products.length})
                  </button>
                  {BIKE_DOTS.map((d) => {
                    const count = getProductsByHotspot(d.id).length;
                    const isActive = activeHotspot === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveHotspot(isActive ? "All" : d.id)}
                        className={`min-h-10 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-secondary text-foreground hover:bg-accent"
                        }`}
                      >
                        {HOTSPOT_LABELS[d.id]} ({count})
                      </button>
                    );
                  })}
                  {outdoorProductsList.length > 0 && (() => {
                    const isActive = activeHotspot === "Outdoor";
                    return (
                      <button
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveHotspot(isActive ? "All" : "Outdoor")}
                        className={`min-h-10 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-secondary text-foreground hover:bg-accent"
                        }`}
                      >
                        Outdoor — návleky ({outdoorProductsList.length})
                      </button>
                    );
                  })()}
                  {(() => {
                    const count = getProductsByHotspot("None").length;
                    if (count === 0) return null;
                    const isActive = activeHotspot === "None";
                    return (
                      <button
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveHotspot(isActive ? "All" : "None")}
                        className={`min-h-10 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-secondary text-foreground hover:bg-accent"
                        }`}
                      >
                        Ostatní ({count})
                      </button>
                    );
                  })()}
                </div>
                <p className="sr-only" aria-live="polite">
                  {activeHotspot === "All"
                    ? `Zobrazeno všech ${products.length} produktů.`
                    : activeHotspot === "Outdoor"
                      ? `Filtr: Outdoor — návleky. ${visibleProducts.length} produktů.`
                      : `Filtr: ${HOTSPOT_LABELS[activeHotspot]}. ${visibleProducts.length} produktů.`}
                </p>
              </div>
            </div>
          </section>


          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-base font-bold w-[100px]">Kód</TableHead>
                    <TableHead className="text-base font-bold w-[80px]">Foto</TableHead>
                    <TableHead className="text-base font-bold">Název produktu</TableHead>
                    <TableHead className="text-base font-bold w-[130px]">Dostupnost</TableHead>
                    <TableHead className="text-base font-bold w-[180px] text-right">Cena</TableHead>
                    <TableHead className="text-base font-bold w-[200px] text-center">Počet kusů</TableHead>
                    <TableHead className="text-base font-bold w-[120px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleProducts.map((product) => {
                    const qty = getQty(product.id);
                    const sku = skuMap[product.id] || product.id;
                    const override = getOverride(product.id);
                    const colors = getVariantValues(product, override);
                    const detailHref = `/produkt/${product.id}`;
                    const productTotal = colors.length > 1 ? colors.reduce((s, c) => s + getQty(product.id, c), 0) : qty;
                    const carton = cartonEnabled ? getCartonSize(product.id) : null;

                    return (
                      <TableRow key={product.id} className="hover:bg-muted/30">
                        <TableCell className="text-base font-mono text-muted-foreground">{sku}</TableCell>
                        <TableCell>
                          <ImageZoom src={product.image} alt={`Fotografie ${product.name}`} className="w-14 h-14 bg-muted rounded" />
                        </TableCell>
                        <TableCell>
                          <div>
                            <a href={detailHref} target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-foreground block hover:text-primary hover:underline">{product.name}</a>
                            <span className="text-sm text-muted-foreground">{product.categoryLabel}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-base font-semibold text-primary">● Skladem</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-lg font-bold text-foreground">
                              {fmtCZK(grossFromNet(getUnitNet(product.id)))}{" "}
                              <span className="text-[11px] font-normal text-muted-foreground">s DPH</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">
                              VOC {fmtCZK(getUnitNet(product.id))} bez DPH
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {colors.length > 1 ? (
                            <div className="space-y-1.5 min-w-[220px]">
                              {colors.map((c) => {
                                const { label, hex } = resolveColor(c);
                                const cq = getQty(product.id, c);
                                return (
                                  <div key={c} className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full border border-border shrink-0" style={{ backgroundColor: hex }} title={label} />
                                    <span className="text-sm text-foreground flex-1 truncate">{label}</span>
                                    <input
                                      type="number"
                                      min={0}
                                      value={cq || ""}
                                      placeholder="0"
                                      onChange={(e) => setQty(product.id, Math.max(0, parseInt(e.target.value) || 0), c)}
                                      className="w-16 h-9 text-center text-base font-bold bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                      aria-label={`${product.name} – ${label}`}
                                    />
                                  </div>
                                );
                              })}
                              {carton && (
                                <p className="text-[11px] text-muted-foreground pt-1">1 karton = {carton} ks</p>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1.5">
                              <div className="flex items-center justify-center gap-2">
                              <Button variant="outline" size="icon" className="h-12 w-12 text-xl font-bold" onClick={() => setQty(product.id, Math.max(0, qty - 1))} aria-label={`Odebrat 1 kus ${product.name}`}>
                                <Minus className="w-5 h-5" />
                              </Button>
                              <input type="number" min={0} value={qty} onChange={(e) => setQty(product.id, Math.max(0, parseInt(e.target.value) || 0))} className="w-16 h-12 text-center text-lg font-bold bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary" aria-label={`Počet kusů ${product.name}`} />
                              <Button variant="outline" size="icon" className="h-12 w-12 text-xl font-bold" onClick={() => setQty(product.id, qty + 1)} aria-label={`Přidat 1 kus ${product.name}`}>
                                <Plus className="w-5 h-5" />
                              </Button>
                              </div>
                              {carton && (
                                <button
                                  type="button"
                                  onClick={() => setQty(product.id, carton)}
                                  className="text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
                                >
                                  Celý karton ({carton} ks)
                                </button>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {colors.length > 1 ? (
                            <div className="text-center">
                              <div className={`text-lg font-bold ${productTotal > 0 ? "text-primary" : "text-muted-foreground"}`}>{productTotal} ks</div>
                              <div className="text-[11px] text-muted-foreground">v objednávce</div>
                            </div>
                          ) : (
                            <Button variant={qty > 0 ? "default" : "secondary"} className="h-12 text-base font-semibold w-full gap-2" onClick={() => addToCart(product.id)}>
                              <ShoppingCart className="w-4 h-4" />
                              Přidat
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      </main>

      <aside className="sticky bottom-0 bg-foreground border-t border-border z-40" aria-label="Souhrn objednávky">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-primary-foreground">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              <span className="text-lg font-semibold">Celkem v košíku:</span>
            </div>
            <span className="text-xl font-bold">{totalItems} ks</span>
            <span className="text-xl font-bold">
              {fmtCZK(grossFromNet(totalPrice))}{" "}
              <span className="text-sm font-normal opacity-80">s DPH</span>
              <span className="text-sm font-normal opacity-70 ml-2">({fmtCZK(totalPrice)} bez DPH)</span>
            </span>
          </div>
          <Button size="lg" className="h-14 px-10 text-lg font-bold gap-3" disabled={totalItems === 0} onClick={handleSubmitOrder}>
            <ShoppingCart className="w-5 h-5" />
            Pokračovat do košíku
          </Button>
        </div>
      </aside>
    </div>
  );
};

export default B2BDashboard;
