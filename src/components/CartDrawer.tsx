import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, Lock } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { useB2BPartner } from "@/hooks/useB2BPartner";
import { getProductById } from "@/data/products";
import { fmtCZK, netFromGross } from "@/lib/vat";
import { getEffectiveUnitPricing } from "@/lib/pricing";

const CartDrawer = () => {
  const { items, isOpen, closeDrawer, updateQty, removeItem } = useCart();
  const { get } = useProductOverrides();
  const { isPartner, profile } = useB2BPartner();

  const lines = items
    .map((i) => {
      const p = getProductById(i.productId);
      if (!p) return null;
      const ov = get(p.id);
      if (ov?.visible === false) return null;
      const pricing = getEffectiveUnitPricing(p, ov, isPartner, profile?.discount_percent);
      return { item: i, product: p, pricing };
    })
    .filter((x): x is { item: typeof items[0]; product: NonNullable<ReturnType<typeof getProductById>>; pricing: ReturnType<typeof getEffectiveUnitPricing> } => !!x);

  const subtotalGross = lines.reduce((s, l) => s + l.pricing.unitGross * l.item.quantity, 0);
  const subtotalNet = lines.reduce((s, l) => s + l.pricing.unitNet * l.item.quantity, 0);
  const subtotalVat = subtotalGross - subtotalNet;

  return (
    <Sheet open={isOpen} onOpenChange={(o) => (o ? null : closeDrawer())}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 bg-background">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Váš košík
            {isPartner && (
              <span className="ml-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                <Lock className="w-3 h-3" /> B2B · VOC
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
            <p className="font-body text-muted-foreground">Košík je prázdný.</p>
            <Button onClick={closeDrawer} variant="outline" className="rounded-full">
              Pokračovat v nákupu
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {lines.map(({ item, product, pricing }) => (
                <div
                  key={`${item.productId}-${item.color ?? ""}`}
                  className="flex gap-3 pb-4 border-b border-border last:border-b-0"
                >
                  <Link
                    to={`/produkt/${product.id}`}
                    onClick={closeDrawer}
                    className="shrink-0 w-20 h-20 bg-muted rounded-lg overflow-hidden"
                  >
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/produkt/${product.id}`}
                      onClick={closeDrawer}
                      className="font-heading text-sm font-bold text-foreground hover:text-primary line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    {item.color && (
                      <p className="text-xs text-muted-foreground font-body mt-0.5">
                        Barva: {item.color}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.productId, -1, item.color)}
                          className="w-7 h-7 flex items-center justify-center rounded border border-border hover:bg-accent"
                          aria-label="Snížit"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-heading text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, 1, item.color)}
                          className="w-7 h-7 flex items-center justify-center rounded border border-border hover:bg-accent"
                          aria-label="Zvýšit"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="font-heading text-sm font-bold text-foreground">
                          {fmtCZK((pricing.isB2B ? pricing.unitNet : pricing.unitGross) * item.quantity)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {pricing.isB2B ? "VOC bez DPH" : "s DPH"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.color)}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label="Odstranit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-6 py-5 space-y-3 bg-card">
              {isPartner ? (
                <>
                  <div className="flex justify-between font-body text-sm text-foreground">
                    <span>Mezisoučet bez DPH</span>
                    <span className="tabular-nums font-semibold">{fmtCZK(subtotalNet)}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm text-muted-foreground">
                    <span>DPH 21 %</span>
                    <span className="tabular-nums">{fmtCZK(subtotalVat)}</span>
                  </div>
                  <div className="flex justify-between items-baseline border-t border-border pt-3">
                    <span className="font-heading text-base font-bold text-foreground">Celkem s DPH</span>
                    <span className="font-heading text-2xl font-bold text-foreground tabular-nums">
                      {fmtCZK(subtotalGross)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between font-body text-sm text-muted-foreground">
                    <span>Bez DPH</span>
                    <span className="tabular-nums">{fmtCZK(netFromGross(subtotalGross))}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="font-heading text-base font-bold text-foreground">Mezisoučet</span>
                    <span className="font-heading text-2xl font-bold text-foreground tabular-nums">
                      {fmtCZK(subtotalGross)}
                    </span>
                  </div>
                </>
              )}
              <p className="text-xs text-muted-foreground font-body">
                Dopravu a platbu si zvolíte v dalším kroku.
              </p>
              <Link to="/pokladna" onClick={closeDrawer} className="block">
                <Button size="lg" className="w-full h-12 rounded-full font-bold tracking-wide">
                  Přejít k pokladně
                </Button>
              </Link>
              <Button onClick={closeDrawer} variant="ghost" className="w-full text-sm">
                Pokračovat v nákupu
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
