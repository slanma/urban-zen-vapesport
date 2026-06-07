import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import B2BModeBanner from "@/components/B2BModeBanner";
import { getProductById } from "@/data/products";
import { useCart } from "@/hooks/useCart";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { useB2BPartner } from "@/hooks/useB2BPartner";
import { useAuth } from "@/hooks/useAuth";
import { getEffectiveUnitPricing } from "@/lib/pricing";
import { ShieldCheck, Lock, ChevronLeft, MapPin, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderSummaryTable from "@/components/OrderSummaryTable";
import { fmtCZK } from "@/lib/vat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

/**
 * Allowed payments per shipping method. B2B partners get an extra
 * "faktura se splatností 14 dní" option appended dynamically.
 */
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPartner, profile } = useB2BPartner();
  const { items: cartItems, clear: clearCart } = useCart();
  const { get: getOverride } = useProductOverrides();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    zip: "",
    // B2B-only
    company: "",
    ico: "",
    dic: "",
  });
  const [shipping, setShipping] = useState<ShippingId | null>(null);
  const [payment, setPayment] = useState<PaymentId | null>(null);
  const [packetaPoint, setPacketaPoint] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Pre-fill from B2B profile once it loads.
  useEffect(() => {
    if (!profile) return;
    setForm((f) => ({
      ...f,
      company: f.company || profile.company_name,
      ico: f.ico || profile.ico,
      dic: f.dic || (profile.dic ?? ""),
      phone: f.phone || profile.phone,
      street: f.street || profile.address,
      city: f.city || profile.city,
      zip: f.zip || profile.zip,
      firstName: f.firstName || profile.contact_person.split(" ")[0] || "",
      lastName:
        f.lastName ||
        profile.contact_person.split(" ").slice(1).join(" ") ||
        "",
    }));
  }, [profile]);

  const availablePayments = useMemo<PaymentOption[]>(() => {
    if (!shipping) return [];
    const base = PAYMENT_MATRIX[shipping];
    // B2B partners always get "Faktura 14 dní splatnost" as an option
    if (isPartner && !base.some((p) => p.id === "invoice")) {
      return [...base, { id: "invoice", label: "Faktura — splatnost 14 dní (B2B)", price: 0 }];
    }
    if (isPartner) {
      return base.map((p) =>
        p.id === "invoice" ? { ...p, label: "Faktura — splatnost 14 dní (B2B)" } : p,
      );
    }
    return base;
  }, [shipping, isPartner]);

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
          const pricing = getEffectiveUnitPricing(product, ov, isPartner);
          return {
            name: item.color ? `${product.name} – ${item.color}` : product.name,
            qty: item.quantity,
            unitGross: pricing.unitGross,
            isB2B: pricing.isB2B,
          };
        })
        .filter((x): x is { name: string; qty: number; unitGross: number; isB2B: boolean } => !!x),
    [cartItems, getOverride, isPartner],
  );

  const subtotalGross = orderLines.reduce((s, it) => s + it.unitGross * it.qty, 0);
  const shippingPrice = shippingOpt?.price ?? 0;
  const paymentPrice = paymentOpt?.price ?? 0;
  const grandGross = subtotalGross + shippingPrice + paymentPrice;

  const handleInput = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /** Simulated Packeta pick-up point picker. */
  const openPacketaWidget = () => {
    const demo = "Praha 2 – Vinohradská 12 (Z-BOX)";
    setPacketaPoint(demo);
  };

  const inputClass =
    "w-full h-14 px-4 text-base font-body bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors";
  const labelClass =
    "block text-sm font-body font-semibold text-foreground mb-1.5";

  // B2B-required validation: company + IČO
  const b2bFieldsOk = !isPartner || (form.company.trim() && form.ico.trim());

  return (
    <main className="min-h-screen bg-background">
      <Navbar isLoggedIn={isPartner} />

      <section className="pt-32 pb-32 px-6 lg:px-12 max-w-[1200px] mx-auto">
        <Link
          to="/kosik"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 font-body"
        >
          <ChevronLeft className="w-4 h-4" />
          Zpět do košíku
        </Link>

        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
          Pokladna
        </h1>

        <B2BModeBanner className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left – form */}
          <div className="lg:col-span-7 space-y-10">
            {/* B2B – company invoicing block */}
            {isPartner && (
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Fakturační údaje firmy
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="company" className={labelClass}>Název firmy *</label>
                    <input id="company" type="text" value={form.company} onChange={(e) => handleInput("company", e.target.value)} className={inputClass} required />
                  </div>
                  <div>
                    <label htmlFor="ico" className={labelClass}>IČO *</label>
                    <input id="ico" type="text" value={form.ico} onChange={(e) => handleInput("ico", e.target.value)} className={inputClass} required />
                  </div>
                  <div>
                    <label htmlFor="dic" className={labelClass}>DIČ</label>
                    <input id="dic" type="text" placeholder="CZ…" value={form.dic} onChange={(e) => handleInput("dic", e.target.value)} className={inputClass} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-body mt-2">
                  Údaje předvyplněné z vašeho B2B profilu. Můžete je upravit pro tuto objednávku.
                </p>
              </div>
            )}

            {/* Personal details */}
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground mb-5">
                {isPartner ? "Kontaktní osoba" : "Osobní údaje"}
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
                {(shipping === "ppl" || isPartner) && (
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
                      onChange={() => { setShipping(opt.id); setPayment(null); }}
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
              {!shipping ? (
                <div className="p-4 rounded-xl border border-dashed border-border bg-muted/30 text-sm font-body text-muted-foreground">
                  Nejprve zvolte způsob dopravy.
                </div>
              ) : (
                <>
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
                    {isPartner
                      ? "Jako B2B partner můžete platit fakturou se splatností 14 dní."
                      : "Dostupné platby závisí na zvoleném způsobu dopravy."}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right – summary */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 space-y-5">
              <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
                  Vaše objednávka
                  {isPartner && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                      <Lock className="w-3 h-3" /> B2B
                    </span>
                  )}
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
                {isPartner && !b2bFieldsOk && (
                  <p className="text-xs text-destructive font-body">
                    Vyplňte název firmy a IČO pro fakturu.
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
                  onClick={handleSubmit}
                  disabled={
                    submitting ||
                    !termsAccepted ||
                    !shipping ||
                    !payment ||
                    orderLines.length === 0 ||
                    (shipping === "zasilkovna" && !packetaPoint) ||
                    !b2bFieldsOk
                  }
                  className="w-full h-16 text-base md:text-lg font-bold rounded-full tracking-wide gap-2 px-4 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  ) : (
                    <Lock className="w-5 h-5 shrink-0" />
                  )}
                  <span>
                    {submitting
                      ? "Odesílám…"
                      : isPartner
                        ? `Objednat (B2B faktura) — ${fmtCZK(grandGross)}`
                        : `Objednat s povinností platby — ${fmtCZK(grandGross)}`}
                  </span>
                </Button>

                <div className="flex flex-col items-center gap-2 pt-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="font-bold uppercase tracking-wider">
                      {isPartner ? "Daňový doklad — faktura" : "3 roky · 0 reklamací"}
                    </span>
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
