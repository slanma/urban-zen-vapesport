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
import { ShieldCheck, Lock, ChevronLeft, MapPin, Building2, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ImageUpload";
import OrderSummaryTable from "@/components/OrderSummaryTable";
import { fmtCZK } from "@/lib/vat";
import { getEffectiveProductCode } from "@/lib/effectiveProduct";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePromoCode } from "@/hooks/usePromoCode";
import PromoCodeBox from "@/components/PromoCodeBox";


type ShippingId = "zasilkovna" | "ppl" | "slovensko" | "osobni";
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
  { id: "slovensko", label: "Doručení na Slovensko", price: 250, hint: "Doručení na adresu, platba předem převodem" },
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
    { id: "cod", label: "Dobírka (+50 Kč)", price: 50 },
    { id: "invoice", label: "Platba na fakturu", price: 0 },
  ],
  // Slovensko: bez dobírky – přeshraniční dobírka je drahá a řeší se v EUR.
  slovensko: [
    { id: "transfer", label: "Převodem na účet", price: 0 },
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
    note: "",
  });
  const [shipping, setShipping] = useState<ShippingId | null>(null);
  const [payment, setPayment] = useState<PaymentId | null>(null);
  const [packetaPoint, setPacketaPoint] = useState<{ id: string; name: string } | null>(null);
  const [packetaReady, setPacketaReady] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [orderImageUrl, setOrderImageUrl] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<{ number: string; total: number; email: string } | null>(null);

  // Promo code – shared with Cart / B2B Checkout
  const { appliedPromo, computeDiscountGross } = usePromoCode();

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
      // E-mail: z fakturačního e-mailu profilu, jinak z přihlášeného účtu.
      email: f.email || (profile as any).invoice_email || user?.email || "",
    }));
  }, [profile, user]);

  // Přihlášený uživatel bez B2B profilu — doplň e-mail z účtu.
  useEffect(() => {
    if (!user?.email) return;
    setForm((f) => (f.email ? f : { ...f, email: user.email as string }));
  }, [user]);

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

  const freeShipping = isPartner && profile?.free_shipping === true;

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
          const pricing = getEffectiveUnitPricing(product, ov, isPartner, profile?.discount_percent);
          const code = getEffectiveProductCode(product, ov);
          return {
            code,
            name: product.name,
            color: item.color ?? null,
            qty: item.quantity,
            unitGross: pricing.unitGross,
            unitNet: pricing.unitNet,
            isB2B: pricing.isB2B,
            auto: item.meta?.auto === true,
            imageUrl: item.meta?.imageUrl ?? null,
          };
        })
        .filter((x): x is {
          code: string;
          name: string;
          color: string | null;
          qty: number;
          unitGross: number;
          unitNet: number;
          isB2B: boolean;
          auto: boolean;
          imageUrl: string | null;
        } => !!x),
    [cartItems, getOverride, isPartner, profile?.discount_percent],
  );


  const subtotalGross = orderLines.reduce((s, it) => s + it.unitGross * it.qty, 0);
  const shippingPrice = freeShipping ? 0 : (shippingOpt?.price ?? 0);
  const paymentPrice = paymentOpt?.price ?? 0;
  const preDiscountGross = subtotalGross + shippingPrice + paymentPrice;

  const discountGross = computeDiscountGross(preDiscountGross);
  const grandGross = Math.max(0, preDiscountGross - discountGross);

  const handleInput = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Load Packeta widget script once on mount.
  useEffect(() => {
    const SRC = "https://widget.packeta.com/v6/www/js/library.js";
    if (typeof window === "undefined") return;
    if ((window as any).Packeta?.Widget) {
      setPacketaReady(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => setPacketaReady(true), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () => setPacketaReady(true);
    s.onerror = () => toast.error("Nelze načíst widget Zásilkovny.");
    document.head.appendChild(s);
  }, []);

  /** Opens the official Packeta widget for pickup-point selection. */
  const openPacketaWidget = () => {
    const Packeta = (window as any).Packeta;
    if (!Packeta?.Widget?.pick) {
      toast.error("Widget Zásilkovny se ještě nenačetl, zkuste to za chvíli.");
      return;
    }
    // Packeta widget API key (Klíč API z Packeta portálu).
    const apiKey = "fa4c6404b93578af";
    Packeta.Widget.pick(
      apiKey,
      (point: { id: string | number; name: string } | null) => {
        if (!point) return;
        setPacketaPoint({ id: String(point.id), name: point.name });
      },
      { language: "cs", country: "cz" },
    );
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const orderNumber = `OBJ-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000 + 100000)}`;
      const { error } = await supabase.from("orders").insert({
        order_number: orderNumber,
        user_id: user?.id ?? null,
        is_b2b: isPartner,
        email: form.email,
        phone: form.phone || null,
        first_name: form.firstName || null,
        last_name: form.lastName || null,
        street: form.street || null,
        city: form.city || null,
        zip: form.zip || null,
        company_name: form.company || null,
        ico: form.ico || null,
        dic: form.dic || null,
        note: form.note || null,
        attachment_url: orderImageUrl || null,
        items: [...orderLines]
          .sort((a, b) =>
            a.code.localeCompare(b.code, "cs") ||
            (a.color ?? "").localeCompare(b.color ?? "", "cs"),
          )
          .map((l) => ({
            code: l.code,
            name: l.name,
            color: l.color,
            qty: l.qty,
            unit_gross: l.unitGross,
            unit_net: l.unitNet,
            line_gross: l.unitGross * l.qty,
            line_net: l.unitNet * l.qty,
            auto: l.auto,
            image_url: l.imageUrl,
          })),

        subtotal_gross: subtotalGross,
        shipping_label: shippingOpt
          ? freeShipping && shippingOpt.price > 0
            ? `${shippingOpt.label} (zdarma – B2B)`
            : shippingOpt.label
          : null,
        shipping_gross: shippingPrice,
        payment_label: paymentOpt?.label ?? null,
        payment_gross: paymentPrice,
        total_gross: grandGross,
        packeta_point: packetaPoint ? `${packetaPoint.name} (#${packetaPoint.id})` : null,
        promo_code: appliedPromo?.code ?? null,
        discount_gross: discountGross,
      } as never);
      if (error) throw error;

      // Odeslat potvrzovací e-maily (na pozadí; když selže, objednávku to nezablokuje)
      void fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order",
          order: {
            orderNumber,
            customerName: `${form.firstName} ${form.lastName}`.trim(),
            customerEmail: form.email,
            phone: form.phone || null,
            items: orderLines.map((l) => {
              const barva = l.color
                ? l.color
                    .split(/[-_]/)
                    .map((w) => (w.length <= 1 ? w.toUpperCase() + "." : w.charAt(0).toUpperCase() + w.slice(1)))
                    .join(" ")
                : "";
              return {
                name: barva ? `${l.name} – ${barva}` : l.name,
                qty: l.qty,
                price: l.unitGross,
              };
            }),
            total: grandGross,
            vat: true,
          },
        }),
      }).catch((e) => console.error("E-mail se nepodařilo odeslat:", e));

      setPlacedOrder({ number: orderNumber, total: grandGross, email: form.email });
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      toast.error("Objednávku se nepodařilo odeslat", { description: "Zkuste to prosím znovu." });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full h-14 px-4 text-base font-body bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors";
  const labelClass =
    "block text-sm font-body font-semibold text-foreground mb-1.5";

  // B2B-required validation: company + IČO
  const b2bFieldsOk = !isPartner || (form.company.trim() && form.ico.trim());
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim());

  if (placedOrder) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar isLoggedIn={isPartner} />
        <section className="pt-32 pb-32 px-6 max-w-xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-3">Děkujeme za objednávku!</h1>
          <p className="text-muted-foreground mb-6">
            Objednávka{" "}
            <span className="font-mono font-semibold text-foreground">{placedOrder.number}</span>{" "}
            byla přijata.
          </p>
          <div className="bg-card border border-border rounded-xl p-6 text-left space-y-3 mb-8">
            <p className="font-semibold text-foreground">Co bude dál?</p>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1.5">
              <li>
                Na e-mail <span className="text-foreground">{placedOrder.email}</span> vám zašleme
                potvrzení objednávky.
              </li>
              <li>
                Připravíme vám platební údaje (QR platba) a zašleme je e-mailem —{" "}
                <span className="text-foreground font-medium">prosíme vyčkejte na platbu</span>.
              </li>
              <li>Po připsání platby objednávku odešleme.</li>
            </ol>
            <p className="text-sm pt-3 border-t border-border">
              <span className="text-muted-foreground">K úhradě:</span>{" "}
              <span className="font-heading font-bold text-foreground">{fmtCZK(placedOrder.total)}</span>{" "}
              <span className="text-muted-foreground text-xs">
                (objednávka je závazná, s povinností platby)
              </span>
            </p>
          </div>
          <Button onClick={() => navigate("/")}>Zpět na úvod</Button>
        </section>
        <Footer />
      </main>
    );
  }

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

        <span className="text-xs font-body font-semibold tracking-[0.28em] uppercase text-primary">
          Krok 2 ze 2
        </span>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-foreground mt-1 mb-2">
          Pokladna
        </h1>
        <p className="font-body text-base text-muted-foreground mb-6">
          Vyplňte údaje, vyberte dopravu a platbu. Zabere to jen chvilku.
        </p>

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
              <h2 className="font-heading text-xl font-bold text-foreground mb-5">
                {isPartner ? "Kontaktní osoba" : "1. Vaše údaje"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="email" className={labelClass}>E-mail *</label>
                  <input id="email" type="email" required placeholder="vas@email.cz" value={form.email} onChange={(e) => handleInput("email", e.target.value)} className={inputClass} />
                  {!emailOk && (
                    <p className="mt-1.5 text-sm text-destructive">
                      {form.email.trim()
                        ? "E-mail nemá správný tvar."
                        : "E-mail je povinný — pošleme na něj potvrzení objednávky."}
                    </p>
                  )}
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
              <h2 className="font-heading text-xl font-bold text-foreground mb-5">2. Doprava</h2>
              {freeShipping && (
                <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/30 text-sm font-body text-primary font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Doprava zdarma (B2B Partner) — všechny způsoby dopravy máte za 0 Kč.
                </div>
              )}
              <div className="space-y-3">
                {SHIPPING_OPTIONS.map((opt) => {
                  const effectivePrice = freeShipping ? 0 : opt.price;
                  const wasFree = freeShipping && opt.price > 0;
                  return (
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
                        {wasFree && (
                          <span className="ml-2 inline-block text-[10px] uppercase tracking-wider font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded">
                            Zdarma · B2B
                          </span>
                        )}
                      </span>
                      <span className="font-heading text-base font-bold text-foreground">
                        {effectivePrice === 0 ? (
                          <span className="text-primary">
                            Zdarma
                            {wasFree && (
                              <span className="ml-1.5 text-xs text-muted-foreground line-through font-normal">
                                {fmtCZK(opt.price)}
                              </span>
                            )}
                          </span>
                        ) : (
                          fmtCZK(effectivePrice)
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>

              {shipping === "zasilkovna" && (
                <div className="mt-4 p-4 rounded-xl border border-dashed border-border bg-muted/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div className="text-sm font-body">
                        <p className="font-semibold text-foreground">Výdejní místo Zásilkovna</p>
                        {packetaPoint ? (
                          <p className="text-foreground">
                            <span className="font-semibold text-primary">{packetaPoint.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground font-mono">
                              #{packetaPoint.id}
                            </span>
                          </p>
                        ) : (
                          <p className="text-muted-foreground">Zatím nevybráno</p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openPacketaWidget}
                      disabled={!packetaReady}
                    >
                      {packetaPoint ? "Změnit" : "Vybrat výdejní místo"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment */}
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-5">3. Platba</h2>
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
            {/* Poznámka k objednávce */}
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-3">
                4. Poznámka k objednávce
              </h2>
              <Textarea
                id="order-note"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Cokoli, co potřebujeme vědět – přání k dopravě, barevná varianta na míru, termín…"
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground font-body mt-2">
                Nepovinné. Sem napište vzkaz k objednávce.
              </p>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Přiložit obrázek k objednávce (volitelné)
                </label>
                <ImageUpload
                  value={orderImageUrl}
                  onChange={setOrderImageUrl}
                  folder="objednavka"
                  hint="Např. návrh pro kus na míru. JPG/PNG do 5 MB."
                />
              </div>
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
                  items={orderLines.map((l) => ({
                    name: `[${l.code}] ${l.name}`,
                    qty: l.qty,
                    unitGross: l.unitGross,
                    color: l.color ?? undefined,
                  }))}
                  shippingGross={shippingPrice}
                  paymentGross={paymentPrice}
                  shippingLabel={shippingOpt?.label ?? "Doprava (nezvoleno)"}
                  paymentLabel={paymentOpt?.label ?? "Platba (nezvoleno)"}
                  discountGross={discountGross}
                  discountLabel={appliedPromo ? `Sleva (Kód: ${appliedPromo.code})` : "Sleva"}
                />


                {/* Promo code */}
                <PromoCodeBox className="border border-border rounded-lg p-4 bg-muted/20" compact />


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

                {/* Legally required pre-button total (EU 2026 directive).
                    Must appear DIRECTLY above the order button with no
                    intervening text, links, or checkboxes. */}
                <div className="flex items-baseline justify-between border-t-2 border-foreground/15 pt-4">
                  <span className="font-heading text-base md:text-lg font-bold text-foreground">
                    Celkem k úhradě:
                  </span>
                  <span className="font-heading text-2xl md:text-3xl font-bold text-foreground tabular-nums">
                    {fmtCZK(grandGross)} <span className="text-sm font-body font-semibold text-muted-foreground">s DPH</span>
                  </span>
                </div>

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
                    !b2bFieldsOk ||
                    !emailOk
                  }
                  className="w-full h-16 text-base md:text-lg font-extrabold rounded-full tracking-wide gap-2 px-4 text-center bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  ) : (
                    <Lock className="w-5 h-5 shrink-0" />
                  )}
                  <span>
                    {submitting ? "Odesílám…" : "Závazně objednat a zaplatit"}
                  </span>
                </Button>

                {!submitting &&
                  (orderLines.length === 0 ||
                    (shipping === "zasilkovna" && !packetaPoint) ||
                    !emailOk ||
                    !b2bFieldsOk ||
                    !termsAccepted) && (
                    <p className="mt-3 text-center text-sm font-semibold text-destructive">
                      {orderLines.length === 0
                        ? "Košík je prázdný."
                        : shipping === "zasilkovna" && !packetaPoint
                          ? "Nejprve vyberte výdejní místo Zásilkovny (tlačítko „Vybrat výdejní místo“ výše)."
                          : !emailOk
                            ? "Doplňte prosím platný e-mail — pošleme na něj potvrzení objednávky."
                            : !b2bFieldsOk
                            ? "Doplňte prosím firemní údaje (název firmy a IČO)."
                            : "Zaškrtněte prosím souhlas s obchodními podmínkami."}
                    </p>
                  )}
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
