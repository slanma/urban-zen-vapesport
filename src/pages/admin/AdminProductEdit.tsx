import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Eye, Upload, X, Star, StarOff, Loader } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!product || loading) return;
    const o = get(product.id);
    setName(o.name_override ?? product.name);
    const curCat = o.category_override ?? product.categoryLabel;
    setCategory(
      (CATEGORY_OPTIONS as readonly string[]).includes(curCat)
        ? curCat
        : CATEGORY_OPTIONS[0],
    );
    setPrice(o.price_override ?? product.price);
    setB2bPrice(o.b2b_price ?? "");
    setStockQty(o.stock_qty ?? (o.in_stock ? "" : 0));
    setShortDescription(o.short_description_override ?? product.shortDescription);
    setFeaturesText((o.features_override ?? product.features).join("\n"));
    setImages(getEffectiveGallery(product, o));
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
        name_override: name !== product.name ? name : null,
        category_override: category !== product.categoryLabel ? category : null,
        price_override: price !== product.price ? price : null,
        b2b_price: typeof b2bPrice === "number" && b2bPrice > 0 ? b2bPrice : null,
        stock_qty: qty,
        in_stock: qty == null ? true : qty > 0,
        short_description_override:
          shortDescription !== product.shortDescription ? shortDescription : null,
        features_override: cleanFeatures.length > 0 ? cleanFeatures : null,
      });
      toast({ title: "Změny uloženy" });
    } catch {
      toast({ title: "Uložení selhalo", variant: "destructive" });
    } finally {
      setSaving(false);
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
              await handleSave();
              window.open(`/produkt/${product.id}`, "_blank", "noopener");
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
            <Input id="code" value={product.id} disabled className="mt-1 font-mono text-xs" />
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
          <Textarea
            id="short"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            rows={3}
            maxLength={400}
            placeholder="Pro koho je produkt určen a proč ho potřebuje (2–3 věty)."
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {shortDescription.length}/400 znaků · max 2–3 věty
          </p>
        </div>

        <div>
          <Label htmlFor="features">Klíčové vlastnosti (odrážky)</Label>
          <Textarea
            id="features"
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            rows={5}
            placeholder={"Jedna odrážka na řádek\nNapř. Rozměry 25 × 10 × 8 cm\nMateriál: PE 600D\nKompatibilita: rám 4–5 cm"}
            className="mt-1 font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Každý řádek = jedna odrážka. Max 3–4 technické fakty (rozměry, materiál, kompatibilita).
          </p>
        </div>
      </article>

      <div className="sticky bottom-4 mt-6 flex justify-end gap-2">
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
    </section>
  );
};

export default AdminProductEdit;
