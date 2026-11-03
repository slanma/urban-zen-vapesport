import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Send, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUpload from "@/components/ImageUpload";
import { fmtCZK, netFromGross } from "@/lib/vat";
import {
  BLACK,
  CUSTOM_BAG_BASE_PRICE,
  EXTRAS,
  FRAME_SHAPES,
  MATERIAL_GROUPS,
  PLACES,
  POCKETS,
  STIFFENER,
  VELCRO,
  ZIP_COLORED_EXTRA,
  ZIP_COLORED_ID,
  ZIP_COLORS,
  ZIP_PLAIN,
  ZIP_WATERPROOF,
  type Choice,
  type Swatch,
} from "@/data/customBag";

/**
 * Konfigurátor brašny na míru.
 *
 * Neposílá do košíku — konečnou cenu potvrzujeme po konzultaci a podle
 * rozměrů. Odchází jako poptávka přes /api/poptavka, takže se objeví
 * v Admin → Poptávky a přijde e-mail na info@vapesport.cz (stejné
 * potrubí jako návlek na míru).
 */

interface Props {
  basePrice?: number;
  productName: string;
}

const priceLabel = (extra: number) => (extra > 0 ? `+${fmtCZK(extra)}` : "v ceně");

/* ---------- drobné stavební kameny ---------- */

const Step = ({ n, title, hint, children }: { n: number; title: string; hint?: string; children: ReactNode }) => (
  <section className="border-t border-border pt-5">
    <div className="flex items-baseline gap-3">
      <span className="font-heading text-xs font-bold text-muted-foreground tabular-nums">{String(n).padStart(2, "0")}</span>
      <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">{title}</h3>
    </div>
    {hint && <p className="font-body text-xs text-muted-foreground mt-1 ml-8">{hint}</p>}
    <div className="mt-3 ml-8">{children}</div>
  </section>
);

const Pill = ({
  active,
  onClick,
  children,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  sub?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`text-left rounded-lg border px-3 py-2 transition-colors ${
      active ? "border-primary bg-primary/10" : "border-border bg-background hover:border-foreground/40"
    }`}
  >
    <span className="block font-body text-sm font-medium text-foreground">{children}</span>
    {sub && <span className="block font-body text-[11px] text-muted-foreground">{sub}</span>}
  </button>
);

const ChoiceRow = ({ items, value, onChange }: { items: Choice[]; value: string; onChange: (id: string) => void }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((c) => (
      <Pill key={c.id} active={value === c.id} onClick={() => onChange(c.id)} sub={c.hint ? `${priceLabel(c.extra)} · ${c.hint}` : priceLabel(c.extra)}>
        {c.label}
      </Pill>
    ))}
  </div>
);

const patternStyle = (s: Swatch): React.CSSProperties => {
  if (s.pattern === "grid")
    return { backgroundColor: s.hex, backgroundImage: "linear-gradient(rgba(255,255,255,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.35) 1px,transparent 1px)", backgroundSize: "6px 6px" };
  if (s.pattern === "grid-white")
    return { backgroundColor: s.hex, backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "7px 7px" };
  if (s.pattern === "dots")
    return { backgroundColor: s.hex, backgroundImage: "radial-gradient(rgba(255,255,255,.7) 1px,transparent 1.5px)", backgroundSize: "6px 6px" };
  return { backgroundColor: s.hex };
};

const SwatchDots = ({ items, value, onChange }: { items: Swatch[]; value: string | null; onChange: (id: string) => void }) => (
  <div className="flex flex-wrap gap-2.5">
    {items.map((s) => {
      const active = value === s.id;
      return (
        <button
          key={s.id}
          type="button"
          title={s.label}
          aria-label={s.label}
          aria-pressed={active}
          onClick={() => onChange(s.id)}
          className={`relative w-9 h-9 rounded-full border transition-transform ${
            active ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105" : "border-border hover:scale-105"
          }`}
          style={patternStyle(s)}
        >
          {active && <Check className="absolute inset-0 m-auto w-4 h-4 text-white mix-blend-difference" />}
        </button>
      );
    })}
  </div>
);

/* ---------- obrázek kola na klikání ---------- */

