import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ShoppingCart, Truck, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProductById } from "@/data/products";
import { fmtCZK, grossFromNet, vatOfGross } from "@/lib/vat";
import { useB2BPartner } from "@/hooks/useB2BPartner";
import ImageUpload from "@/components/ImageUpload";
import { usePromoCode } from "@/hooks/usePromoCode";
import PromoCodeBox from "@/components/PromoCodeBox";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

interface B2BCheckoutItem {
  productId: string;
  sku: string;
  name: string;
  qty: number;
  unitPrice: number; // NET (VOC bez DPH)
  color?: string | null;
}

interface B2BCheckoutPayload {
  items: B2BCheckoutItem[];
  discountLabel: string;
  accountLabel: string;
  email: string;
  companyName?: string | null;
  userId: string;
  accessToken: string;
}

type ShippingId = "osobni" | "ppl" | "slovensko" | "zasilkovna";
type PaymentId = "hotove" | "prevodem" | "faktura";

const SHIPPING_OPTIONS: { id: ShippingId; label: string; price: number }[] = [
  { id: "osobni", label: "Osobní odběr", price: 0 },
  { id: "ppl", label: "PPL", price: 200 },
  { id: "slovensko", label: "Slovensko", price: 300 },
  { id: "zasilkovna", label: "Zásilkovna", price: 150 },
];

const PAYMENT_MATRIX: Record<ShippingId, PaymentId[]> = {
  osobni: ["faktura"],
  ppl: ["faktura"],
  slovensko: ["faktura"],
  zasilkovna: ["faktura"],
};

const PAYMENT_LABELS: Record<PaymentId, string> = {
  hotove: "Hotově při osobním odběru",
  prevodem: "Převodem na účet",
  faktura: "Faktura – splatnost 6 dní (B2B)",
};

const STEPS = [
  { id: 1, label: "Košík", icon: ShoppingCart },
  { id: 2, label: "Doprava a platba", icon: Truck },
  { id: 3, label: "Fakturační údaje", icon: FileText },
  { id: 4, label: "Dokončení objednávky", icon: CheckCircle2 },
] as const;

const STORAGE_KEY = "vapesport_b2b_checkout";

