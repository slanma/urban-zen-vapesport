import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProductById } from "@/data/products";
import { useCart } from "@/hooks/useCart";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { ShieldCheck, Lock, ChevronLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderSummaryTable from "@/components/OrderSummaryTable";
import { fmtCZK } from "@/lib/vat";

type ShippingId = "zasilkovna" | "ppl" | "osobni";
type PaymentId = "cash" | "transfer" | "cod" | "invoice";

interface ShippingOption {
  id: ShippingId;
  label: string;
  price: number; // gross with VAT
  hint?: string;
}

interface PaymentOption {
  id: PaymentId;
  label: string;
  price: number; // gross with VAT
}

const SHIPPING_OPTIONS: ShippingOption[] = [
  { id: "zasilkovna", label: "Zásilkovna – výdejní místa", price: 150, hint: "Vyberte výdejní místo přes widget Packety" },
  { id: "ppl", label: "PPL – Doručení na adresu", price: 200 },
  { id: "osobni", label: "Osobní odběr na prodejně", price: 0 },
];

/** Payment options allowed for each shipping method (per business rules). */
const PAYMENT_MATRIX: Record<ShippingId, PaymentOption[]> = {
  osobni: [{ id: "cash", label: "Hotově na prodejně", price: 0 }],
  zasilkovna: [
    { id: "transfer", label: "Převodem na účet", price: 0 },
    { id: "cod", label: "Dobírka (+50 Kč)", price: 50 },
  ],
  ppl: [
    { id: "transfer", label: "Převodem na účet", price: 0 },
    { id: "invoice", label: "Platba na fakturu", price: 0 },
  ],
};

const Checkout = () => {
  const [form, setForm] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    zip: "",
  });
  const [shipping, setShipping] = useState<ShippingId | null>(null);
  const [payment, setPayment] = useState<PaymentId | null>(null);
  const [packetaPoint, setPacketaPoint] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { items: cartItems } = useCart();
  const { get: getOverride } = useProductOverrides();

  const availablePayments = shipping ? PAYMENT_MATRIX[shipping] : [];

  const shippingOpt = shipping ? SHIPPING_OPTIONS.find((s) => s.id === shipping)! : null;
  const paymentOpt = payment ? availablePayments.find((p) => p.id === payment) ?? null : null;

  const orderLines = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = getProductById(item.productId);
          if (!product) return null;
          const ov = getOverride(product.id);
          if (ov?.visible === false) return null;
          const unit = ov?.price_override ?? product.price;
          return {
            name: item.color ? `${product.name} – ${item.color}` : product.name,
            qty: item.quantity,
            unitGross: unit,
          };
        })
        .filter((x): x is { name: string; qty: number; unitGross: number } => !!x),
    [cartItems, getOverride],
  );

  const subtotalGross = orderLines.reduce((s, it) => s + it.unitGross * it.qty, 0);
  const shippingPrice = shippingOpt?.price ?? 0;
  const paymentPrice = paymentOpt?.price ?? 0;
  const grandGross = subtotalGross + shippingPrice + paymentPrice;

  const handleInput = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /** Simulated Packeta pick-up point picker. A real integration would call
   *  `Packeta.Widget.pick("<apiKey>", cb)` from packeta-widget.js. */
  const openPacketaWidget = () => {
    const demo = "Praha 2 – Vinohradská 12 (Z-BOX)";
    setPacketaPoint(demo);
  };

  const inputClass =
    "w-full h-14 px-4 text-base font-body bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors";
  const labelClass =
    "block text-sm font-body font-semibold text-foreground mb-1.5";

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-32 px-6 lg:px-12 max-w-[1200px] mx-auto">
        <Link
          to="/kosik"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 font-body"
        >
          <ChevronLeft className="w-4 h-4" />
          Zpět do košíku
        </Link>

        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-10">
          Pokladna
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left – form */}
          <div className="lg:col-span-7 space-y-10">
            {/* Personal details */}
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground mb-5">
                Osobní údaje
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="email" className={labelClass}>E-mail</label>
                  <input id="email" type="email" placeholder="vas@email.cz" value={form.email} onChange={(e) => handleInput("email", e.target.value)} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="phone" className={labelClass}>Telefon</label>
                  <input id="phone" type="tel" placeholder="+420 123 456 789" value={form.phone} onChange={(e) => handleInput("phone", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="firstName" className={labelClass}>Jméno</label>
                  <input id="firstName" type="text" value={form.firstName} onChange={(e) => handleInput("firstName", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClass}>Příjmení</label>
                  <input id="lastName" type="text" value={form.lastName} onChange={(e) => handleInput("lastName", e.target.value)} className={inputClass} />
                </div>
                {shipping === "ppl" && (
                  <>
                    <div className="sm:col-span-2">
                      <label htmlFor="street" className={labelClass}>Ulice a číslo popisné</label>
                      <input id="street" type="text" value={form.street} onChange={(e) => handleInput("street", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="city" className={labelClass}>Město</label>
                      <input id="city" type="text" value={form.city} onChange={(e) => handleInput("city", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="zip" className={labelClass}>PSČ</label>
                      <input id="zip" type="text" inputMode="numeric" value={form.zip} onChange={(e) => handleInput("zip", e.target.value)} className={inputClass} />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground mb-5">Doprava</h2>
              <div className="space-y-3">
                {SHIPPING_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      shipping === opt.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.id}
                      checked={shipping === opt.id}
                      onChange={() => setShipping(opt.id)}
                      className="w-5 h-5 accent-[hsl(var(--primary))]"
                    />
                    <span className="flex-1 font-body text-base font-medium text-foreground">
                      {opt.label}
                    </span>
                    <span className="font-heading text-base font-bold text-foreground">
                      {opt.price === 0 ? (
                        <span className="text-primary">Zdarma</span>
                      ) : (
                        fmtCZK(opt.price)
                      )}
                    </span>
                  </label>
                ))}
              </div>

              {shipping === "zasilkovna" && (
                <div className="mt-4 p-4 rounded-xl border border-dashed border-border bg-muted/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div className="text-sm font-body">
                        <p className="font-semibold text-foreground">Výdejní místo Zásilkovna</p>
                        <p className="text-muted-foreground">
                          {packetaPoint ?? "Zatím nevybráno"}
                        </p>
                      </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={openPacketaWidget}>
                      {packetaPoint ? "Změnit" : "Vybrat místo"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment */}
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground mb-5">Platba</h2>
              <div className="space-y-3">
                {availablePayments.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      payment === opt.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.id}
                      checked={payment === opt.id}
                      onChange={() => setPayment(opt.id)}
                      className="w-5 h-5 accent-[hsl(var(--primary))]"
                    />
                    <span className="flex-1 font-body text-base font-medium text-foreground">
                      {opt.label}
                    </span>
                    <span className="font-heading text-base font-bold text-foreground">
                      {opt.price === 0 ? (
                        <span className="text-primary">Zdarma</span>
                      ) : (
                        `+ ${fmtCZK(opt.price)}`
                      )}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground font-body mt-3">
                Dostupné platby závisí na zvoleném způsobu dopravy.
              </p>
            </div>
          </div>

          {/* Right – summary */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 space-y-5">
              <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Vaše objednávka
                </h2>

                <OrderSummaryTable
                  items={orderLines}
                  shippingGross={shippingPrice}
                  paymentGross={paymentPrice}
                  shippingLabel={shippingOpt?.label ?? "Doprava (nezvoleno)"}
                  paymentLabel={paymentOpt?.label ?? "Platba (nezvoleno)"}
                />

                {(!shipping || !payment) && (
                  <p className="text-xs text-destructive font-body">
                    Pro dokončení vyberte způsob dopravy a platby.
                  </p>
                )}

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                    className="mt-1 w-5 h-5 accent-[hsl(var(--primary))] shrink-0"
                  />
                  <span className="text-sm font-body text-foreground leading-snug">
                    Souhlasím s{" "}
                    <a href="/obchodni-podminky" target="_blank" rel="noopener" className="underline hover:text-primary">
                      obchodními podmínkami
                    </a>{" "}
                    a beru na vědomí{" "}
                    <a href="/ochrana-udaju" target="_blank" rel="noopener" className="underline hover:text-primary">
                      zásady ochrany osobních údajů
                    </a>.
                  </span>
                </label>

                <Button
                  size="lg"
                  disabled={
                    !termsAccepted ||
                    !shipping ||
                    !payment ||
                    orderLines.length === 0 ||
                    (shipping === "zasilkovna" && !packetaPoint)
                  }
                  className="w-full h-16 text-base md:text-lg font-bold rounded-full tracking-wide gap-2 px-4 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-5 h-5 shrink-0" />
                  <span>Objednat s povinností platby — {fmtCZK(grandGross)}</span>
                </Button>

                <div className="flex flex-col items-center gap-2 pt-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="font-bold uppercase tracking-wider">3 roky · 0 reklamací</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-body text-center">
                    Bezpečná platba · Šifrované spojení · Česká značka
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Checkout;
