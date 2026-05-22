import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProductById } from "@/data/products";
import { ShieldCheck, Lock, ChevronLeft, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";

/* Dummy cart for demo */
const cartItems = [
  { productId: "morseo-elektro-ii", quantity: 1 },
  { productId: "velky-trojuhelnik", quantity: 2 },
  { productId: "neopren-baterie", quantity: 1 },
];

const SHIPPING_OPTIONS = [
  { id: "zasilkovna", label: "Zásilkovna – výdejní místo", price: 69 },
  { id: "kuryr", label: "Kurýr na adresu", price: 129 },
  { id: "osobni", label: "Osobní odběr – zdarma", price: 0 },
];

const PAYMENT_OPTIONS = [
  { id: "card", label: "Platba kartou" },
  { id: "transfer", label: "Bankovní převod" },
  { id: "applepay", label: "Apple Pay / Google Pay" },
];

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
  const [shipping, setShipping] = useState("zasilkovna");
  const [payment, setPayment] = useState("card");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const getProduct = getProductById;

  const subtotal = cartItems.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  const shippingCost =
    SHIPPING_OPTIONS.find((s) => s.id === shipping)?.price ?? 0;
  const total = subtotal + shippingCost;

  const handleInput = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const inputClass =
    "w-full h-14 px-4 text-base font-body bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors";
  const labelClass =
    "block text-sm font-body font-semibold text-foreground mb-1.5";

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-32 px-6 lg:px-12 max-w-[1100px] mx-auto">
        {/* Back */}
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
            {/* Express checkout */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-heading text-lg font-bold text-foreground mb-4">
                Expresní platba
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button className="h-14 flex items-center justify-center gap-2 bg-foreground text-background rounded-lg font-body font-bold text-base hover:opacity-90 transition-opacity">
                  <Apple className="w-5 h-5" />
                  Apple Pay
                </button>
                <button className="h-14 flex items-center justify-center gap-2 bg-foreground text-background rounded-lg font-body font-bold text-base hover:opacity-90 transition-opacity">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                  Google Pay
                </button>
              </div>
              <div className="flex items-center gap-3 mt-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-body text-muted-foreground uppercase tracking-wider">
                  nebo vyplňte údaje
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </div>

            {/* Personal details */}
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground mb-5">
                Osobní údaje
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="email" className={labelClass}>
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="vas@email.cz"
                    value={form.email}
                    onChange={(e) => handleInput("email", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="phone" className={labelClass}>
                    Telefon
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+420 123 456 789"
                    value={form.phone}
                    onChange={(e) => handleInput("phone", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="firstName" className={labelClass}>
                    Jméno
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={(e) => handleInput("firstName", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClass}>
                    Příjmení
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={(e) => handleInput("lastName", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="street" className={labelClass}>
                    Ulice a číslo popisné
                  </label>
                  <input
                    id="street"
                    type="text"
                    value={form.street}
                    onChange={(e) => handleInput("street", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="city" className={labelClass}>
                    Město
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={form.city}
                    onChange={(e) => handleInput("city", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="zip" className={labelClass}>
                    PSČ
                  </label>
                  <input
                    id="zip"
                    type="text"
                    inputMode="numeric"
                    value={form.zip}
                    onChange={(e) => handleInput("zip", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground mb-5">
                Doprava
              </h2>
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
                        `${opt.price} Kč`
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground mb-5">
                Platba
              </h2>
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((opt) => (
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
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right – summary */}
          <div className="lg:col-span-5">
            <div className="bg-card border border-border rounded-xl p-6 lg:sticky lg:top-28 space-y-5">
              <h2 className="font-heading text-xl font-bold text-foreground">
                Vaše objednávka
              </h2>

              {/* Items */}
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const product = getProduct(item.productId);
                  if (!product) return null;
                  return (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3"
                    >
                      <div className="w-14 h-14 bg-muted rounded-lg overflow-hidden shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-semibold text-foreground truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-body">
                          {item.quantity}×
                        </p>
                      </div>
                      <span className="font-heading text-sm font-bold text-foreground shrink-0">
                        {(product.price * item.quantity).toLocaleString("cs-CZ")}&nbsp;Kč
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4 space-y-2 font-body text-base">
                <div className="flex justify-between text-foreground">
                  <span>Mezisoučet</span>
                  <span className="font-semibold">
                    {subtotal.toLocaleString("cs-CZ")}&nbsp;Kč
                  </span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span>Doprava</span>
                  <span className="font-semibold">
                    {shippingCost === 0 ? (
                      <span className="text-primary">Zdarma</span>
                    ) : (
                      `${shippingCost.toLocaleString("cs-CZ")} Kč`
                    )}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-heading text-lg font-bold text-foreground">
                    Celkem
                  </span>
                  <span className="font-heading text-2xl font-bold text-foreground">
                    {total.toLocaleString("cs-CZ")}&nbsp;Kč
                  </span>
                </div>
              </div>

              {/* Mandatory consent */}
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
                  </a>
                  .
                </span>
              </label>

              {/* CTA */}
              <Button
                size="lg"
                disabled={!termsAccepted}
                className="w-full h-16 text-base md:text-lg font-bold rounded-full tracking-wide gap-2 px-4 text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="w-5 h-5 shrink-0" />
                <span>Objednat s povinností platby — {total.toLocaleString("cs-CZ")}&nbsp;Kč</span>
              </Button>

              {/* Trust signals */}
              <div className="flex flex-col items-center gap-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="font-bold uppercase tracking-wider">
                    3 roky · 0 reklamací
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground font-body text-center">
                  Bezpečná platba · Šifrované spojení · Česká značka
                </p>
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
