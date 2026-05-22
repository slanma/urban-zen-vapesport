import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Save, Youtube, Loader2 } from "lucide-react";
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
import { getProductById, products, productsByBaseId, type Product } from "@/data/products";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { toast } from "@/hooks/use-toast";

const categoryOptions = Array.from(
  new Set(products.map((p) => p.categoryLabel)),
).sort();

// Auto-convert a pasted YouTube URL into an <iframe> embed snippet.
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

  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.categoryLabel ?? "");
  const [shortDescription, setShortDescription] = useState(
    product?.shortDescription ?? "",
  );
  const [descriptionHtml, setDescriptionHtml] = useState<string>("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [price, setPrice] = useState<number>(product?.price ?? 0);
  const [vat, setVat] = useState<number>(21);
  const [inStock, setInStock] = useState(true);
  const [visible, setVisible] = useState(true);

  // Hydrate from override once loaded
  useEffect(() => {
    if (!product || loading) return;
    const o = get(product.id);
    setVisible(o.visible);
    setInStock(o.in_stock);
    setPrice(o.price_override ?? product.price);
    setVat(o.vat_percent);
    setDescriptionHtml(o.description_html ?? "");
    setYoutubeUrl(o.youtube_url ?? "");
    setName(product.name);
    setCategory(product.categoryLabel);
    setShortDescription(product.shortDescription);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsert(product.id, {
        visible,
        in_stock: inStock,
        price_override: price !== product.price ? price : null,
        vat_percent: vat,
        description_html: descriptionHtml || null,
        youtube_url: youtubeUrl || null,
      });
      toast({ title: "Změny uloženy" });
    } catch {
      toast({ title: "Uložení selhalo", variant: "destructive" });
    } finally {
      setSaving(false);
    }
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
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Uložit změny
        </Button>
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
          <div className="mb-4">
            <Label htmlFor="short">Krátký popis</Label>
            <Textarea id="short" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="mt-1" rows={2} />
          </div>
          <div>
            <Label htmlFor="desc">Hlavní popis (HTML)</Label>
            <Textarea
              id="desc"
              value={descriptionHtml}
              onChange={(e) => setDescriptionHtml(e.target.value)}
              onPaste={(e) => {
                const txt = e.clipboardData.getData("text");
                const vid = youtubeIdFromUrl(txt);
                if (vid) {
                  e.preventDefault();
                  const target = e.currentTarget;
                  const start = target.selectionStart ?? descriptionHtml.length;
                  const end = target.selectionEnd ?? descriptionHtml.length;
                  setDescriptionHtml(
                    descriptionHtml.slice(0, start) + embedHtml(vid) + descriptionHtml.slice(end),
                  );
                  toast({ title: "YouTube video automaticky vloženo" });
                }
              }}
              rows={8}
              className="mt-1 font-mono text-xs"
              placeholder="<p>Popis produktu…</p>  — vložte YouTube URL pro automatický embed."
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
            {descriptionHtml && (
              <div className="mt-4 p-4 bg-muted/40 rounded border border-border">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Náhled</p>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              </div>
            )}
          </div>
        </article>

        {/* Card 2: Cena a dostupnost */}
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
          <div className="mt-4 flex items-center justify-between bg-muted/40 rounded-md px-4 py-2.5 max-w-xs">
            <Label htmlFor="visible" className="cursor-pointer">Viditelné v e-shopu</Label>
            <Switch id="visible" checked={visible} onCheckedChange={setVisible} />
          </div>
        </article>

        {/* Card 3: Varianty */}
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