const BikePicker = ({ value, onChange }: { value: string; onChange: (id: string) => void }) => {
  const zone = (id: string) =>
    `cursor-pointer transition-colors ${value === id ? "fill-primary/60 stroke-primary" : "fill-primary/0 stroke-transparent hover:fill-primary/20"}`;
  return (
    <svg viewBox="0 0 320 170" className="w-full max-w-[360px] h-auto" role="group" aria-label="Vyberte místo na kole">
      {/* kola */}
      <circle cx="70" cy="120" r="42" fill="none" className="stroke-foreground/50" strokeWidth="3" />
      <circle cx="250" cy="120" r="42" fill="none" className="stroke-foreground/50" strokeWidth="3" />
      {/* rám */}
      <path d="M70 120 L135 120 L110 58 Z M135 120 L222 62 L110 58 M222 62 L250 120 M222 62 L215 40 M200 40 L230 40 M110 58 L104 44 M92 44 L118 44 M70 120 L110 58"
        fill="none" className="stroke-foreground" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {/* nosič */}
      <path d="M48 78 L112 78 M58 78 L70 120 M100 78 L95 64" fill="none" className="stroke-foreground/70" strokeWidth="2.5" strokeLinecap="round" />
      {/* klikací zóny */}
      <polygon points="118,66 214,68 140,114" className={zone("ram")} strokeWidth="2" onClick={() => onChange("ram")}>
        <title>Do rámu</title>
      </polygon>
      <rect x="128" y="46" width="70" height="14" rx="5" transform="rotate(2 163 53)" className={zone("horni-trubka")} strokeWidth="2" onClick={() => onChange("horni-trubka")}>
        <title>Na horní trubku</title>
      </rect>
      <rect x="44" y="64" width="72" height="14" rx="5" className={zone("nosic")} strokeWidth="2" onClick={() => onChange("nosic")}>
        <title>Na nosič</title>
      </rect>
    </svg>
  );
};

/* ---------- náhled brašny ---------- */

const BagPreview = ({ fabric, zip }: { fabric: Swatch; zip: string }) => (
  <div className="rounded-xl bg-card border border-border p-4 flex items-center justify-center">
    <svg viewBox="0 0 200 120" className="w-full max-w-[220px] h-auto" aria-hidden>
      <defs>
        <pattern id="pv-grid" width="7" height="7" patternUnits="userSpaceOnUse">
          <path d="M7 0 L0 0 0 7" fill="none" stroke={fabric.pattern === "grid-white" ? "#fff" : "rgba(255,255,255,.35)"} strokeWidth="1" />
        </pattern>
        <pattern id="pv-dots" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1" fill="rgba(255,255,255,.7)" />
        </pattern>
      </defs>
      <path d="M20 100 L180 100 L100 20 Z" fill={fabric.hex} stroke="#111" strokeWidth="2" strokeLinejoin="round" />
      {fabric.pattern && (
        <path d="M20 100 L180 100 L100 20 Z" fill={fabric.pattern === "dots" ? "url(#pv-dots)" : "url(#pv-grid)"} />
      )}
      {/* zip */}
      <path d="M34 94 L100 30 L166 94" fill="none" stroke={zip} strokeWidth="3.5" strokeLinecap="round" />
      {/* pásky */}
      <rect x="70" y="38" width="10" height="20" rx="2" fill="#1a1a1a" transform="rotate(-45 75 48)" />
      <rect x="120" y="38" width="10" height="20" rx="2" fill="#1a1a1a" transform="rotate(45 125 48)" />
    </svg>
  </div>
);

/* ---------- hlavní komponenta ---------- */

