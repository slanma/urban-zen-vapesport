import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Save, Loader2, Eye, Upload, X, Star, StarOff, Loader,
  Bold, Italic, Type, Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProductById } from "@/data/products";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { fmtCZK, netFromGross, grossFromNet, vatOfGross } from "@/lib/vat";
import { getEffectiveGallery } from "@/lib/productImages";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const IMAGE_BUCKET = "product-content";
const MAX_IMAGE_MB = 5;

/** Simplified, workshop-friendly category list. */
const CATEGORY_OPTIONS = [
  "Brašny na rám",
  "Brašny do rámu",
  "Podsedlovky",
  "Na nosič",
  "Zimní sortiment",
  "Služby",
] as const;

/**
 * Master color palette for product variants.
 * Each color toggled ON becomes a standalone variant linked to the parent
 * product. For the upcoming Google/Heureka XML feed, each active color is
 * emitted as its own <item> with:
 *   - id           = `${product.id}-${slug}`            (unique per variant)
 *   - item_group_id = product.id                        (groups variants)
 *   - color        = label                              (e.g. "Neonová žlutá")
 * Storage: `colors_override` (string[]) holds the active color slugs. A
 * missing/empty array means the product has no color variants exposed.
 */
const COLOR_PALETTE: ReadonlyArray<{ slug: string; label: string; hex: string }> = [
  { slug: "white",           label: "Bílá",              hex: "#FFFFFF" },
  { slug: "grey",            label: "Šedá",              hex: "#8A8A8A" },
  { slug: "black",           label: "Černá",             hex: "#111111" },
  { slug: "neon-green",      label: "Neonová zelená",    hex: "#39FF14" },
  { slug: "neon-yellow",     label: "Neonová žlutá",     hex: "#D7FF1A" },
  { slug: "yellow",          label: "Žlutá",             hex: "#FFD400" },
  { slug: "gold",            label: "Zlatá",             hex: "#C9A227" },
  { slug: "orange",          label: "Oranžová",          hex: "#FF8A00" },
  { slug: "neon-orange",     label: "Neonová oranžová",  hex: "#FF6A1A" },
  { slug: "red",             label: "Červená",           hex: "#D7263D" },
  { slug: "neon-red",        label: "Neonová červená",   hex: "#FF1744" },
  { slug: "pink",            label: "Růžová",            hex: "#FF4FA3" },
  { slug: "blue",            label: "Modrá",             hex: "#1E66FF" },
  { slug: "turquoise",       label: "Tyrkysová",         hex: "#1ED6C2" },
  { slug: "dark-turquoise",  label: "Tmavě tyrkysová",   hex: "#0E8C82" },
] as const;

// Feature palette is shared with the shop so the icons + tooltips shown
// to customers stay in sync with what admin toggles here.
import { PRODUCT_FEATURES } from "@/lib/productFeatures";



const AdminProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id);
  const { get, upsert, loading } = useProductOverrides();
  const [saving, setSaving] = useState(false);

  // Editable fields — minimal set
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(CATEGORY_OPTIONS[0]);
  const [price, setPrice] = useState<number>(0);
  const [b2bPrice, setB2bPrice] = useState<number | "">("");
  const [stockQty, setStockQty] = useState<number | "">("");
  const [shortDescription, setShortDescription] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const [sku, setSku] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shortDescRef = useRef<HTMLTextAreaElement>(null);
  const [dragging, setDragging] = useState(false);

  /**
   * Wrap (or unwrap) the current selection in the short-description textarea
   * with the given marker pair. If nothing is selected, the markers are
   * inserted at the cursor and the caret is placed between them.
   */
  const wrapShortDesc = (open: string, close: string) => {
    const el = shortDescRef.current;
    if (!el) return;
    const start = el.selectionStart ?? shortDescription.length;
    const end = el.selectionEnd ?? shortDescription.length;
    const before = shortDescription.slice(0, start);
    const sel = shortDescription.slice(start, end);
    const after = shortDescription.slice(end);
    // Toggle off when the selection is already wrapped.
    if (sel.startsWith(open) && sel.endsWith(close) && sel.length >= open.length + close.length) {
      const inner = sel.slice(open.length, sel.length - close.length);
      const next = before + inner + after;
      setShortDescription(next);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start, start + inner.length);
      });
      return;
    }
    const next = before + open + sel + close + after;
    setShortDescription(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + open.length + sel.length;
      el.setSelectionRange(start + open.length, caret);
    });
  };

  /**
   * Toggle a predefined feature line in the features textarea — same
   * interaction model as the color palette. Custom lines added by the
   * admin in the textarea are preserved.
   */
  const toggleFeature = (label: string) => {
    const lines = featuresText.split("\n").map((l) => l.trim());
    const idx = lines.findIndex((l) => l.toLowerCase() === label.toLowerCase());
    let next: string[];
    if (idx >= 0) {
      next = lines.filter((_, i) => i !== idx);
    } else {
      next = [...lines.filter(Boolean), label];
    }
    setFeaturesText(next.join("\n"));
  };

  const activeFeatures = new Set(
    featuresText
      .split("\n")
      .map((l) => l.trim().toLowerCase())
      .filter(Boolean),
  );


  // Two-phase init: (1) populate immediately from the shop product so the
  // form is never blank while overrides load, (2) once overrides arrive,
  // overlay any saved admin values on top. Each phase runs at most once
  // per product so in-progress local edits are never clobbered.
  const baseInitedFor = useRef<string | null>(null);
  const overrideAppliedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!product) return;

    // Phase 1 — shop values (runs immediately, doesn't wait for overrides).
    if (baseInitedFor.current !== product.id) {
      baseInitedFor.current = product.id;
      overrideAppliedFor.current = null;
      setName(product.name);
      const cat = product.categoryLabel;
      setCategory(
        (CATEGORY_OPTIONS as readonly string[]).includes(cat)
          ? cat
          : CATEGORY_OPTIONS[0],
      );
      setPrice(product.price);
      setB2bPrice("");
      setStockQty("");
      setShortDescription(product.shortDescription);
      setFeaturesText((product.features ?? []).join("\n"));
      setImages(getEffectiveGallery(product));
      setActiveColors([]);
      setSku(product.id);
    }

    // Phase 2 — overlay overrides once they have loaded.
    if (!loading && overrideAppliedFor.current !== product.id) {
      overrideAppliedFor.current = product.id;
      const o = get(product.id);
      if (o.name_override) setName(o.name_override);
      const curCat = o.category_override ?? product.categoryLabel;
      if ((CATEGORY_OPTIONS as readonly string[]).includes(curCat)) {
        setCategory(curCat);
      }
      if (o.price_override != null) setPrice(o.price_override);
      if (o.b2b_price != null) setB2bPrice(o.b2b_price);
      if (o.stock_qty != null) setStockQty(o.stock_qty);
      else if (!o.in_stock) setStockQty(0);
      if (o.short_description_override) setShortDescription(o.short_description_override);
      if (o.features_override && o.features_override.length > 0) {
        setFeaturesText(o.features_override.join("\n"));
      }
      // Gallery: prefer admin override if non-empty, otherwise keep shop images.
      const gallery = getEffectiveGallery(product, o);
      if (gallery.length > 0) setImages(gallery);
      if (Array.isArray(o.colors_override)) setActiveColors(o.colors_override);
      if (o.sku_override) setSku(o.sku_override);
    }
  }, [product, loading, get]);



  if (!product) {
    return (
      <section className="p-8">
        <Link to="/admin/produkty" className="text-sm text-primary flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Zpět na produkty
        </Link>
        <p>Produkt nenalezen.</p>
      </section>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanFeatures = featuresText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 4);
      const qty = typeof stockQty === "number" ? stockQty : null;
      await upsert(product.id, {
        sku_override: sku.trim() && sku.trim() !== product.id ? sku.trim() : null,
        name_override: name !== product.name ? name : null,
        category_override: category !== product.categoryLabel ? category : null,
        price_override: price !== product.price ? price : null,
        b2b_price: typeof b2bPrice === "number" && b2bPrice > 0 ? b2bPrice : null,
        stock_qty: qty,
        in_stock: qty == null ? true : qty > 0,
        short_description_override:
          shortDescription !== product.shortDescription ? shortDescription : null,
        features_override: cleanFeatures.length > 0 ? cleanFeatures : null,
        // images_override is persisted live by upload/remove/primary actions
      });
      toast({ title: "Změny uloženy" });
    } catch (error) {
      console.error("Product save failed", error);
      toast({
        title: "Uložení selhalo",
        description: error instanceof Error ? error.message : "Zkuste to prosím znovu.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Persist the gallery to the DB immediately. We always send the full
   * resolved list (including imported feed URLs), so that removing an
   * imported image actually clears it from the product going forward.
   * Empty array = admin explicitly removed everything.
   */
  const persistImages = async (next: string[]) => {
    if (!product) return;
    try {
      await upsert(product.id, { images_override: next });
    } catch {
      toast({ title: "Uložení galerie selhalo", variant: "destructive" });
    }
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0 || !product) return;
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of arr) {
        if (!file.type.startsWith("image/")) {
          toast({ title: `Soubor není obrázek: ${file.name}`, variant: "destructive" });
          continue;
        }
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
          toast({
            title: `Obrázek je větší než ${MAX_IMAGE_MB} MB: ${file.name}`,
            variant: "destructive",
          });
          continue;
        }
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `gallery/${product.id}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from(IMAGE_BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) {
          console.error("Upload failed", error);
          toast({ title: `Nahrání selhalo: ${file.name}`, variant: "destructive" });
          continue;
        }
        const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      if (uploaded.length > 0) {
        const next = [...images, ...uploaded];
        setImages(next);
        await persistImages(next);
        toast({
          title: `Nahráno ${uploaded.length} ${uploaded.length === 1 ? "obrázek" : "obrázků"}`,
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    setImages(next);
    await persistImages(next);
  };

  const makePrimary = async (idx: number) => {
    if (idx <= 0 || idx >= images.length) return;
    const next = [...images];
    const [pick] = next.splice(idx, 1);
    next.unshift(pick);
    setImages(next);
    await persistImages(next);
  };

  /**
   * Toggle a color variant on/off. We persist immediately (like the gallery)
   * so the admin gets instant feedback and the value survives reloads even
   * if they don't press "Uložit změny". Each color slug in this array is
   * interpreted as an independent variant by the future XML feed builder.
   */
  const toggleColor = async (slug: string) => {
    const next = activeColors.includes(slug)
      ? activeColors.filter((c) => c !== slug)
      : [...activeColors, slug];
    setActiveColors(next);
    try {
      await upsert(product.id, { colors_override: next.length > 0 ? next : null });
    } catch {
      toast({ title: "Uložení barev selhalo", variant: "destructive" });
    }
  };



  return (
    <section className="p-8 max-w-[900px]">
      <Link
        to="/admin/produkty"
        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Zpět na produkty
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Úprava produktu
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">{product.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              // Open the tab synchronously within the click gesture, otherwise
              // popup blockers cancel window.open() after the await.
              const win = window.open("about:blank", "_blank", "noopener");
              try {
                await handleSave();
                const url = `/produkt/${product.id}`;
                if (win && !win.closed) win.location.href = url;
                else window.location.assign(url);
              } catch {
                if (win && !win.closed) win.close();
              }
            }}
            disabled={saving}
            className="gap-2"
          >
            <Eye className="w-4 h-4" /> Náhled
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Uložit změny
          </Button>
        </div>
      </div>

      <article className="bg-background border border-border rounded-lg p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">Kód produktu</Label>
            <Input
              id="code"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="mt-1 font-mono text-xs"
              placeholder={product.id}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Interní ID: <span className="font-mono">{product.id}</span>
            </p>
          </div>
          <div>
            <Label htmlFor="cat">Kategorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="cat" className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="name">Název produktu</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">MOC s DPH (Kč)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
              className="mt-1"
            />
            {price > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Bez DPH: {fmtCZK(netFromGross(price))}{" "}
                <span className="opacity-70">(DPH: {fmtCZK(vatOfGross(price))})</span>
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="b2b">VOC bez DPH (Kč)</Label>
            <Input
              id="b2b"
              type="number"
              min={0}
              value={b2bPrice}
              onChange={(e) => {
                const v = e.target.value;
                setB2bPrice(v === "" ? "" : parseInt(v, 10) || 0);
              }}
              placeholder="Volitelné"
              className="mt-1"
            />
            {typeof b2bPrice === "number" && b2bPrice > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                S DPH: {fmtCZK(grossFromNet(b2bPrice))}{" "}
                <span className="opacity-70">
                  (DPH: {fmtCZK(grossFromNet(b2bPrice) - b2bPrice)})
                </span>
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="stock">Skladem (ks)</Label>
            <Input
              id="stock"
              type="number"
              min={0}
              value={stockQty}
              onChange={(e) => {
                const v = e.target.value;
                setStockQty(v === "" ? "" : Math.max(0, parseInt(v, 10) || 0));
              }}
              placeholder="Neevidováno"
              className="mt-1"
            />
          </div>
        </div>


        <div>
          <Label htmlFor="short">Krátký popis</Label>
          <div
            className="mt-1 flex items-center gap-1 rounded-t-md border border-b-0 border-border bg-muted/40 px-2 py-1"
            role="toolbar"
            aria-label="Formátování popisu"
          >
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2 gap-1"
              onClick={() => wrapShortDesc("**", "**")} title="Tučně (**text**)">
              <Bold className="w-3.5 h-3.5" />
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2 gap-1"
              onClick={() => wrapShortDesc("*", "*")} title="Kurzíva (*text*)">
              <Italic className="w-3.5 h-3.5" />
            </Button>
            <span className="mx-1 h-4 w-px bg-border" aria-hidden />
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2 gap-1"
              onClick={() => wrapShortDesc("[lg]", "[/lg]")} title="Větší písmo">
              <Type className="w-4 h-4" /> <span className="text-xs">A+</span>
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2 gap-1"
              onClick={() => wrapShortDesc("[sm]", "[/sm]")} title="Menší písmo">
              <Minus className="w-3.5 h-3.5" /> <span className="text-xs">A−</span>
            </Button>
          </div>
          <Textarea
            id="short"
            ref={shortDescRef}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            rows={3}
            maxLength={600}
            placeholder="Pro koho je produkt určen a proč ho potřebuje (2–3 věty). Označte text a klikněte na B / I / A+ / A−."
            className="rounded-t-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {shortDescription.length}/600 znaků · podporuje <code>**tučně**</code>,{" "}
            <code>*kurzíva*</code>, <code>[lg]větší[/lg]</code>, <code>[sm]menší[/sm]</code>
          </p>
        </div>

        <div>
          <Label htmlFor="features">Klíčové vlastnosti (odrážky)</Label>

          {/* Clickable palette — same UX as color variants */}
          <ul className="flex flex-wrap gap-2 mt-2 mb-3" aria-label="Předdefinované vlastnosti">
            {PRODUCT_FEATURES.map(({ label, icon: Icon, tooltip }) => {
              const active = activeFeatures.has(label.toLowerCase());
              return (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => toggleFeature(label)}
                    aria-pressed={active}
                    title={tooltip}
                    className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition ${
                      active
                        ? "border-primary bg-primary/10 text-foreground shadow-sm"
                        : "border-border bg-muted/40 text-muted-foreground opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden />
                    <span>{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <Textarea
            id="features"
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            rows={5}
            placeholder={"Jedna odrážka na řádek\nNapř. Rozměry 25 × 10 × 8 cm\nMateriál: PE 600D\nKompatibilita: rám 4–5 cm"}
            className="mt-1 font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Klikněte na chip pro rychlé přidání, nebo dopište vlastní odrážku ručně. Každý řádek = jedna odrážka.
          </p>
        </div>
      </article>


      {/* Barevné varianty */}
      <article className="bg-background border border-border rounded-lg p-6 mt-6">
        <div className="mb-4">
          <h2 className="font-heading font-bold text-foreground">Barevné varianty</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Klikněte na buňku pro přepnutí varianty (Skladem ↔ Není skladem).
            Každá aktivní barva se ve feedu vygeneruje jako samostatná položka
            navázaná na nadřazený produkt ({product.id}).
          </p>
        </div>
        <ul className="flex flex-wrap gap-2" aria-label="Barevné varianty">
          {COLOR_PALETTE.map((c) => {
            const active = activeColors.includes(c.slug);
            return (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => toggleColor(c.slug)}
                  aria-pressed={active}
                  title={active ? `${c.label} — Skladem (kliknutím vypnout)` : `${c.label} — Není skladem (kliknutím zapnout)`}
                  className={`group flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                    active
                      ? "border-primary bg-primary/10 text-foreground shadow-sm"
                      : "border-border bg-muted/40 text-muted-foreground opacity-60 hover:opacity-100"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`inline-block w-5 h-5 rounded-full border border-border ${active ? "" : "grayscale"}`}
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="font-medium">{c.label}</span>
                  <span className={`text-[10px] uppercase tracking-wide ${active ? "text-primary" : "text-muted-foreground"}`}>
                    {active ? "Skladem" : "Není skladem"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {activeColors.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Aktivní varianty: <span className="font-mono">{activeColors.join(", ")}</span>
          </p>
        )}
      </article>

      {/* Obrázky produktu */}
      <article className="bg-background border border-border rounded-lg p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-bold text-foreground">Obrázky produktu</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              První fotka je hlavní (zobrazí se v katalogu). Max {MAX_IMAGE_MB} MB / obrázek.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-1.5"
          >
            {uploading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Nahrát fotku
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
          }}
          className={`rounded-md border-2 border-dashed transition-colors p-4 ${
            dragging ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          {images.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Žádné fotky. Přetáhněte obrázky sem nebo klikněte na „Nahrát fotku".
            </p>
          ) : (
            <ul
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
              aria-label="Galerie fotek produktu"
            >
              {images.map((url, i) => (
                <li
                  key={`${url}-${i}`}
                  className="relative group aspect-square rounded-md overflow-hidden border border-border bg-muted"
                >
                  <img
                    src={url}
                    alt={`Fotka produktu ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {i === 0 && (
                    <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 bg-foreground/85 text-background text-[10px] font-semibold px-1.5 py-0.5 rounded">
                      <Star className="w-3 h-3" /> Hlavní
                    </span>
                  )}
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                    {i !== 0 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7"
                        onClick={() => makePrimary(i)}
                        aria-label="Nastavit jako hlavní"
                        title="Nastavit jako hlavní"
                      >
                        <StarOff className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7"
                      onClick={() => removeImage(i)}
                      aria-label={`Odebrat fotku ${i + 1}`}
                      title="Odebrat fotku"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>

      <div className="sticky bottom-4 mt-6 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={async () => {
            const win = window.open("about:blank", "_blank", "noopener");
            try {
              await handleSave();
              const url = `/produkt/${product.id}`;
              if (win && !win.closed) win.location.href = url;
              else window.location.assign(url);
            } catch {
              if (win && !win.closed) win.close();
            }
          }}
          disabled={saving}
          className="gap-2 shadow-lg bg-background"
        >
          <Eye className="w-4 h-4" /> Náhled
        </Button>
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2 shadow-lg">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Uložit změny
        </Button>
      </div>
    </section>
  );
};

export default AdminProductEdit;
