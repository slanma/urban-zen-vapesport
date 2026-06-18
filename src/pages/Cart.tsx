import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import B2BModeBanner from "@/components/B2BModeBanner";
import { getProductById } from "@/data/products";
import { Minus, Plus, Trash2, ShieldCheck, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { useB2BPartner } from "@/hooks/useB2BPartner";
import { getEffectiveUnitPricing } from "@/lib/pricing";
import { getEffectiveProductCode } from "@/lib/effectiveProduct";
import { fmtCZK } from "@/lib/vat";

const Cart = () => {
  const { items: cart, updateQty, removeItem } = useCart();
  const { get } = useProductOverrides();
  const { isPartner, profile } = useB2BPartner();

  const lines = cart
    .map((item) => {
      const product = getProductById(item.productId);
      if (!product) return null;
      const ov = get(product.id);
      if (ov?.visible === false) return null;
      const pricing = getEffectiveUnitPricing(product, ov, isPartner, profile?.discount_percent);
      const code = getEffectiveProductCode(product, ov);
      const isAuto = item.meta?.auto === true;
      return { item, product, pricing, code, isAuto };
    })
    .filter((x): x is { item: typeof cart[0]; product: NonNullable<ReturnType<typeof getProductById>>; pricing: ReturnType<typeof getEffectiveUnitPricing>; code: string; isAuto: boolean } => !!x);

  const subtotalGross = lines.reduce((s, l) => s + l.pricing.unitGross * l.item.quantity, 0);
  const subtotalNet = lines.reduce((s, l) => s + l.pricing.unitNet * l.item.quantity, 0);
  const subtotalVat = subtotalGross - subtotalNet;


  return (
    <main className="min-h-screen bg-background">
      <Navbar isLoggedIn={isPartner} />

      <section className="pt-32 pb-24 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
          Košík
        </h1>
        <p className="font-body text-muted-foreground mb-6">
          {cart.length === 0
            ? "Váš košík je prázdný."
            : `${cart.length} ${cart.length === 1 ? "položka" : cart.length < 5 ? "položky" : "položek"} v košíku`}
        </p>

        <B2BModeBanner className="mb-8 max-w-3xl" />

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body text-lg text-muted-foreground mb-6">
              Zatím jste nic nepřidali.
            </p>
            <Link to="/obchod">
              <Button size="lg" className="rounded-full px-10 text-base font-semibold">
                Zpět do obchodu
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Cart items */}
            <div className="lg:col-span-8 space-y-4">
              {lines.map(({ item, product, pricing, code, isAuto }) => {
                const lineTotal = (pricing.isB2B ? pricing.unitNet : pricing.unitGross) * item.quantity;
                return (
                  <div
                    key={`${item.productId}-${item.color ?? ""}`}
                    className={`flex items-center gap-4 md:gap-6 bg-card border rounded-xl p-4 md:p-5 ${
                      isAuto ? "border-primary/40 bg-primary/[0.04]" : "border-border"
                    }`}
                  >
                    <Link
                      to={`/produkt/${product.id}`}
                      className="shrink-0 w-20 h-20 md:w-24 md:h-24 bg-muted rounded-lg overflow-hidden"
                    >
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </Link>

                    <div className="flex-1 min-w-0">
                      {isAuto && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold bg-primary/15 text-primary px-2 py-0.5 rounded mb-1">
                          <Sparkles className="w-3 h-3" /> Přidáno automaticky
                        </span>
                      )}
                      <Link
                        to={`/produkt/${product.id}`}
                        className="block font-heading text-base md:text-lg font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">
                        Kód: <span className="text-foreground/80">{code}</span>
                        {item.color && (
                          <>
                            {" · "}Barva: <span className="text-foreground/80">{item.color}</span>
                          </>
                        )}
                      </p>
                      <p className="text-sm font-body text-muted-foreground mt-0.5">
                        {product.categoryLabel}
                      </p>
                      <p className="font-heading text-lg font-bold text-foreground mt-1 md:hidden">
                        {fmtCZK(lineTotal)}
                        <span className="text-[10px] text-muted-foreground ml-1 font-body font-normal">
                          {pricing.isB2B ? "bez DPH" : "s DPH"}
                        </span>
                      </p>
                    </div>

                    {isAuto ? (
                      <div className="hidden md:flex flex-col items-center w-32 text-center">
                        <span className="font-heading text-sm font-bold text-foreground tabular-nums">
                          ks {item.quantity}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">
                          Vázáno na produkt
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.productId, -1, item.color)}
                          className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-accent transition-colors text-lg font-bold"
                          aria-label="Snížit množství"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 md:w-12 text-center font-heading text-lg font-bold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, 1, item.color)}
                          className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-accent transition-colors text-lg font-bold"
                          aria-label="Zvýšit množství"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="hidden md:flex flex-col items-end w-32">
                      <span className="font-heading text-xl font-bold text-foreground tabular-nums">
                        {lineTotal === 0 ? "Zdarma" : fmtCZK(lineTotal)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">
                        {pricing.isB2B ? "bez DPH" : "s DPH"}
                      </span>
                    </div>

                    {isAuto ? (
                      <div className="shrink-0 w-10 h-10" aria-hidden />
                    ) : (
                      <button
                        onClick={() => removeItem(item.productId, item.color)}
                        className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label={`Odstranit ${product.name}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                );
              })}

            </div>

            {/* Summary */}
            <div className="lg:col-span-4">
              <div className="bg-card border border-border rounded-xl p-6 lg:sticky lg:top-28 space-y-5">
                <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
                  Souhrn objednávky
                  {isPartner && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                      <Lock className="w-3 h-3" /> VOC
                    </span>
                  )}
                </h2>

                {isPartner ? (
                  <div className="space-y-3 font-body text-base">
                    <div className="flex justify-between text-foreground">
                      <span>Mezisoučet bez DPH</span>
                      <span className="font-semibold tabular-nums">{fmtCZK(subtotalNet)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-sm">
                      <span>DPH 21 %</span>
                      <span className="tabular-nums">{fmtCZK(subtotalVat)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dopravu a platbu zvolíte v dalším kroku.
                    </p>
                    <div className="border-t border-border pt-3 flex justify-between text-foreground">
                      <span className="font-heading text-lg font-bold">Celkem s DPH</span>
                      <span className="font-heading text-2xl font-bold tabular-nums">
                        {fmtCZK(subtotalGross)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 font-body text-base">
                    <div className="flex justify-between text-foreground">
                      <span>Mezisoučet</span>
                      <span className="font-semibold tabular-nums">{fmtCZK(subtotalGross)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dopravu a platbu zvolíte v dalším kroku.
                    </p>
                    <div className="border-t border-border pt-3 flex justify-between text-foreground">
                      <span className="font-heading text-lg font-bold">Mezisoučet</span>
                      <span className="font-heading text-2xl font-bold tabular-nums">
                        {fmtCZK(subtotalGross)}
                      </span>
                    </div>
                  </div>
                )}

                <Link to="/pokladna" className="block">
                  <Button
                    size="lg"
                    className="w-full h-14 text-base font-bold rounded-full tracking-wide"
                  >
                    Pokračovat do pokladny
                  </Button>
                </Link>


                <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground font-body pt-1">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Bezpečný nákup</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
};

export default Cart;
