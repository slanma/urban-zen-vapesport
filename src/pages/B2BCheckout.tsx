import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ShoppingCart, Truck, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProductById } from "@/data/products";
import { fmtCZK, netFromGross, vatOfGross } from "@/lib/vat";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

interface B2BCheckoutItem {
  productId: string;
  sku: string;
  name: string;
  qty: number;
  unitPrice: number; // gross with VAT (B2B price)
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
  osobni: ["hotove", "prevodem"],
  ppl: ["prevodem", "faktura"],
  slovensko: ["prevodem", "faktura"],
  zasilkovna: ["prevodem", "faktura"],
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
  const [payload, setPayload] = useState<B2BCheckoutPayload | null>(null);
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState<ShippingId>("osobni");
  const [payment, setPayment] = useState<PaymentId>("prevodem");
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
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

  const itemsSubtotalGross = useMemo(
    () => (payload?.items ?? []).reduce((s, i) => s + i.unitPrice * i.qty, 0),
    [payload]
  );

  const shippingOpt = SHIPPING_OPTIONS.find((s) => s.id === shipping)!;
  const totalGross = itemsSubtotalGross + shippingOpt.price;
  const totalNet = netFromGross(totalGross);
  const totalVat = vatOfGross(totalGross);

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
      items: payload.items.map((i) => ({
        product_id: i.productId,
        sku: i.sku,
        name: i.name,
        qty: i.qty,
        unit_price: i.unitPrice,
        line_total: i.unitPrice * i.qty,
      })),
      subtotal_gross: Math.round(itemsSubtotalGross),
      shipping_label: shippingOpt.label,
      shipping_gross: shippingOpt.price,
      payment_label: PAYMENT_LABELS[payment],
      payment_gross: 0,
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
      sessionStorage.removeItem(STORAGE_KEY);
      toast.success("Objednávka byla odeslána", { description: `Číslo: ${orderNumber}` });
      navigate("/b2b-dashboard", { replace: true });
    } catch (error) {
      console.error("[B2BCheckout] submit failed:", error);
      toast.error("Objednávku se nepodařilo odeslat", {
        description: error instanceof Error ? error.message : "Zkuste to prosím znovu.",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
                  Zkontrolujte zboží před pokračováním. Ceny jsou se slevou {payload.discountLabel}.
                </p>
                <ul className="divide-y divide-border">
                  {payload.items.map((item) => {
                    const product = getProductById(item.productId);
                    return (
                      <li key={item.productId} className="py-4 flex items-center gap-4">
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
                          <p className="text-base font-semibold text-foreground">{item.qty} × {fmtCZK(item.unitPrice)}</p>
                          <p className="text-base font-bold text-primary">{fmtCZK(item.unitPrice * item.qty)}</p>
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
                <div className="space-y-3 mb-8">
                  {SHIPPING_OPTIONS.map((opt) => (
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
                        {opt.label} – {opt.price === 0 ? "0 Kč" : fmtCZK(opt.price)}
                      </span>
                    </label>
                  ))}
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
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h1 className="text-2xl font-heading font-bold text-primary mb-6">Dokončení objednávky</h1>

                <div className="space-y-4 text-base text-foreground mb-6">
                  <div className="flex justify-between"><span>Zboží</span><strong>{fmtCZK(itemsSubtotalGross)}</strong></div>
                  <div className="flex justify-between"><span>Způsob dopravy – <strong>{shippingOpt.label}</strong></span><strong>{shippingOpt.price === 0 ? "Zdarma" : fmtCZK(shippingOpt.price)}</strong></div>
                  <div className="flex justify-between"><span>Způsob platby – <strong>{PAYMENT_LABELS[payment]}</strong></span><strong>Zdarma</strong></div>
                  <div className="flex justify-between text-lg border-t border-border pt-3"><span className="font-bold text-primary">K úhradě</span><span className="font-bold text-primary">{fmtCZK(totalGross)}</span></div>
                  <div className="flex justify-between text-sm text-muted-foreground"><span>Cena bez DPH</span><span>{fmtCZK(totalNet)}</span></div>
                  <div className="flex justify-between text-sm text-muted-foreground"><span>DPH 21 %</span><span>{fmtCZK(totalVat)}</span></div>
                </div>

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
                <div className="text-sm text-muted-foreground">
                  Pro odeslání použijte tlačítko níže.
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
                <div className="flex justify-between"><dt>Doprava</dt><dd>{shippingOpt.price === 0 ? "Zdarma" : fmtCZK(shippingOpt.price)}</dd></div>
                <div className="flex justify-between"><dt>Platba</dt><dd>Zdarma</dd></div>
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

      {/* Legislative final block (always visible) */}
      <div className="sticky bottom-0 z-50 bg-foreground border-t-4 border-primary shadow-2xl">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-primary-foreground">
            <p className="text-sm font-semibold uppercase tracking-wider opacity-80">Celkem k úhradě</p>
            <p className="text-2xl md:text-3xl font-heading font-bold">
              {fmtCZK(totalGross)} <span className="text-base font-normal opacity-80">s DPH</span>
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={step !== 4 || submitting || !termsAccepted}
            className="h-16 px-8 text-lg font-extrabold uppercase tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 w-full sm:w-auto"
            aria-label="Závazně objednat a zaplatit"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Závazně objednat a zaplatit
          </Button>
        </div>
        {step !== 4 && (
          <p className="text-center text-xs text-primary-foreground/70 pb-2 px-4">
            Tlačítko se aktivuje v posledním kroku „Dokončení objednávky" po odsouhlasení podmínek.
          </p>
        )}
      </div>
    </div>
  );
};

export default B2BCheckout;
