import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Save, Youtube, Loader2, Plus, Trash2, RotateCcw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { getProductById, products, productsByBaseId, type Product } from "@/data/products";
import { useProductOverrides, type SpecRow } from "@/hooks/useProductOverrides";
import { toast } from "@/hooks/use-toast";

// Extra categories that aren't necessarily present in the feed yet but can
// be assigned manually by an admin via the category override.
const EXTRA_CATEGORIES = ["BRAŠNY DO RÁMU"] as const;

const categoryOptions = Array.from(
  new Set([...products.map((p) => p.categoryLabel), ...EXTRA_CATEGORIES]),
).sort();

const youtubeIdFromUrl = (url: string): string | null => {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
};

const embedHtml = (videoId: string) =>
  `<div class="aspect-video my-4"><iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full rounded-lg"></iframe></div>`;

const AdminProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id);
  const { get, upsert, loading } = useProductOverrides();
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [descriptionHtml, setDescriptionHtml] = useState<string>("");
  const [techParamsHtml, setTechParamsHtml] = useState<string>("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [b2bPrice, setB2bPrice] = useState<number | "">("");
  const [vat, setVat] = useState<number>(21);
  const [inStock, setInStock] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!product || loading) return;
    const o = get(product.id);
    setVisible(o.visible);
    setInStock(o.in_stock);
    setPrice(o.price_override ?? product.price);
    setB2bPrice(o.b2b_price ?? "");
    setVat(o.vat_percent);
    setDescriptionHtml(o.description_html ?? "");
    setTechParamsHtml(o.tech_params_html ?? "");
    setYoutubeUrl(o.youtube_url ?? "");
    setName(o.name_override ?? product.name);
    setCategory(o.category_override ?? product.categoryLabel);
    setShortDescription(o.short_description_override ?? product.shortDescription);
    setFeatures(o.features_override ?? [...product.features]);
    setSpecs(o.specs_override ?? product.specs.map((s) => ({ ...s })));
    setColors(o.colors_override ?? [...(product.available_colors ?? [])]);
  }, [product, loading, get]);

  const siblings = useMemo<Product[]>(() => {
    if (!product) return [];
    const base = product.baseId ?? product.id;
    const variants = productsByBaseId.get(base) ?? [];
    return variants.length > 1 ? variants : [];
  }, [product]);

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

  const insertYoutube = () => {
    if (!youtubeUrl.trim()) return;
    const vid = youtubeIdFromUrl(youtubeUrl);
    if (!vid) {
      toast({ title: "Neplatná YouTube URL", variant: "destructive" });
      return;
    }
    setDescriptionHtml((d) => `${d}\n${embedHtml(vid)}\n`.trim());
    toast({ title: "YouTube video vloženo do popisu" });
  };

  const cleanFeatures = features.map((f) => f.trim()).filter(Boolean);
  const cleanSpecs = specs
    .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
    .filter((s) => s.label || s.value);
  const cleanColors = colors.map((c) => c.trim()).filter(Boolean);

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsert(product.id, {
        visible,
        in_stock: inStock,
        price_override: price !== product.price ? price : null,
        b2b_price: typeof b2bPrice === "number" && b2bPrice > 0 ? b2bPrice : null,
        vat_percent: vat,
        description_html: descriptionHtml || null,
        tech_params_html: techParamsHtml || null,
        youtube_url: youtubeUrl || null,
        name_override: name !== product.name ? name : null,
        category_override: category !== product.categoryLabel ? category : null,
        short_description_override:
          shortDescription !== product.shortDescription ? shortDescription : null,
        features_override: cleanFeatures.length > 0 ? cleanFeatures : null,
        specs_override: cleanSpecs.length > 0 ? cleanSpecs : null,
        colors_override: cleanColors.length > 0 ? cleanColors : null,
      });
      toast({ title: "Změny uloženy" });
    } catch {
      toast({ title: "Uložení selhalo", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const resetField = async (
    field: "features" | "specs" | "colors",
  ) => {
    if (field === "features") setFeatures([...product.features]);
    if (field === "specs") setSpecs(product.specs.map((s) => ({ ...s })));
    if (field === "colors") setColors([...(product.available_colors ?? [])]);
  };

  return (
    <section className="p-8 max-w-[1100px]">
      <Link
        to="/admin/produkty"
        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Zpět na produkty
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {product.name}
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">{product.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await handleSave();
              window.open(`/produkt/${product.id}`, "_blank", "noopener");
            }}
            disabled={saving}
            className="gap-2"
            title="Uložit a otevřít náhled v novém okně"
          >
            <Eye className="w-4 h-4" /> Náhled
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Uložit změny
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Card 1: Základní informace */}
        <article className="bg-background border border-border rounded-lg p-6">
          <h2 className="font-heading font-bold text-foreground mb-4">Základní informace</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="name">Název</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="cat">Kategorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="cat" className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="short">Krátký popis</Label>
            <Textarea id="short" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="mt-1" rows={3} />
          </div>
        </article>

        {/* Card 2: Barvy */}
        <article className="bg-background border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-foreground">
              Dostupné barvy ({colors.length})
            </h2>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => resetField("colors")} className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Obnovit výchozí
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setColors((c) => [...c, ""])} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Přidat barvu
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {colors.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Žádné barvy. Produkt se zobrazí bez výběru barvy.</p>
            )}
            {colors.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={c}
                  onChange={(e) =>
                    setColors((arr) => arr.map((v, j) => (i === j ? e.target.value : v)))
                  }
                  placeholder="Např. Neon zelená"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setColors((arr) => arr.filter((_, j) => j !== i))}
                  aria-label="Odebrat barvu"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </article>

        {/* Card 3: Klíčové vlastnosti */}
        <article className="bg-background border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-foreground">
              Klíčové vlastnosti ({features.length})
            </h2>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => resetField("features")} className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Obnovit výchozí
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setFeatures((f) => [...f, ""])} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Přidat řádek
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <Textarea
                  value={f}
                  onChange={(e) =>
                    setFeatures((arr) => arr.map((v, j) => (i === j ? e.target.value : v)))
                  }
                  rows={2}
                  placeholder="Krátký bod – přínos pro zákazníka"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFeatures((arr) => arr.filter((_, j) => j !== i))}
                  aria-label="Odebrat řádek"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </article>

        {/* Card 4: Specifikace */}
        <article className="bg-background border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-foreground">
              Specifikace ({specs.length})
            </h2>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => resetField("specs")} className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Obnovit výchozí
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSpecs((s) => [...s, { label: "", value: "" }])}
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Přidat řádek
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {specs.map((s, i) => (
              <div key={i} className="grid grid-cols-[1fr_1.5fr_auto] gap-2 items-center">
                <Input
                  value={s.label}
                  onChange={(e) =>
                    setSpecs((arr) =>
                      arr.map((v, j) => (i === j ? { ...v, label: e.target.value } : v)),
                    )
                  }
                  placeholder="Parametr"
                />
                <Input
                  value={s.value}
                  onChange={(e) =>
                    setSpecs((arr) =>
                      arr.map((v, j) => (i === j ? { ...v, value: e.target.value } : v)),
                    )
                  }
                  placeholder="Hodnota"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSpecs((arr) => arr.filter((_, j) => j !== i))}
                  aria-label="Odebrat řádek"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </article>

        {/* Card 5: Hlavní popis (pod specifikací) */}
        <article className="bg-background border border-border rounded-lg p-6">
          <h2 className="font-heading font-bold text-foreground mb-1">Hlavní popis</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Zobrazí se v dolní části stránky pod specifikací. Vizuální editor — tučné, nadpisy, seznamy, zarovnání, obrázky.
          </p>
          <RichTextEditor
            value={descriptionHtml}
            onChange={setDescriptionHtml}
            placeholder="Popis produktu…"
            minHeight={260}
          />
          <div className="flex items-end gap-2 mt-3">
            <div className="flex-1">
              <Label htmlFor="yt" className="text-xs">YouTube URL</Label>
              <Input
                id="yt"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=…"
                className="mt-1"
              />
            </div>
            <Button type="button" variant="outline" onClick={insertYoutube} className="gap-1.5">
              <Youtube className="w-4 h-4" /> Vložit do popisu
            </Button>
          </div>
        </article>

        {/* Card 6: Technické parametry */}
        <article className="bg-background border border-border rounded-lg p-6">
          <h2 className="font-heading font-bold text-foreground mb-1">Technické parametry</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Volitelný blok zobrazený úplně dole pod hlavním popisem. Vizuální editor s formátováním.
          </p>
          <RichTextEditor
            value={techParamsHtml}
            onChange={setTechParamsHtml}
            placeholder="Materiál, hmotnost, rozměry…"
            minHeight={180}
          />
        </article>

        {/* Card 7: Cena a dostupnost */}
        <article className="bg-background border border-border rounded-lg p-6">
          <h2 className="font-heading font-bold text-foreground mb-4">Cena a dostupnost</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="price">Cena (Kč)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
                className="mt-1"
              />
              {price !== product.price && (
                <p className="text-xs text-primary mt-1">
                  Přepsáno (původní: {product.price.toLocaleString("cs-CZ")} Kč)
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="vat">DPH (%)</Label>
              <Select value={String(vat)} onValueChange={(v) => setVat(parseInt(v, 10))}>
                <SelectTrigger id="vat" className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 %</SelectItem>
                  <SelectItem value="12">12 %</SelectItem>
                  <SelectItem value="15">15 %</SelectItem>
                  <SelectItem value="21">21 %</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between bg-muted/40 rounded-md px-4 py-2.5">
              <Label htmlFor="stock" className="cursor-pointer">Skladem</Label>
              <Switch id="stock" checked={inStock} onCheckedChange={setInStock} />
            </div>
          </div>
          <div className="mt-6 rounded-md border border-dashed border-primary/40 bg-primary/5 p-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-heading font-semibold text-foreground">VOC cena – B2B</h3>
              <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                Pouze pro přihlášené partnery
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Zobrazí se pouze přihlášeným B2B partnerům. Běžným zákazníkům se zobrazuje standardní cena výše.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="b2b_price">VOC cena bez DPH (Kč)</Label>
                <Input
                  id="b2b_price"
                  type="number"
                  min={0}
                  value={b2bPrice}
                  onChange={(e) => {
                    const v = e.target.value;
                    setB2bPrice(v === "" ? "" : parseInt(v, 10) || 0);
                  }}
                  placeholder="Nezadáno – použije se běžná cena"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>DPH (%)</Label>
                <div className="mt-1 h-10 px-3 flex items-center rounded-md border border-input bg-muted/40 text-sm text-muted-foreground">
                  {vat} % <span className="ml-2 text-xs">(převzato z hlavní ceny)</span>
                </div>
              </div>
              <div>
                <Label>Cena s DPH</Label>
                <div className="mt-1 h-10 px-3 flex items-center rounded-md border border-input bg-background text-sm font-semibold text-foreground">
                  {typeof b2bPrice === "number" && b2bPrice > 0
                    ? `${Math.round(b2bPrice * (1 + vat / 100)).toLocaleString("cs-CZ")} Kč`
                    : "—"}
                </div>
              </div>
            </div>
            {typeof b2bPrice === "number" && b2bPrice > 0 && (
              <div className="flex items-center justify-between mt-3">
                {price > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Úspora oproti běžné ceně:{" "}
                    <span className="text-primary font-semibold">
                      {Math.max(0, Math.round((1 - b2bPrice / price) * 100))} %
                    </span>{" "}
                    ({(price - b2bPrice).toLocaleString("cs-CZ")} Kč)
                  </p>
                ) : <span />}
                <Button type="button" variant="ghost" size="sm" onClick={() => setB2bPrice("")}>
                  Vymazat VOC cenu
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between bg-muted/40 rounded-md px-4 py-2.5 max-w-xs">
            <Label htmlFor="visible" className="cursor-pointer">Viditelné v e-shopu</Label>
            <Switch id="visible" checked={visible} onCheckedChange={setVisible} />
          </div>
        </article>
        </article>

        {/* Card 8: Varianty */}
        {siblings.length > 0 && (
          <article className="bg-background border border-border rounded-lg p-6">
            <h2 className="font-heading font-bold text-foreground mb-4">
              Varianty barev ({siblings.length})
            </h2>
            <div className="space-y-2">
              {siblings.map((v) => (
                <VariantRow key={v.id} variant={v} />
              ))}
            </div>
          </article>
        )}

        <div className="sticky bottom-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={async () => {
              await handleSave();
              window.open(`/produkt/${product.id}`, "_blank", "noopener");
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
      </div>
    </section>
  );
};

const VariantRow = ({ variant }: { variant: Product }) => {
  const { get, upsert } = useProductOverrides();
  const o = get(variant.id);
  const [price, setPrice] = useState<number>(o.price_override ?? variant.price);

  useEffect(() => {
    setPrice(o.price_override ?? variant.price);
  }, [o.price_override, variant.price]);

  const commit = async (val: number) => {
    if (val === variant.price) {
      await upsert(variant.id, { price_override: null });
    } else if (val > 0) {
      await upsert(variant.id, { price_override: val });
    }
  };

  return (
    <div className="flex items-center gap-4 py-2 border-b border-border last:border-0">
      <span
        className="w-3 h-3 rounded-full border border-border shrink-0"
        style={{ background: variant.color ? slugColorToCss(variant.color) : "transparent" }}
      />
      <span className="text-sm font-medium flex-1 truncate">{variant.color ?? variant.name}</span>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={price}
          onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
          onBlur={() => commit(price)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="w-24 h-8 text-sm"
        />
        <span className="text-xs text-muted-foreground w-6">Kč</span>
      </div>
      <div className="flex items-center gap-2 w-32 justify-end">
        <span className="text-xs text-muted-foreground">Skladem</span>
        <Switch
          checked={o.in_stock}
          onCheckedChange={(v) => upsert(variant.id, { in_stock: v })}
        />
      </div>
    </div>
  );
};

const slugColorToCss = (name: string): string => {
  const map: Record<string, string> = {
    "Černá": "#111",
    "Bílá": "#fff",
    "Šedá": "#888",
    "Neon zelená": "#39ff14",
    "Neon žlutá": "#f7ff00",
    "Modrá": "#1e6cf0",
    "Růžová": "#ff6fa8",
    "Červená": "#e22d2d",
    "Zlatá": "#c9a84c",
    "Tyrkysová světlá": "#67e8f9",
    "Tyrkysová tmavá": "#0e7490",
  };
  return map[name] ?? "transparent";
};

export default AdminProductEdit;
