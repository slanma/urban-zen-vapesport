import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getProductById, products } from "@/data/products";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Minus, ShoppingCart, Send, LogOut, Loader2 } from "lucide-react";

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
  discount_percent: number;
  status: string;
}

interface CartItem {
  productId: string;
  qty: number;
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
      `${SUPABASE_URL}/rest/v1/b2b_profiles?select=company_name,discount_percent,status&user_id=eq.${session.user?.id}&limit=1`,
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
  const [profile, setProfile] = useState<B2BProfileData | null>(null);
  const [accountLabel, setAccountLabel] = useState("");
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessError, setAccessError] = useState("");

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

  const b2bDiscount = profile ? (100 - profile.discount_percent) / 100 : 0.7;

  const getQty = (id: string) => cart.find((c) => c.productId === id)?.qty ?? 0;

  const setQty = (id: string, qty: number) => {
    if (qty < 0) return;
    setCart((prev) => {
      const exists = prev.find((c) => c.productId === id);
      if (!exists && qty > 0) return [...prev, { productId: id, qty }];
      if (qty === 0) return prev.filter((c) => c.productId !== id);
      return prev.map((c) => (c.productId === id ? { ...c, qty } : c));
    });
  };

  const addToCart = (id: string) => setQty(id, getQty(id) || 1);

  const totalItems = useMemo(() => cart.reduce((sum, c) => sum + c.qty, 0), [cart]);
  const totalPrice = useMemo(
    () => cart.reduce((sum, c) => {
      const product = getProductById(c.productId);
      return sum + (product ? product.price * b2bDiscount * c.qty : 0);
    }, 0),
    [cart, b2bDiscount]
  );

  const [submitting, setSubmitting] = useState(false);

  const handleLogout = async () => {
    clearStoredSession();
    navigate("/b2b-login", { replace: true });
  };

  const handleSubmitOrder = async () => {
    const session = getStoredSession();
    if (!session?.access_token || !session.user?.id) {
      toast.error("Pro odeslání objednávky se přihlaste znovu.");
      navigate("/b2b-login", { replace: true });
      return;
    }
    if (cart.length === 0) return;

    const items = cart.map((c) => {
      const product = getProductById(c.productId);
      const unitPrice = product ? Math.round(product.price * b2bDiscount) : 0;
      return {
        product_id: c.productId,
        sku: skuMap[c.productId] || c.productId,
        name: product?.name ?? c.productId,
        qty: c.qty,
        unit_price: unitPrice,
        line_total: unitPrice * c.qty,
      };
    });

    const orderNumber = `B2B-${Date.now()}`;
    const payload = {
      order_number: orderNumber,
      user_id: session.user.id,
      is_b2b: true,
      email: session.user.email ?? "",
      company_name: profile?.company_name ?? null,
      items,
      subtotal_gross: Math.round(totalPrice),
      total_gross: Math.round(totalPrice),
      status: "nova",
    };

    setSubmitting(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }
      toast.success("Objednávka byla odeslána", { description: `Číslo objednávky: ${orderNumber}` });
      setCart([]);
    } catch (error) {
      console.error("[B2BDashboard] submit order failed:", error);
      toast.error("Objednávku se nepodařilo odeslat", {
        description: error instanceof Error ? error.message : "Zkuste to prosím znovu.",
      });
    } finally {
      setSubmitting(false);
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

  const discountLabel = profile ? `${profile.discount_percent} %` : "30 %";

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <nav className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-4 md:px-8" aria-label="B2B navigace">
          <a href="/" className="font-heading text-xl font-bold text-foreground tracking-tight">
            Vapesport <span className="text-primary font-medium text-sm ml-1">B2B</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/b2b-velkoobchod" className="text-sm font-semibold text-primary hover:underline hidden sm:inline">
              Velkoobchodní matrix →
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
              Vyberte produkty a zadejte množství. Ceny jsou po slevě {discountLabel} z&nbsp;maloobchodní ceny.
            </p>
          </header>

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
                  {products.map((product) => {
                    const qty = getQty(product.id);
                    const b2bPrice = Math.round(product.price * b2bDiscount);
                    const sku = skuMap[product.id] || product.id;

                    return (
                      <TableRow key={product.id} className="hover:bg-muted/30">
                        <TableCell className="text-base font-mono text-muted-foreground">{sku}</TableCell>
                        <TableCell>
                          <div className="w-14 h-14 bg-muted rounded flex items-center justify-center overflow-hidden">
                            <img src={product.image} alt={`Fotografie ${product.name}`} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="text-base font-semibold text-foreground block">{product.name}</span>
                            <span className="text-sm text-muted-foreground">{product.categoryLabel}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-base font-semibold text-primary">● Skladem</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-sm text-muted-foreground line-through">MOC {product.price.toLocaleString("cs-CZ")}&nbsp;Kč</span>
                            <span className="text-lg font-bold text-primary">{b2bPrice.toLocaleString("cs-CZ")}&nbsp;Kč</span>
                            <span className="text-xs font-semibold text-primary/70">Sleva {discountLabel}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="outline" size="icon" className="h-12 w-12 text-xl font-bold" onClick={() => setQty(product.id, Math.max(0, qty - 1))} aria-label={`Odebrat 1 kus ${product.name}`}>
                              <Minus className="w-5 h-5" />
                            </Button>
                            <input type="number" min={0} value={qty} onChange={(e) => setQty(product.id, Math.max(0, parseInt(e.target.value) || 0))} className="w-16 h-12 text-center text-lg font-bold bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary" aria-label={`Počet kusů ${product.name}`} />
                            <Button variant="outline" size="icon" className="h-12 w-12 text-xl font-bold" onClick={() => setQty(product.id, qty + 1)} aria-label={`Přidat 1 kus ${product.name}`}>
                              <Plus className="w-5 h-5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant={qty > 0 ? "default" : "secondary"} className="h-12 text-base font-semibold w-full gap-2" onClick={() => addToCart(product.id)}>
                            <ShoppingCart className="w-4 h-4" />
                            Přidat
                          </Button>
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
            <span className="text-xl font-bold">{totalPrice.toLocaleString("cs-CZ")}&nbsp;Kč bez DPH</span>
          </div>
          <Button size="lg" className="h-14 px-10 text-lg font-bold gap-3" disabled={totalItems === 0 || submitting} onClick={handleSubmitOrder}>
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {submitting ? "Odesílám…" : "Odeslat B2B objednávku"}
          </Button>
        </div>
      </aside>
    </div>
  );
};

export default B2BDashboard;
