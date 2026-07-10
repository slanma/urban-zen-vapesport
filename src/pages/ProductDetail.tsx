import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProductById } from "@/data/products";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useB2BPartner } from "@/hooks/useB2BPartner";
import { getEffectiveGallery } from "@/lib/productImages";
import { RichText, stripRichMarkers } from "@/lib/richText";
import { applyProductOverride, getEffectiveProductCode } from "@/lib/effectiveProduct";
import { resolveColor } from "@/lib/colorPalette";
import { netFromGross, fmtCZK } from "@/lib/vat";

import { ArrowLeft, ShoppingCart, Check, PackageCheck, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import { toast } from "@/hooks/use-toast";
import QuantitySelector from "@/components/product/QuantitySelector";
import EbikeBadges from "@/components/product/EbikeBadges";
import ProblemSolutionBullets from "@/components/product/ProblemSolutionBullets";
import TechSpecTable from "@/components/product/TechSpecTable";
import ColorCells from "@/components/product/ColorCells";
import RagSeoBlock from "@/components/product/RagSeoBlock";
import FeatureBadges from "@/components/FeatureBadges";
import { isKnownFeature } from "@/lib/productFeatures";
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
  const { get: getSetting } = useSiteSettings();
  const { isPartner } = useB2BPartner();
  const override = baseProduct ? get(baseProduct.id) : null;

  const product = baseProduct && override ? applyProductOverride(baseProduct, override) : null;

  const effectivePrice = override?.price_override ?? product?.price ?? 0;
  const b2bPrice = override?.b2b_price ?? baseProduct?.b2b_price ?? null;
  const inStock = override?.in_stock ?? true;
  const gallery = product ? getEffectiveGallery(product, override) : [];
  const [activeImg, setActiveImg] = useState(0);
  const availableColors = useMemo(
    () =>
      (override?.colors_override ?? baseProduct?.available_colors)?.filter(Boolean) ??
      null,
    [override?.colors_override, baseProduct?.available_colors],
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [frameCirc, setFrameCirc] = useState<string>("");

  // Pick first in-stock color when product loads.
  useEffect(() => {
    if (!availableColors || availableColors.length === 0) {
      setSelectedColor(null);
      return;
    }
    const stock = override?.color_stock ?? null;
    const firstAvailable = availableColors.find((c) => !(stock && stock[c] === 0)) ?? null;
    setSelectedColor(firstAvailable);
  }, [product?.id, availableColors, override?.color_stock]);

  useEffect(() => {
    if (!product || !override) return;
    const sku = getEffectiveProductCode(baseProduct!, override);
    const title = override.meta_title || `${product.name} (${sku}) | VAPESPORT`;
    const desc = override.meta_description || stripRichMarkers(product.shortDescription);
    const prevTitle = document.title;
    document.title = title;
    setMeta("description", desc);
    if (override.ai_keywords) setMeta("keywords", override.ai_keywords);
    setMeta("og:title", title, "property");
    setMeta("og:description", desc, "property");
    return () => {
      document.title = prevTitle;
    };
  }, [product, override, baseProduct]);

  const maxCircCm = useMemo(() => {
    const productMax = override?.max_frame_circumference_cm;
    if (productMax && productMax > 0) return productMax;
    const globalMax = parseFloat(getSetting("default_max_frame_circumference_cm", "7.5"));
    return Number.isFinite(globalMax) && globalMax > 0 ? globalMax : 7.5;
  }, [override?.max_frame_circumference_cm, getSetting]);

  const selectedColorLabel = selectedColor ? resolveColor(selectedColor).label : "Vyberte";
  const visibleFeatures = useMemo(() => {
    if (!product) return [];
    const withoutStaleColorLine = product.features.filter(
      (feature) => !/^\s*dostupné\s+barvy\s*:/i.test(feature),
    );
    if (!availableColors || availableColors.length === 0) return withoutStaleColorLine;
    const colorLabels = availableColors.map((color) => resolveColor(color).label).join(", ");
    return [...withoutStaleColorLine, `Dostupné barvy: ${colorLabels}`];
  }, [product, availableColors]);

  const isDeleted = override ? override.visible === false : false;

  if (!product || !override || isDeleted) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 pt-20">
          <p className="font-heading text-2xl font-bold text-foreground">Produkt nenalezen</p>
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

  const sku = getEffectiveProductCode(baseProduct!, override);
  const visibleSpecs = product.specs;
  const grossPrice = effectivePrice;
  const netPrice = netFromGross(grossPrice);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product.id, quantity, selectedColor);

    // Auto-inject longer straps if user reported larger frame circumference.
    const circ = parseFloat(frameCirc.replace(",", "."));
    const strapsId = getSetting("longer_straps_product_id", "").trim();
    if (Number.isFinite(circ) && circ > maxCircCm && strapsId) {
      const strapsProduct = getProductById(strapsId);
      if (strapsProduct) {
        addItem(strapsId, 1, null, { auto: true, autoFor: product.id });
        toast({
          title: "Přidány prodloužené pásky",
          description: `Váš obvod rámu (${circ.toFixed(1)} cm) přesahuje standard ${maxCircCm} cm.`,
        });
      } else {
        console.warn(
          "[ProductDetail] longer_straps_product_id is set but product not found:",
          strapsId,
        );
      }
    }
    openDrawer();
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-16 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <Link
          to="/produkty"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          Zpět na katalog
        </Link>

        {/* BLOCK A — header */}
        <header className="mb-8">
          <p className="text-[11px] font-body font-bold tracking-[0.25em] uppercase text-primary">
            {product.categoryLabel}
            {override.ebike_integrated_battery !== null && (
              <span className="ml-2 text-muted-foreground/80 font-semibold">
                / Určeno pro e-biky
              </span>
            )}
          </p>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground mt-3 leading-tight">
            {product.name}{" "}
            <span className="text-muted-foreground font-heading">({sku})</span>
          </h1>
          {override.subtitle_override && (
            <p className="font-body text-lg text-muted-foreground mt-4 max-w-3xl leading-relaxed">
              {override.subtitle_override}
            </p>
          )}
        </header>

        {/* Asymmetric layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Image */}
          <div className="lg:col-span-7">
            <div className="sticky top-28 flex flex-col gap-4">
              <div className="aspect-[4/3] bg-white rounded-2xl overflow-hidden flex items-center justify-center p-4">
                <img
                  src={gallery[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-contain"
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
                      className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors flex items-center justify-center p-1 ${
                        i === activeImg ? "border-primary" : "border-transparent hover:border-border"
                      }`}
                    >
                      <img src={src} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Price — partner sees wholesale dominant */}
            <div className="border-b border-border pb-6">
              {isPartner && b2bPrice ? (
                <>
                  <div className="font-heading text-4xl font-bold text-foreground">
                    {fmtCZK(b2bPrice)}{" "}
                    <span className="text-base font-body font-semibold text-muted-foreground">
                      bez DPH (VOC)
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 font-body">
                    MOC s DPH: {fmtCZK(grossPrice)}
                  </div>
                </>
              ) : (
                <>
                  <div className="font-heading text-4xl font-bold text-foreground">
                    {fmtCZK(grossPrice)}{" "}
                    <span className="text-base font-body font-semibold text-muted-foreground">
                      s DPH
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 font-body">
                    Bez DPH: {fmtCZK(netPrice)}
                  </div>
                </>
              )}
              <div className="mt-3 flex items-center gap-4 text-xs font-body text-muted-foreground">
                <span>
                  Kód: <span className="font-mono text-foreground">{sku}</span>
                </span>
                <span className="text-border">|</span>
                <span className="inline-flex items-center gap-1">
                  {inStock ? (
                    <>
                      <PackageCheck className="w-3.5 h-3.5 text-primary" />
                      <span className="text-foreground font-semibold">Skladem: Ano</span>
                    </>
                  ) : (
                    <>
                      <PackageX className="w-3.5 h-3.5 text-destructive" />
                      <span className="text-destructive font-semibold">Vyprodáno</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* E-bike badges */}
            {(override.ebike_integrated_battery !== null ||
              override.ebike_full_suspension !== null ||
              override.low_step_compatible !== null) && (
              <div className="mt-6">
                <p className="font-heading text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                  E-bike kompatibilita
                </p>
                <EbikeBadges
                  integratedBattery={override.ebike_integrated_battery}
                  fullSuspension={override.ebike_full_suspension}
                  lowStep={override.low_step_compatible}
                />
              </div>
            )}

            {/* Color cells */}
            {availableColors && availableColors.length > 0 && (
              <div className="mt-6">
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
                    Barva
                  </h2>
                  <span className="font-body text-sm text-muted-foreground">
                    {selectedColorLabel}
                  </span>
                </div>
                <ColorCells
                  colors={[...availableColors]}
                  stock={override.color_stock}
                  selected={selectedColor}
                  onSelect={setSelectedColor}
                />
              </div>
            )}

            {/* Frame circumference */}
            <div className="mt-6">
              <Label
                htmlFor="frame-circ"
                className="font-heading text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Obvod vaší rámové trubky (volitelné)
              </Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="frame-circ"
                  inputMode="decimal"
                  placeholder={`např. ${maxCircCm} cm`}
                  value={frameCirc}
                  onChange={(e) => setFrameCirc(e.target.value)}
                  className="w-32"
                />
                <span className="font-body text-sm text-muted-foreground">cm</span>
              </div>
              <p className="font-body text-xs text-muted-foreground mt-1">
                Pokud je váš obvod větší než {maxCircCm} cm, automaticky přidáme prodloužené suché zipy.
              </p>
            </div>

            {/* Quantity + Add to cart */}
            <div className="mt-8 flex items-center gap-3">
              <QuantitySelector value={quantity} onChange={setQuantity} disabled={!inStock} />
              <Button
                size="lg"
                disabled={!inStock || (!!availableColors && !selectedColor)}
                onClick={handleAddToCart}
                className="flex-1 gap-2 text-base font-semibold rounded-full px-8 h-12"
              >
                <ShoppingCart className="w-5 h-5" />
                {inStock ? "Přidat do košíku" : "Vyprodáno"}
              </Button>
            </div>

            {/* BLOCK C — Problem / Function / Usage */}
            {(override.problem_bullet || override.function_bullet || override.usage_bullet) && (
              <div className="mt-10">
                <ProblemSolutionBullets
                  problem={override.problem_bullet}
                  fn={override.function_bullet}
                  usage={override.usage_bullet}
                />
              </div>
            )}

            {/* Short description + accordion */}
            {!override.subtitle_override && (
              <RichText
                as="p"
                className="font-body text-muted-foreground mt-8 text-base leading-relaxed"
                text={product.shortDescription}
              />
            )}

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
                  {(() => {
                    const techFeats = visibleFeatures.filter(isKnownFeature);
                    const otherFeats = visibleFeatures.filter((f) => !isKnownFeature(f));
                    return (
                      <div className="space-y-4 pt-1">
                        {techFeats.length > 0 && (
                          <FeatureBadges features={techFeats} size="lg" />
                        )}
                        {otherFeats.length > 0 && (
                          <ul className="space-y-3">
                            {otherFeats.map((feat) => (
                              <li
                                key={feat}
                                className="flex items-start gap-3 text-sm font-body text-foreground"
                              >
                                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })()}
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
                        <dt className="font-body font-semibold text-foreground">{spec.label}</dt>
                        <dd className="font-body text-muted-foreground">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* BLOCK D — full-width tech table */}
        <TechSpecTable sku={sku} categoryLabel={product.categoryLabel} override={override} />

        {override?.description_html ? (
          <article
            className="mt-16 max-w-3xl mx-auto prose prose-neutral prose-headings:font-heading prose-h2:text-3xl prose-h2:font-bold prose-h3:text-xl prose-h3:font-bold prose-h3:mt-8 prose-p:font-body prose-li:font-body prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: override.description_html }}
          />
        ) : null}

        {override?.tech_params_html && (
          <article className="mt-12 max-w-3xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
              Doplňující technické parametry
            </h2>
            <div
              className="prose prose-neutral prose-p:font-body prose-li:font-body prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: override.tech_params_html }}
            />
          </article>
        )}

        {/* BLOCK E — RAG / SEO hidden block */}
        <RagSeoBlock product={product} override={override} sku={sku} />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: product.name,
              sku,
              mpn: sku,
              brand: { "@type": "Brand", name: override.manufacturer ?? "Vapesport Handmade CR" },
              description: stripRichMarkers(
                override.subtitle_override ?? product.shortDescription,
              ),
              image: gallery,
              category: product.categoryLabel,
              offers: {
                "@type": "Offer",
                priceCurrency: "CZK",
                price: grossPrice,
                availability: inStock
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              },
              additionalProperty: [
                override.motor_type && { "@type": "PropertyValue", name: "Typ pohonu e-biku", value: override.motor_type },
                override.battery_location && { "@type": "PropertyValue", name: "Umístění baterie", value: override.battery_location },
                override.material && { "@type": "PropertyValue", name: "Materiál", value: override.material },
                override.ebike_integrated_battery !== null && {
                  "@type": "PropertyValue",
                  name: "Integrovaná baterie",
                  value: override.ebike_integrated_battery ? "Ano" : "Ne",
                },
                override.ebike_full_suspension !== null && {
                  "@type": "PropertyValue",
                  name: "Celoodpružené",
                  value: override.ebike_full_suspension ? "Ano" : "Ne",
                },
              ].filter(Boolean),
            }),
          }}
        />
      </section>

      <Footer />
    </main>
  );
};

export default ProductDetail;
