import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { getProductById } from "@/data/products";
import { fmtCZK, netFromGross } from "@/lib/vat";

const CartDrawer = () => {
  const { items, isOpen, closeDrawer, updateQty, removeItem } = useCart();
  const { get } = useProductOverrides();

  const lines = items
    .map((i) => {
      const p = getProductById(i.productId);
      if (!p) return null;
      const ov = get(p.id);
      if (ov?.visible === false) return null;
      const unit = ov?.price_override ?? p.price;
      return { item: i, product: p, unit };
    })
    .filter((x): x is { item: typeof items[0]; product: NonNullable<ReturnType<typeof getProductById>>; unit: number } => !!x);

  const subtotalGross = lines.reduce((s, l) => s + l.unit * l.item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={(o) => (o ? null : closeDrawer())}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 bg-background">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Váš košík
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
              {lines.map(({ item, product, unit }) => (
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
                      <span className="font-heading text-sm font-bold text-foreground">
                        {fmtCZK(unit * item.quantity)}
                      </span>
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

            <div className="border-t border-border px-6 py-5 space-y-4 bg-card">
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