const B2BCheckout = () => {
  const navigate = useNavigate();
  const { profile: partnerProfile } = useB2BPartner();
  const { appliedPromo, computeDiscountGross } = usePromoCode();
  const [payload, setPayload] = useState<B2BCheckoutPayload | null>(null);
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState<ShippingId>("osobni");
  const [payment, setPayment] = useState<PaymentId>("faktura");
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ number: string; email: string; total: number } | null>(null);
  const [orderImageUrl, setOrderImageUrl] = useState<string | null>(null);
  const [billing, setBilling] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    zip: "",
    country: "Česká republika",
    company: "",
    ico: "",
    dic: "",
    note: "",
  });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        navigate("/b2b-dashboard", { replace: true });
        return;
      }
      const parsed = JSON.parse(raw) as B2BCheckoutPayload;
      if (!parsed.items?.length) {
        navigate("/b2b-dashboard", { replace: true });
        return;
      }
      setPayload(parsed);
      setBilling((b) => ({
        ...b,
        email: parsed.email || b.email,
        company: parsed.companyName || b.company,
      }));
    } catch {
      navigate("/b2b-dashboard", { replace: true });
    }
  }, [navigate]);

  // Předvyplnění z profilu partnera (jen prázdná pole – nepřepisuje, co už je vyplněné).
  // Co partner v profilu nemá (např. IČO), zůstane prázdné k vyplnění.
  useEffect(() => {
    if (!partnerProfile) return;
    const contact = (partnerProfile.contact_person ?? "").trim();
    const firstFromContact = contact.split(" ")[0] ?? "";
    const restFromContact = contact.split(" ").slice(1).join(" ");
    setBilling((b) => ({
      ...b,
      company: b.company || partnerProfile.company_name || "",
      ico: b.ico || partnerProfile.ico || "",
      dic: b.dic || partnerProfile.dic || "",
      phone: b.phone || partnerProfile.phone || "",
      street: b.street || partnerProfile.address || "",
      city: b.city || partnerProfile.city || "",
      zip: b.zip || partnerProfile.zip || "",
      firstName: b.firstName || firstFromContact,
      lastName: b.lastName || restFromContact,
    }));
  }, [partnerProfile]);

  // Items are stored as NET (VOC bez DPH). Compute gross with VAT.
  const itemsSubtotalNet = useMemo(
    () => (payload?.items ?? []).reduce((s, i) => s + i.unitPrice * i.qty, 0),
    [payload]
  );
  const itemsSubtotalGross = useMemo(
    () => (payload?.items ?? []).reduce((s, i) => s + grossFromNet(i.unitPrice) * i.qty, 0),
    [payload]
  );

  const shippingOpt = SHIPPING_OPTIONS.find((s) => s.id === shipping)!;
  // Doprava zdarma se uplatní POUZE pokud je v administraci nastavena na profilu B2B partnera.
  const freeShipping = partnerProfile?.free_shipping === true;
  const shippingPrice = freeShipping ? 0 : shippingOpt.price;

  const preDiscountGross = itemsSubtotalGross + shippingPrice;
  const discountGross = computeDiscountGross(preDiscountGross);
  const totalGross = Math.max(0, preDiscountGross - discountGross);
  const totalVat = vatOfGross(totalGross);
  const totalNet = totalGross - totalVat;

  const availablePayments = PAYMENT_MATRIX[shipping];
  useEffect(() => {
    if (!availablePayments.includes(payment)) setPayment(availablePayments[0]);
  }, [shipping, availablePayments, payment]);

  const goNext = () => setStep((s) => Math.min(4, s + 1) as typeof step);
  const goPrev = () => setStep((s) => Math.max(1, s - 1) as typeof step);

  const billingOk =
    billing.email.trim() &&
    billing.firstName.trim() &&
    billing.lastName.trim() &&
    billing.phone.trim() &&
    billing.street.trim() &&
    billing.city.trim() &&
    billing.zip.trim();

  const handleSubmit = async () => {
    if (!payload) return;
    if (!termsAccepted) {
      toast.error("Pro odeslání musíte odsouhlasit obchodní podmínky.");
      return;
    }
    setSubmitting(true);
    const orderNumber = `B2B-${Date.now()}`;
    const body = {
      order_number: orderNumber,
      user_id: payload.userId,
      is_b2b: true,
      email: billing.email,
      phone: billing.phone || null,
      first_name: billing.firstName || null,
      last_name: billing.lastName || null,
      street: billing.street || null,
      city: billing.city || null,
      zip: billing.zip || null,
      company_name: billing.company || payload.companyName || null,
      ico: billing.ico || null,
      dic: billing.dic || null,
      note: billing.note || null,
      attachment_url: orderImageUrl || null,
      items: payload.items.map((i) => ({
        product_id: i.productId,
        sku: i.sku,
        name: i.name,
        color: i.color ?? null,
        qty: i.qty,
        unit_price: i.unitPrice,
        line_total: i.unitPrice * i.qty,
      })),
      subtotal_gross: Math.round(itemsSubtotalGross),
      shipping_label: freeShipping && shippingOpt.price > 0
        ? `${shippingOpt.label} (zdarma – B2B)`
        : shippingOpt.label,
      shipping_gross: shippingPrice,
      payment_label: PAYMENT_LABELS[payment],
      payment_gross: 0,
      promo_code: appliedPromo?.code ?? null,
      discount_gross: discountGross,
      total_gross: Math.round(totalGross),
      status: "nova",
    };
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${payload.accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(await response.text());

      // Odeslat potvrzovací e-maily (na pozadí; když selže, objednávku to nezablokuje)
      void fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order",
          order: {
            orderNumber,
            customerName: `${billing.firstName} ${billing.lastName}`.trim(),
            customerEmail: billing.email,
            phone: billing.phone || null,
            isB2B: true,
            company: billing.company || payload.companyName || null,
            ico: billing.ico || null,
            items: payload.items.map((i) => ({
              name: i.name,
              qty: i.qty,
              price: grossFromNet(i.unitPrice),
            })),
            total: Math.round(totalGross),
            vat: true,
          },
        }),
      }).catch((e) => console.error("E-mail se nepodařilo odeslat:", e));

      sessionStorage.removeItem(STORAGE_KEY);
      setPlacedOrder({ number: orderNumber, email: billing.email, total: Math.round(totalGross) });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("[B2BCheckout] submit failed:", error);
      toast.error("Objednávku se nepodařilo odeslat", {
        description: error instanceof Error ? error.message : "Zkuste to prosím znovu.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-secondary">
        <header className="bg-background border-b border-border">
          <div className="max-w-[1200px] mx-auto flex items-center h-16 px-4 md:px-8">
            <span className="font-heading font-bold text-foreground">Vapesport <span className="text-primary text-sm align-super">B2B</span></span>
          </div>
        </header>
        <section className="pt-16 pb-24 px-6 max-w-xl mx-auto text-center">
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
                Fakturu se splatností 6 dní vám zašleme e-mailem.
              </li>
              <li>Objednávku připravíme a odešleme.</li>
            </ol>
            <p className="text-sm pt-3 border-t border-border">
              <span className="text-muted-foreground">Celkem:</span>{" "}
              <span className="font-heading font-bold text-foreground">{fmtCZK(placedOrder.total)}</span>{" "}
              <span className="text-muted-foreground text-xs">s DPH (závazná objednávka)</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/b2b-dashboard", { replace: true })}>Nová objednávka</Button>
            <Button variant="outline" onClick={() => navigate("/b2b-nastenka")}>Moje nástěnka</Button>
          </div>
        </section>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const inputClass =
    "w-full h-12 px-4 text-base bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";
  const labelClass = "block text-sm font-semibold text-foreground mb-1.5";

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <nav className="max-w-[1200px] mx-auto flex items-center justify-between h-16 px-4 md:px-8">
          <a href="/b2b-dashboard" className="font-heading text-xl font-bold text-foreground tracking-tight">
            Vapesport <span className="text-primary font-medium text-sm ml-1">B2B</span>
          </a>
          <span className="text-base text-muted-foreground hidden sm:inline">{payload.accountLabel}</span>
        </nav>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        {/* Stepper */}
        <ol className="flex items-center flex-wrap gap-2 sm:gap-4 mb-10" aria-label="Kroky objednávky">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCurrent = step === s.id;
            const isDone = step > s.id;
            return (
              <li key={s.id} className="flex items-center gap-2 sm:gap-4">
                <div
                  className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full text-sm font-semibold ${
                    isCurrent
                      ? "text-primary"
                      : isDone
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.id}.</span>
                </div>
                {i < STEPS.length - 1 && (
                  <span aria-hidden className="w-6 sm:w-10 h-px bg-border" />
                )}
              </li>
            );
          })}
        </ol>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8 bg-background border border-border rounded-lg p-6 md:p-8">
            {step === 1 && (
              <>
                <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Košík</h1>
                <p className="text-base text-muted-foreground mb-6">
                  {payload.discountLabel
                    ? `Zkontrolujte zboží před pokračováním. Ceny jsou se slevou ${payload.discountLabel}.`
                    : "Zkontrolujte zboží před pokračováním."}
                </p>
                <ul className="divide-y divide-border">
                  {payload.items.map((item, idx) => {
                    const product = getProductById(item.productId);
                    return (
                      <li key={`${item.productId}::${item.color ?? ""}::${idx}`} className="py-4 flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                          {product?.image && (
                            <img src={product.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">{item.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-semibold text-foreground">{item.qty} × {fmtCZK(item.unitPrice)} <span className="text-xs text-muted-foreground font-normal">bez DPH</span></p>
                          <p className="text-base font-bold text-primary">{fmtCZK(item.unitPrice * item.qty)} <span className="text-xs text-muted-foreground font-normal">bez DPH</span></p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="text-2xl font-heading font-bold text-primary mb-6">Způsob dopravy</h1>
                {freeShipping && (
                  <div className="mb-4 p-3 rounded-md bg-primary/10 border border-primary/30 text-sm font-semibold text-primary flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Doprava zdarma (B2B Partner) — všechny způsoby dopravy máte za 0 Kč.
                  </div>
                )}
                <div className="space-y-3 mb-8">
                  {SHIPPING_OPTIONS.map((opt) => {
                    const effectivePrice = freeShipping ? 0 : opt.price;
                    const wasFree = freeShipping && opt.price > 0;
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-4 p-4 rounded-md border cursor-pointer transition-all ${
                          shipping === opt.id ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:border-primary/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          checked={shipping === opt.id}
                          onChange={() => setShipping(opt.id)}
                          className="w-5 h-5 accent-[hsl(var(--primary))]"
                        />
                        <span className="flex-1 text-base text-foreground">
                          {opt.label} –{" "}
                          {wasFree ? (
                            <>
                              <span className="line-through text-muted-foreground mr-1">{fmtCZK(opt.price)}</span>
                              <span className="font-bold text-primary">Zdarma</span>
                            </>
                          ) : effectivePrice === 0 ? (
                            "0 Kč"
                          ) : (
                            fmtCZK(effectivePrice)
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <h2 className="text-2xl font-heading font-bold text-primary mb-6">Způsob platby</h2>
                <div className="space-y-3">
                  {availablePayments.map((p) => (
                    <label
                      key={p}
                      className={`flex items-center gap-4 p-4 rounded-md border cursor-pointer transition-all ${
                        payment === p ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={payment === p}
                        onChange={() => setPayment(p)}
                        className="w-5 h-5 accent-[hsl(var(--primary))]"
                      />
                      <span className="flex-1 text-base text-foreground">{PAYMENT_LABELS[p]} – 0 Kč</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="text-2xl font-heading font-bold text-primary mb-6">Fakturační údaje</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className={labelClass}>E-mail *</label>
                    <input id="email" type="email" value={billing.email} onChange={(e) => setBilling({ ...billing, email: e.target.value })} className={inputClass} required />
                  </div>
                  <div>
                    <label htmlFor="firstName" className={labelClass}>Jméno *</label>
                    <input id="firstName" type="text" value={billing.firstName} onChange={(e) => setBilling({ ...billing, firstName: e.target.value })} className={inputClass} required />
                  </div>
                  <div>
                    <label htmlFor="lastName" className={labelClass}>Příjmení *</label>
                    <input id="lastName" type="text" value={billing.lastName} onChange={(e) => setBilling({ ...billing, lastName: e.target.value })} className={inputClass} required />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className={labelClass}>Telefon *</label>
                    <input id="phone" type="tel" value={billing.phone} onChange={(e) => setBilling({ ...billing, phone: e.target.value })} className={inputClass} required />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="street" className={labelClass}>Ulice a číslo popisné *</label>
                    <input id="street" type="text" value={billing.street} onChange={(e) => setBilling({ ...billing, street: e.target.value })} className={inputClass} required />
                  </div>
                  <div>
                    <label htmlFor="city" className={labelClass}>Město nebo obec *</label>
                    <input id="city" type="text" value={billing.city} onChange={(e) => setBilling({ ...billing, city: e.target.value })} className={inputClass} required />
                  </div>
                  <div>
                    <label htmlFor="zip" className={labelClass}>PSČ *</label>
                    <input id="zip" type="text" inputMode="numeric" value={billing.zip} onChange={(e) => setBilling({ ...billing, zip: e.target.value })} className={inputClass} required />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="country" className={labelClass}>Stát</label>
                    <input id="country" type="text" value={billing.country} onChange={(e) => setBilling({ ...billing, country: e.target.value })} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2 pt-4 border-t border-border">
                    <label htmlFor="company" className={labelClass}>Název firmy</label>
                    <input id="company" type="text" value={billing.company} onChange={(e) => setBilling({ ...billing, company: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="ico" className={labelClass}>IČO</label>
                    <input id="ico" type="text" value={billing.ico} onChange={(e) => setBilling({ ...billing, ico: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="dic" className={labelClass}>DIČ</label>
                    <input id="dic" type="text" placeholder="CZ…" value={billing.dic} onChange={(e) => setBilling({ ...billing, dic: e.target.value })} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2 pt-4 border-t border-border">
                    <label htmlFor="note" className={labelClass}>Poznámka k objednávce</label>
                    <textarea
                      id="note"
                      rows={3}
                      value={billing.note}
                      onChange={(e) => setBilling({ ...billing, note: e.target.value })}
                      placeholder="Vzkaz k objednávce – přání, termín, upřesnění…"
                      className="w-full px-4 py-3 text-base bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Přiložit obrázek (volitelné)</label>
                    <ImageUpload
                      value={orderImageUrl}
                      onChange={setOrderImageUrl}
                      folder="objednavka-b2b"
                      hint="Např. návrh pro kus na míru. JPG/PNG do 5 MB."
                    />
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h1 className="text-2xl font-heading font-bold text-primary mb-6">Dokončení objednávky</h1>

                <div className="space-y-4 text-base text-foreground mb-6">
                  <div className="flex justify-between"><span>Zboží</span><strong>{fmtCZK(itemsSubtotalGross)}</strong></div>
                  <div className="flex justify-between">
                    <span>Způsob dopravy – <strong>{shippingOpt.label}</strong></span>
                    <strong>
                      {freeShipping && shippingOpt.price > 0 ? (
                        <>
                          <span className="line-through text-muted-foreground mr-2 font-normal">{fmtCZK(shippingOpt.price)}</span>
                          Zdarma
                        </>
                      ) : shippingPrice === 0 ? "Zdarma" : fmtCZK(shippingPrice)}
                    </strong>
                  </div>
                  <div className="flex justify-between"><span>Způsob platby – <strong>{PAYMENT_LABELS[payment]}</strong></span><strong>Zdarma</strong></div>
                  {appliedPromo && discountGross > 0 && (
                    <div className="flex justify-between text-primary"><span>Sleva (Kód: {appliedPromo.code})</span><strong>−{fmtCZK(discountGross)}</strong></div>
                  )}
                  <div className="flex justify-between text-lg border-t border-border pt-3"><span className="font-bold text-primary">K úhradě</span><span className="font-bold text-primary">{fmtCZK(totalGross)}</span></div>
                  <div className="flex justify-between text-sm text-muted-foreground"><span>Cena bez DPH</span><span>{fmtCZK(totalNet)}</span></div>
                  <div className="flex justify-between text-sm text-muted-foreground"><span>DPH 21 %</span><span>{fmtCZK(totalVat)}</span></div>
                </div>

                <PromoCodeBox className="mb-6" />


                <label className="flex items-start gap-3 p-4 bg-muted/40 border border-border rounded-md cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-5 h-5 accent-[hsl(var(--primary))]"
                  />
                  <span className="text-sm text-foreground">
                    Závazně objednávám vybrané zboží ve zvoleném množství a souhlasím s celkovou vypočtenou cenou od dodavatele a výslovně prohlašuji, že odesláním tohoto formuláře souhlasím se Všeobecnými obchodními podmínkami a se zpracováním a uchováním veškerých mých osobních údajů.
                  </span>
                </label>
              </>
            )}

            {/* Step nav */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={step === 1 ? () => navigate("/b2b-dashboard") : goPrev}
                className="h-12 px-5 text-base gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Zpět
              </Button>
              {step < 4 ? (
                <Button
                  onClick={goNext}
                  disabled={step === 3 && !billingOk}
                  className="h-12 px-6 text-base font-bold"
                >
                  {step === 1 ? "Pokračovat k dopravě" : step === 2 ? "Pokračovat k fakturaci" : "Pokračovat k souhrnu"}
                </Button>
              ) : (
                <div className="flex flex-col items-stretch sm:items-end gap-2">
                  <div className="sm:text-right">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Celkem k úhradě
                    </span>
                    <span className="font-heading text-2xl font-bold text-foreground">
                      {fmtCZK(totalGross)} <span className="text-sm font-normal text-muted-foreground">s DPH</span>
                    </span>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={submitting || !termsAccepted}
                    className="h-14 px-8 text-base font-extrabold uppercase tracking-wide gap-2 disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    Závazně objednat
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Sticky summary */}
          <aside className="lg:col-span-4">
            <div className="bg-background border border-border rounded-lg p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-heading font-bold text-foreground mb-4">Souhrn</h2>
              <dl className="space-y-2 text-base text-foreground">
                <div className="flex justify-between"><dt>Zboží ({payload.items.reduce((s, i) => s + i.qty, 0)} ks)</dt><dd>{fmtCZK(itemsSubtotalGross)}</dd></div>
                <div className="flex justify-between">
                  <dt>Doprava</dt>
                  <dd>
                    {freeShipping && shippingOpt.price > 0 ? (
                      <span className="text-primary font-semibold">Zdarma (B2B)</span>
                    ) : shippingPrice === 0 ? "Zdarma" : fmtCZK(shippingPrice)}
                  </dd>
                </div>
                <div className="flex justify-between"><dt>Platba</dt><dd>Zdarma</dd></div>
                {appliedPromo && discountGross > 0 && (
                  <div className="flex justify-between text-primary"><dt>Sleva ({appliedPromo.code})</dt><dd>−{fmtCZK(discountGross)}</dd></div>
                )}
                <div className="flex justify-between border-t border-border pt-3 mt-3">
                  <dt className="font-bold text-foreground">Cena bez DPH</dt>
                  <dd className="font-semibold">{fmtCZK(totalNet)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">DPH 21 %</dt>
                  <dd className="text-muted-foreground">{fmtCZK(totalVat)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </main>

    </div>
  );
};

export default B2BCheckout;
