import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProductById } from "@/data/products";
import { useProductOverrides } from "@/hooks/useProductOverrides";

import { ArrowLeft, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import PriceTag from "@/components/PriceTag";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const baseProduct = getProductById(id);
  const { addItem, openDrawer } = useCart();
  const { get } = useProductOverrides();
  const override = baseProduct ? get(baseProduct.id) : null;

  const product = baseProduct
    ? {
        ...baseProduct,
        name: override?.name_override?.trim() || baseProduct.name,
        categoryLabel: override?.category_override?.trim() || baseProduct.categoryLabel,
        shortDescription:
          override?.short_description_override?.trim() || baseProduct.shortDescription,
        features:
          override?.features_override && override.features_override.length > 0
            ? override.features_override
            : baseProduct.features,
        specs:
          override?.specs_override && override.specs_override.length > 0
            ? override.specs_override
            : baseProduct.specs,
        available_colors:
          override?.colors_override && override.colors_override.length > 0
            ? override.colors_override
            : baseProduct.available_colors,
      }
    : null;

  const effectivePrice = override?.price_override ?? product?.price ?? 0;
  const b2bPrice = override?.b2b_price ?? null;
  const inStock = override?.in_stock ?? true;
  const gallery = product?.images && product.images.length > 0
    ? product.images
    : product ? [product.image] : [];
  const [activeImg, setActiveImg] = useState(0);
  const availableColors = product?.available_colors ?? null;
  const [selectedColor, setSelectedColor] = useState<string | null>(
    availableColors?.[0] ?? null,
  );

  useEffect(() => {
    if (!product) return;
    const title = override?.meta_title || `${product.name} | VAPESPORT`;
    const desc = override?.meta_description || product.shortDescription;
    const prevTitle = document.title;
    document.title = title;
    setMeta("description", desc);
    if (override?.ai_keywords) setMeta("keywords", override.ai_keywords);
    setMeta("og:title", title, "property");
    setMeta("og:description", desc, "property");
    return () => { document.title = prevTitle; };
  }, [product, override?.meta_title, override?.meta_description, override?.ai_keywords]);


  const isDeleted = override ? override.visible === false : false;

  if (!product || isDeleted) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 pt-20">
          <p className="font-heading text-2xl font-bold text-foreground">
            Produkt nenalezen
          </p>
          <Link
            to="/produkty"
            className="text-primary font-semibold underline underline-offset-4"
          >
            Zpět na katalog
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const visibleSpecs = product.specs;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-24 px-6 lg:px-12 max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <Link
          to="/produkty"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10 font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          Zpět na katalog
        </Link>

        {/* Asymmetric layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Image — large left side */}
          <div className="lg:col-span-7">
            <div className="sticky top-28 flex flex-col gap-4">
              <div className="aspect-[4/3] bg-muted rounded-2xl overflow-hidden flex items-center justify-center">
                <img
                  src={gallery[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {gallery.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {gallery.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      aria-label={`Zobrazit obrázek ${i + 1}`}
                      className={`aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-colors ${
                        i === activeImg ? "border-primary" : "border-transparent hover:border-border"
                      }`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Text — right side */}
          <div className="lg:col-span-5 flex flex-col">
            <span className="text-[11px] font-body font-bold tracking-[0.25em] uppercase text-primary">
              {product.categoryLabel}
            </span>

            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3 leading-tight">
              {product.name}
            </h1>

            <p className="font-body text-muted-foreground mt-4 text-base leading-relaxed">
              {product.shortDescription}
            </p>

            <div className="mt-8">
              <PriceTag
                retailGross={effectivePrice}
                b2bGross={b2bPrice}
                size="lg"
              />
            </div>

            {availableColors && availableColors.length > 0 && (
              <div className="mt-8">
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">
                    Barva
                  </h2>
                  <span className="font-body text-sm text-muted-foreground">
                    {selectedColor ?? "Vyberte"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((c) => {
                    const active = c === selectedColor;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        aria-pressed={active}
                        className={`px-4 py-2 rounded-full border text-sm font-body transition-colors ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              size="lg"
              disabled={!inStock || (!!availableColors && !selectedColor)}
              onClick={() => {
                if (!product) return;
                addItem(product.id, 1, selectedColor);
                openDrawer();
              }}
              className="mt-6 w-full gap-2 text-base font-semibold rounded-full px-10"
            >
              <ShoppingCart className="w-5 h-5" />
              {inStock
                ? availableColors
                  ? `Přidat do košíku${selectedColor ? ` – ${selectedColor}` : ""}`
                  : "Přidat do košíku"
                : "Vyprodáno"}
            </Button>

            {/* Clean accordion: features + specs */}
            <Accordion
              type="multiple"
              defaultValue={["features"]}
              className="mt-10 border-t border-border"
            >
              <AccordionItem value="features" className="border-b border-border">
                <AccordionTrigger className="font-heading text-sm font-bold uppercase tracking-wider text-foreground hover:no-underline py-5">
                  Klíčové vlastnosti
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3 pt-1">
                    {product.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-3 text-sm font-body text-foreground"
                      >
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="specs" className="border-b border-border">
                <AccordionTrigger className="font-heading text-sm font-bold uppercase tracking-wider text-foreground hover:no-underline py-5">
                  Specifikace
                </AccordionTrigger>
                <AccordionContent>
                  <dl className="rounded-lg overflow-hidden border border-border divide-y divide-border">
                    {visibleSpecs.map((spec, i) => (
                      <div
                        key={spec.label}
                        className={`grid grid-cols-[40%_1fr] gap-4 px-4 py-3 text-sm ${
                          i % 2 === 0 ? "bg-muted/40" : "bg-background"
                        }`}
                      >
                        <dt className="font-body font-semibold text-foreground">
                          {spec.label}
                        </dt>
                        <dd className="font-body text-muted-foreground">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {override?.description_html ? (
          <article
            key="desc-html"
            className="mt-20 max-w-3xl mx-auto prose prose-neutral prose-headings:font-heading prose-h2:text-3xl prose-h2:font-bold prose-h3:text-xl prose-h3:font-bold prose-h3:mt-8 prose-p:font-body prose-li:font-body prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: override.description_html }}
          />
        ) : (
          <article key="desc-default" className="mt-20 max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              Perfektní organizace a čistý design přímo v rámu kola
            </h2>
            <p className="font-body text-muted-foreground mt-4 leading-relaxed">
              {product.shortDescription}
            </p>
            {product.features.length > 0 && (
              <>
                <h3 className="font-heading text-xl font-bold text-foreground mt-8">
                  Klíčové vlastnosti pro vaši jízdu:
                </h3>
                <ul className="mt-4 space-y-2">
                  {product.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 font-body text-foreground"
                    >
                      <Check className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </article>
        )}


      </section>

      <Footer />
    </main>
  );
};

export default ProductDetail;
