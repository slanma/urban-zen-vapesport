import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProductById } from "@/data/products";
import { Minus, Plus, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

const Cart = () => {
  const { items: cart, updateQty, removeItem } = useCart();

  const getProduct = getProductById;

  const subtotal = cart.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
          Košík
        </h1>
        <p className="font-body text-muted-foreground mb-10">
          {cart.length === 0
            ? "Váš košík je prázdný."
            : `${cart.length} ${cart.length === 1 ? "položka" : cart.length < 5 ? "položky" : "položek"} v košíku`}
        </p>

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
              {cart.map((item) => {
                const product = getProduct(item.productId);
                if (!product) return null;

                return (
                  <div
                    key={item.productId}
                    className="flex items-center gap-4 md:gap-6 bg-card border border-border rounded-xl p-4 md:p-5"
                  >
                    {/* Thumbnail */}
                    <Link
                      to={`/produkt/${product.id}`}
                      className="shrink-0 w-20 h-20 md:w-24 md:h-24 bg-muted rounded-lg overflow-hidden"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/produkt/${product.id}`}
                        className="font-heading text-base md:text-lg font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {product.name}
                      </Link>
                      <p className="text-sm font-body text-muted-foreground mt-0.5">
                        {item.color ? `${product.categoryLabel} · ${item.color}` : product.categoryLabel}
                      </p>
                      <p className="font-heading text-lg font-bold text-foreground mt-1 md:hidden">
                        {(product.price * item.quantity).toLocaleString("cs-CZ")}&nbsp;Kč
                      </p>
                    </div>

                    {/* Quantity */}
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

                    {/* Price (desktop) */}
                    <span className="hidden md:block font-heading text-xl font-bold text-foreground w-28 text-right">
                      {(product.price * item.quantity).toLocaleString("cs-CZ")}&nbsp;Kč
                    </span>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.productId, item.color)}
                      className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label={`Odstranit ${product.name}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="lg:col-span-4">
              <div className="bg-card border border-border rounded-xl p-6 lg:sticky lg:top-28 space-y-5">
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Souhrn objednávky
                </h2>

                <div className="space-y-3 font-body text-base">
                  <div className="flex justify-between text-foreground">
                    <span>Mezisoučet</span>
                    <span className="font-semibold">
                      {subtotal.toLocaleString("cs-CZ")}&nbsp;Kč
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dopravu a platbu zvolíte v dalším kroku.
                  </p>
                  <div className="border-t border-border pt-3 flex justify-between text-foreground">
                    <span className="font-heading text-lg font-bold">Mezisoučet</span>
                    <span className="font-heading text-2xl font-bold">
                      {subtotal.toLocaleString("cs-CZ")}&nbsp;Kč
                    </span>
                  </div>
                </div>

                <Link to="/pokladna" className="block">
                  <Button
                    size="lg"
                    className="w-full h-14 text-base font-bold rounded-full tracking-wide"
                  >
                    PŘEJÍT K POKLADNĚ
                  </Button>
                </Link>

                <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground font-body pt-1">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Bezpečný nákup · 3 roky · 0 reklamací</span>
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
