import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProductById, products } from "@/data/products";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Minus, ShoppingCart, Send, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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

const B2BDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [profile, setProfile] = useState<{ company_name: string; discount_percent: number } | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/b2b-login");
      return;
    }

    const checkAccess = async () => {
      const { data: status } = await supabase.rpc("get_b2b_status", { _user_id: user.id });
      if (status !== "approved") {
        await signOut();
        navigate("/b2b-login");
        return;
      }

      const { data: profileData } = await supabase
        .from("b2b_profiles")
        .select("company_name, discount_percent")
        .eq("user_id", user.id)
        .single();

      setProfile(profileData);
      setCheckingAccess(false);
    };

    checkAccess();
  }, [user, authLoading, navigate, signOut]);

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

  const handleLogout = async () => {
    await signOut();
    navigate("/b2b-login");
  };

  if (authLoading || checkingAccess) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
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
            <span className="text-base text-muted-foreground hidden sm:inline">
              {profile?.company_name || user?.email}
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
          <Button size="lg" className="h-14 px-10 text-lg font-bold gap-3" disabled={totalItems === 0}>
            <Send className="w-5 h-5" />
            Odeslat B2B objednávku
          </Button>
        </div>
      </aside>
    </div>
  );
};

export default B2BDashboard;
