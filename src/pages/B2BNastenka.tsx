import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useB2BPartner } from "@/hooks/useB2BPartner";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { feedProducts } from "@/data/feedProducts";
import { fmtCZK } from "@/lib/vat";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Download, RotateCcw, Package, Award, ShoppingBag, Building2 } from "lucide-react";

/** Věrnostní slevový systém (útrata bez DPH → sleva). */
const TIERY = [
  { od: 0, sleva: 0 },
  { od: 5000, sleva: 2 },
  { od: 10001, sleva: 5 },
  { od: 25001, sleva: 7 },
  { od: 40001, sleva: 8 },
  { od: 50001, sleva: 9 },
];

const STATUS_LABELS: Record<string, string> = {
  nova: "Nová",
  zpracovava_se: "Zpracovává se",
  odeslano: "Odesláno",
  dorucena: "Doručena",
  zrusena: "Zrušena",
};

interface OrderRow {
  id: string;
  order_number: string;
  created_at: string;
  total_gross: number | null;
  status: string;
  items: unknown;
}

const brandOf = (cat: string) => (cat === "morseo-evo" ? "Morseovape" : "Vapesport");

const B2BNastenka = () => {
  const navigate = useNavigate();
  const { isPartner, profile, loading } = useB2BPartner();
  const { get } = useProductOverrides();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Firemní údaje – partner si je může sám opravit
  const [firma, setFirma] = useState({
    company_name: "", ico: "", dic: "", contact_person: "",
    phone: "", address: "", city: "", zip: "",
  });
  const [savingFirma, setSavingFirma] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFirma({
      company_name: profile.company_name ?? "",
      ico: profile.ico ?? "",
      dic: profile.dic ?? "",
      contact_person: profile.contact_person ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      city: profile.city ?? "",
      zip: profile.zip ?? "",
    });
  }, [profile]);

  const saveFirma = async () => {
    if (!profile) return;
    setSavingFirma(true);
    const { error } = await supabase
      .from("b2b_profiles")
      .update({
        company_name: firma.company_name.trim(),
        ico: firma.ico.trim(),
        dic: firma.dic.trim() || null,
        contact_person: firma.contact_person.trim(),
        phone: firma.phone.trim(),
        address: firma.address.trim(),
        city: firma.city.trim(),
        zip: firma.zip.trim(),
      })
      .eq("user_id", profile.user_id);
    setSavingFirma(false);
    if (error) toast.error("Uložení selhalo", { description: error.message });
    else toast.success("Údaje uloženy");
  };

  useEffect(() => {
    if (!profile) return;
    let active = true;
    (async () => {
      setOrdersLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("id,order_number,created_at,total_gross,status,items")
        .eq("user_id", profile.user_id)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (!error && data) setOrders(data as OrderRow[]);
      setOrdersLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [profile]);

  const obrat2025 = profile?.obrat_2025 ?? 0;
  const obrat2026 = profile?.obrat_2026 ?? 0;
  // Věrnostní úroveň se počítá z letošního obratu (2026), který zadáváš v adminu.
  const zaklad = obrat2026;
  const currentTier = useMemo(
    () => [...TIERY].reverse().find((t) => zaklad >= t.od) ?? TIERY[0],
    [zaklad],
  );
  const nextTier = useMemo(() => TIERY.find((t) => t.od > zaklad) ?? null, [zaklad]);
  const remaining = nextTier ? nextTier.od - zaklad : 0;
  const progress = nextTier
    ? Math.min(100, Math.round(((zaklad - currentTier.od) / (nextTier.od - currentTier.od)) * 100))
    : 100;

  // ---- Feed ----
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const abs = (u?: string) => (!u ? "" : u.startsWith("http") ? u : origin + u);

  const rowsForBrand = (brand: string) =>
    feedProducts
      .filter((p) => brandOf(p.category) === brand)
      .filter((p) => get(p.id).visible !== false)
      .map((p) => ({
        kod: (p.specs && (p.specs as Record<string, string>)["Kód produktu"]) || p.id,
        nazev: p.name,
        znacka: brand,
        kategorie: p.categoryLabel || p.category,
        voc_bez_dph: p.b2b_price ?? "",
        doporucena_moc: p.price ?? "",
        odkaz: `${origin}/produkt/${p.id}`,
        obrazek: abs(p.image),
      }));

  const HEADER = ["kod", "nazev", "znacka", "kategorie", "voc_bez_dph", "doporucena_moc", "odkaz", "obrazek"];

  const download = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportCSV = (brand: string) => {
    const rows = rowsForBrand(brand);
    if (!rows.length) {
      toast.error("Žádné produkty k exportu.");
      return;
    }
    const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const body = rows.map((r) => HEADER.map((h) => cell((r as Record<string, unknown>)[h])).join(";")).join("\r\n");
    const csv = "\uFEFF" + HEADER.join(";") + "\r\n" + body;
    download(`feed-${brand.toLowerCase()}.csv`, csv, "text/csv;charset=utf-8");
  };

  const exportXML = (brand: string) => {
    const rows = rowsForBrand(brand);
    if (!rows.length) {
      toast.error("Žádné produkty k exportu.");
      return;
    }
    const esc = (v: unknown) =>
      String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const items = rows
      .map(
        (r) => `  <produkt>
    <kod>${esc(r.kod)}</kod>
    <nazev>${esc(r.nazev)}</nazev>
    <znacka>${esc(r.znacka)}</znacka>
    <kategorie>${esc(r.kategorie)}</kategorie>
    <voc_bez_dph>${esc(r.voc_bez_dph)}</voc_bez_dph>
    <doporucena_moc>${esc(r.doporucena_moc)}</doporucena_moc>
    <odkaz>${esc(r.odkaz)}</odkaz>
    <obrazek>${esc(r.obrazek)}</obrazek>
  </produkt>`,
      )
      .join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<produkty znacka="${esc(brand)}">\n${items}\n</produkty>`;
    download(`feed-${brand.toLowerCase()}.xml`, xml, "application/xml;charset=utf-8");
  };

  const morseoCount = useMemo(() => rowsForBrand("Morseovape").length, [get]);
  const vapesportCount = useMemo(() => rowsForBrand("Vapesport").length, [get]);

  // ---- Zopakovat poslední objednávku ----
  const reorder = () => {
    const last = orders[0];
    const raw = (last?.items as Array<{ product_id?: string; color?: string | null; qty?: number }>) ?? [];
    const items = raw
      .filter((i) => i && i.product_id)
      .map((i) => ({ productId: i.product_id, qty: i.qty ?? 1, color: i.color ?? null }));
    if (!items.length) {
      toast.error("Poslední objednávku se nepodařilo načíst.");
      return;
    }
    sessionStorage.setItem("vapesport_b2b_prefill", JSON.stringify(items));
    navigate("/b2b-dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
          <p className="text-muted-foreground">Načítám…</p>
        </main>
      </div>
    );
  }

  if (!isPartner || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-md mx-auto px-6 pt-32 pb-20 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-3">
            B2B nástěnka
          </h1>
          <p className="text-muted-foreground mb-6">
            Tahle sekce je jen pro schválené velkoobchodní partnery.
          </p>
          <a
            href="/b2b-login"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
          >
            Přihlásit se do B2B
          </a>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar isLoggedIn />
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-body font-semibold tracking-[0.28em] uppercase text-primary">
              B2B nástěnka
            </span>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-1">
              {profile.company_name}
            </h1>
          </div>
          <Button onClick={() => navigate("/b2b-dashboard")} className="gap-2">
            <ShoppingBag className="w-4 h-4" /> Nová objednávka
          </Button>
        </div>

        {/* Přehledové dlaždice */}
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 mb-6">
          {obrat2026 > 0 && (
            <div className="rounded-2xl border border-primary/40 bg-primary/[0.04] p-6">
              <ShoppingBag className="w-5 h-5 text-primary mb-3" />
              <div className="font-heading text-2xl font-bold text-foreground">{fmtCZK(obrat2026)}</div>
              <div className="text-sm text-muted-foreground mt-1">obrat 2026 (bez DPH)</div>
            </div>
          )}
          {obrat2025 > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <ShoppingBag className="w-5 h-5 text-muted-foreground mb-3" />
              <div className="font-heading text-2xl font-bold text-foreground">{fmtCZK(obrat2025)}</div>
              <div className="text-sm text-muted-foreground mt-1">obrat 2025 (bez DPH)</div>
            </div>
          )}
          <div className="rounded-2xl border border-border bg-card p-6">
            <Award className="w-5 h-5 text-primary mb-3" />
            <div className="font-heading text-2xl font-bold text-foreground">{profile.discount_percent} %</div>
            <div className="text-sm text-muted-foreground mt-1">
              vaše aktuální sleva{profile.free_shipping ? " · doprava zdarma" : ""}
            </div>
          </div>
        </div>

        {/* Věrnostní program */}
        <section className="rounded-2xl border border-border bg-card p-6 mb-10">
          <h2 className="font-heading text-lg font-bold text-foreground mb-1">Věrnostní sleva</h2>
          {obrat2026 > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-5">
                Váš letošní obrat <strong className="text-foreground">{fmtCZK(obrat2026)}</strong> (bez DPH)
                odpovídá slevě <strong className="text-primary">{currentTier.sleva} %</strong>.
                {nextTier ? (
                  <>
                    {" "}Do slevy <strong className="text-foreground">{nextTier.sleva} %</strong> zbývá{" "}
                    <strong className="text-primary">{fmtCZK(remaining)}</strong>.
                  </>
                ) : (
                  <> Máte nejvyšší úroveň slevy. 🎉</>
                )}
              </p>
              <div className="h-3 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground mb-5">
              Sleva roste s vaším ročním obratem (bez DPH). Přehled úrovní:
            </p>
          )}
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-4">
            {TIERY.filter((t) => t.sleva > 0).map((t) => (
              <span
                key={t.od}
                className={`text-xs font-mono ${zaklad >= t.od ? "text-primary font-bold" : "text-muted-foreground"}`}
              >
                od {fmtCZK(t.od)} → {t.sleva} %
              </span>
            ))}
          </div>
        </section>

        {/* Feed ke stažení */}
        <section className="mb-10">
          <h2 className="font-heading text-lg font-bold text-foreground mb-4">Feed produktů ke stažení</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-heading font-bold text-foreground">Morseovape</h3>
              <p className="text-sm text-muted-foreground mb-4">{morseoCount} produktů</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => exportCSV("Morseovape")}>
                  <Download className="w-4 h-4" /> CSV
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => exportXML("Morseovape")}>
                  <Download className="w-4 h-4" /> XML
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-heading font-bold text-foreground">Vapesport – skladem</h3>
              <p className="text-sm text-muted-foreground mb-4">{vapesportCount} produktů (jen dostupné)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => exportCSV("Vapesport")}>
                  <Download className="w-4 h-4" /> CSV
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => exportXML("Vapesport")}>
                  <Download className="w-4 h-4" /> XML
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Vapesport feed obsahuje jen produkty označené jako dostupné. Dojezdové kusy stačí v administraci skrýt a z feedu automaticky zmizí.
          </p>
        </section>

        {/* Objednávky */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Moje objednávky
            </h2>
            {orders.length > 0 && (
              <Button variant="outline" size="sm" className="gap-2" onClick={reorder}>
                <RotateCcw className="w-4 h-4" /> Zopakovat poslední
              </Button>
            )}
          </div>
          {ordersLoading ? (
            <p className="text-muted-foreground text-sm">Načítám objednávky…</p>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">Zatím žádné objednávky.</p>
          ) : (
            <ul className="divide-y divide-border">
              {orders.map((o) => (
                <li key={o.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground text-sm">{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("cs-CZ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-secondary text-foreground mb-1">
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                    <p className="font-heading font-bold text-foreground text-sm">
                      {o.total_gross != null ? fmtCZK(o.total_gross) : "—"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Firemní údaje – partner si může opravit chybu */}
        <section className="rounded-2xl border border-border bg-card p-6 mt-6">
          <h2 className="font-heading text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Firemní údaje
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Když v údajích něco nesedí, klidně si to opravte. Slevu a obraty spravuje dodavatel.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="f-company">Název firmy</Label>
              <Input id="f-company" value={firma.company_name} onChange={(e) => setFirma({ ...firma, company_name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="f-ico">IČO</Label>
              <Input id="f-ico" value={firma.ico} onChange={(e) => setFirma({ ...firma, ico: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="f-dic">DIČ</Label>
              <Input id="f-dic" value={firma.dic} onChange={(e) => setFirma({ ...firma, dic: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="f-kontakt">Kontaktní osoba</Label>
              <Input id="f-kontakt" value={firma.contact_person} onChange={(e) => setFirma({ ...firma, contact_person: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="f-tel">Telefon</Label>
              <Input id="f-tel" value={firma.phone} onChange={(e) => setFirma({ ...firma, phone: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="f-ulice">Ulice a č.p.</Label>
              <Input id="f-ulice" value={firma.address} onChange={(e) => setFirma({ ...firma, address: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="f-mesto">Město</Label>
              <Input id="f-mesto" value={firma.city} onChange={(e) => setFirma({ ...firma, city: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="f-psc">PSČ</Label>
              <Input id="f-psc" value={firma.zip} onChange={(e) => setFirma({ ...firma, zip: e.target.value })} />
            </div>
          </div>
          <Button className="mt-5" onClick={saveFirma} disabled={savingFirma}>
            {savingFirma ? "Ukládám…" : "Uložit údaje"}
          </Button>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default B2BNastenka;