const CustomBagConfigurator = ({ basePrice = CUSTOM_BAG_BASE_PRICE, productName }: Props) => {
  const [place, setPlace] = useState("ram");
  const [shape, setShape] = useState(FRAME_SHAPES[0].id);
  const [groupId, setGroupId] = useState<string>("cerna"); // "cerna" = Klasická černá
  const [colorId, setColorId] = useState<string | null>(null);
  const [velcro, setVelcro] = useState(VELCRO[0].id);
  const [zipKind, setZipKind] = useState(ZIP_PLAIN.id);
  const [zipColor, setZipColor] = useState(ZIP_COLORS[0].id);
  const [stiffener, setStiffener] = useState(STIFFENER[0].id);
  const [pocket, setPocket] = useState(POCKETS[0].id);
  const [extras, setExtras] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", phone: "", dims: "", message: "", hp: "" });
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const group = MATERIAL_GROUPS.find((g) => g.id === groupId) ?? null;
  const fabric: Swatch = group ? group.colors.find((c) => c.id === colorId) ?? group.colors[0] : BLACK;
  const zipColored = zipKind === ZIP_COLORED_ID;
  const zipHex = zipColored ? ZIP_COLORS.find((z) => z.id === zipColor)?.hex ?? "#222" : "#2a2a2a";

  const price = useMemo(() => {
    let p = basePrice;
    if (group) p += group.extra;
    p += VELCRO.find((v) => v.id === velcro)?.extra ?? 0;
    p += zipColored ? ZIP_COLORED_EXTRA : zipKind === ZIP_WATERPROOF.id ? ZIP_WATERPROOF.extra : ZIP_PLAIN.extra;
    p += STIFFENER.find((s) => s.id === stiffener)?.extra ?? 0;
    p += POCKETS.find((k) => k.id === pocket)?.extra ?? 0;
    p += EXTRAS.filter((e) => extras.includes(e.id)).reduce((s, e) => s + e.extra, 0);
    return p;
  }, [basePrice, group, velcro, zipKind, zipColored, stiffener, pocket, extras]);

  const summary: [string, string][] = [
    ["Umístění", PLACES.find((p) => p.id === place)?.label ?? ""],
    ...(place === "ram" ? ([["Tvar", FRAME_SHAPES.find((s) => s.id === shape)?.label ?? ""]] as [string, string][]) : []),
    ["Materiál", group ? `${group.label} – ${fabric.label}` : BLACK.label],
    ["Suchý zip", VELCRO.find((v) => v.id === velcro)?.label ?? ""],
    [
      "Zip",
      zipColored
        ? `Barevný – ${ZIP_COLORS.find((z) => z.id === zipColor)?.label}`
        : zipKind === ZIP_WATERPROOF.id
          ? ZIP_WATERPROOF.label
          : ZIP_PLAIN.label,
    ],
    ["Výztuha", STIFFENER.find((s) => s.id === stiffener)?.label ?? ""],
    ["Kapsy", POCKETS.find((k) => k.id === pocket)?.label ?? ""],
    ["Doplňky", EXTRAS.filter((e) => extras.includes(e.id)).map((e) => e.label).join(", ") || "žádné"],
  ];

  const toggleExtra = (id: string) =>
    setExtras((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setErr("");
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErr("Vyplňte prosím platný e-mail, ať se vám můžeme ozvat.");
      return;
    }
    if (!consent) {
      setErr("Pro odeslání je potřeba souhlas se zpracováním údajů.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/poptavka", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          company: form.name,
          email: form.email,
          phone: form.phone,
          web: "",
          hp: form.hp,
          message: [
            `${productName} — konfigurace:`,
            ...summary.map(([k, v]) => `${k}: ${v}`),
            `Rozměry: ${form.dims || "neuvedeno"}`,
            `Obrázek: ${imageUrl || "nepřiložen"}`,
            "",
            form.message,
          ]
            .join("\n")
            .trim(),
          services: [
            { name: productName, price: `od ${fmtCZK(price)} s DPH` },
            ...summary.map(([k, v]) => ({ name: `${k}: ${v}`, price: "" })),
          ],
          price_once: Math.round(netFromGross(price)),
          price_month: 0,
          has_custom: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Odeslání selhalo");
      setSent(true);
    } catch (e: any) {
      setErr(e?.message || "Odeslání se nepodařilo. Zkuste to prosím znovu.");
    } finally {
      setSending(false);
    }
  };

  const field =
    "w-full rounded-md border border-border bg-background px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

  if (sent) {
    return (
      <div className="mt-6 rounded-lg border border-primary/40 bg-primary/10 p-5">
        <p className="font-heading text-base font-bold text-foreground flex items-center gap-2">
          <Check className="w-5 h-5 text-primary" /> Poptávka je odeslaná
        </p>
        <p className="font-body text-sm text-muted-foreground mt-2">
          Díky! Ozveme se vám na {form.email}, projdeme rozměry a potvrdíme konečnou cenu.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-5">
      <Step n={1} title="Kam chcete brašnu" hint="Klikněte na místo na kole, nebo vyberte níže.">
        <BikePicker value={place} onChange={setPlace} />
        <div className="mt-3">
          <ChoiceRow items={PLACES} value={place} onChange={setPlace} />
        </div>
        {place === "ram" && (
          <div className="mt-4">
            <p className="font-body text-xs font-semibold text-foreground mb-2">Jak velká v rámu?</p>
            <ChoiceRow items={FRAME_SHAPES} value={shape} onChange={setShape} />
          </div>
        )}
      </Step>

      <Step n={2} title="Materiál a barva" hint="Celá brašna je v jedné barvě.">
        <div className="grid sm:grid-cols-[1fr_200px] gap-4 items-start">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Pill active={!group} onClick={() => { setGroupId("cerna"); setColorId(null); }} sub="v ceně">
                {BLACK.label}
              </Pill>
              {MATERIAL_GROUPS.map((g) => (
                <Pill
                  key={g.id}
                  active={groupId === g.id}
                  onClick={() => { setGroupId(g.id); setColorId(g.colors[0].id); }}
                  sub={`${priceLabel(g.extra)} · ${g.colors.length} ${g.colors.length > 4 ? "barev" : "barvy"}`}
                >
                  {g.label}
                </Pill>
              ))}
            </div>
            {group && (
              <div>
                <SwatchDots items={group.colors} value={fabric.id} onChange={setColorId} />
                <p className="font-body text-xs text-muted-foreground mt-2">Vybráno: {fabric.label}</p>
              </div>
            )}
          </div>
          <BagPreview fabric={fabric} zip={zipHex} />
        </div>
      </Step>

      <Step n={3} title="Zip">
        <ChoiceRow
          items={[ZIP_PLAIN, ZIP_WATERPROOF, { id: ZIP_COLORED_ID, label: "Barevný", extra: ZIP_COLORED_EXTRA }]}
          value={zipKind}
          onChange={setZipKind}
        />
        {zipColored && (
          <div className="mt-3">
            <SwatchDots items={ZIP_COLORS} value={zipColor} onChange={setZipColor} />
            <p className="font-body text-xs text-muted-foreground mt-2">
              Vybráno: {ZIP_COLORS.find((z) => z.id === zipColor)?.label}
            </p>
          </div>
        )}
      </Step>

      <Step n={4} title="Suchý zip">
        <ChoiceRow items={VELCRO} value={velcro} onChange={setVelcro} />
      </Step>

      <Step n={5} title="Výztuha">
        <ChoiceRow items={STIFFENER} value={stiffener} onChange={setStiffener} />
      </Step>

      <Step n={6} title="Kapsy">
        <ChoiceRow items={POCKETS} value={pocket} onChange={setPocket} />
      </Step>

      <Step n={7} title="Doplňky" hint="Můžete vybrat víc. Cenu určíme podle rozměrů a složitosti.">
        <div className="flex flex-wrap gap-2">
          {EXTRAS.map((e) => (
            <Pill key={e.id} active={extras.includes(e.id)} onClick={() => toggleExtra(e.id)}>
              {e.label}
            </Pill>
          ))}
        </div>
      </Step>

      <Step n={8} title="Rozměry a fotka" hint="Rozměry vnitřku rámu (v cm), nebo fotka rámu s metrem. Když nevíte, nevadí, doladíme to spolu.">
        <textarea
          className={`${field} min-h-[70px]`}
          placeholder="Např. horní trubka 52 cm, spodní 58 cm, sedlová 45 cm"
          value={form.dims}
          onChange={(e) => set("dims", e.target.value)}
        />
        <div className="mt-3">
          <ImageUpload value={imageUrl} onChange={setImageUrl} folder="produkt-na-miru" hint="JPG nebo PNG, do 5 MB." />
        </div>
      </Step>

      <Step n={9} title="Kontakt">
        <div className="grid sm:grid-cols-2 gap-3">
          <input className={field} placeholder="Jméno" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <input className={field} placeholder="E-mail *" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          <input className={field} placeholder="Telefon" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <input className="hidden" tabIndex={-1} autoComplete="off" value={form.hp} onChange={(e) => set("hp", e.target.value)} aria-hidden />
        </div>
        <textarea
          className={`${field} mt-3 min-h-[70px]`}
          placeholder="Cokoli dalšího, co bychom měli vědět"
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
        />
      </Step>

      {/* souhrn */}
      <div className="rounded-lg border border-border bg-secondary/40 p-4">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-body text-xs">
          {summary.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
          <span className="font-body text-sm text-muted-foreground">Orientační cena</span>
          <span className="font-heading text-2xl font-bold text-foreground">od {fmtCZK(price)}</span>
        </div>
        <p className="font-body text-[11px] text-muted-foreground mt-1">
          s DPH · bez DPH {fmtCZK(netFromGross(price))}. Konečnou cenu potvrdíme po konzultaci podle rozměrů.
        </p>

        <label htmlFor="cb-consent" className="mt-4 flex items-start gap-3 cursor-pointer">
          <Checkbox id="cb-consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
          <span className="font-body text-xs text-muted-foreground">
            Souhlasím se zpracováním údajů kvůli vyřízení poptávky.{" "}
            <Link to="/ochrana-udaju" className="underline">Více</Link>
          </span>
        </label>

        {err && <p className="font-body text-sm text-destructive mt-3">{err}</p>}

        <Button size="lg" onClick={submit} disabled={sending} className="mt-4 w-full gap-2 text-base font-semibold rounded-full h-12">
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          Odeslat poptávku
        </Button>
      </div>
    </div>
  );
};

export default CustomBagConfigurator;
