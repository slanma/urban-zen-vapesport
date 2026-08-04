import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Head } from "vite-react-ssg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProductById, getProductByCode } from "@/data/products";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useB2BPartner } from "@/hooks/useB2BPartner";
import PriceTag from "@/components/PriceTag";
import { getEffectiveGallery, imageIndexForColor } from "@/lib/productImages";
import { RichText, stripRichMarkers } from "@/lib/richText";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { applyProductOverride, getEffectiveProductCode } from "@/lib/effectiveProduct";
import { resolveColor } from "@/lib/colorPalette";
import { netFromGross, fmtCZK } from "@/lib/vat";

import { ArrowLeft, ShoppingCart, Check, PackageCheck, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUpload from "@/components/ImageUpload";
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



/** Produkty, u kterých chceme nabízet přiložení obrázku i bez slova „na míru“ v názvu. */
const CUSTOM_UPLOAD_IDS = ["vs-neoprenovy-obal-938229"];

/** KLICKfix adaptér (310107) se B2C zákazníkovi automaticky přidá k těmto modelům,
 *  které se na kolo uchycují právě přes KLICKfix. B2B partneři si adaptér řeší sami. */
const KLICKFIX_ADAPTER_CODE = "310107";
const KLICKFIX_BAG_CODES = ["410104", "410105", "410115", "410057"];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Zpět na katalog = skutečný návrat v historii (obnoví scroll + předchozí
  // stránku, ať už to byl obchod, MORSEO kolekce nebo výsledky hledání).
  // Fallback na /obchod, když uživatel přišel přímo (žádná historie).
  const goBackToCatalog = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/obchod");
  };
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
  const [needStraps, setNeedStraps] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);

  // Index fotky pro barvu: nejdřív explicitní přiřazení z adminu (color_image_map),
  // jinak fallback na rozpoznání podle názvu souboru.
  const imageForColor = (color: string): number => {
    const mapped = override?.color_image_map?.[color];
    if (mapped) {
      const i = gallery.findIndex((src) => src === mapped);
      if (i >= 0) return i;
    }
    return imageIndexForColor(gallery, color);
  };

  // Pick first in-stock color when product loads.
  useEffect(() => {
    if (!availableColors || availableColors.length === 0) {
      setSelectedColor(null);
      return;
    }
    const stock = override?.color_stock ?? null;
    const firstAvailable = availableColors.find((c) => !(stock && stock[c] === 0)) ?? null;
    setSelectedColor(firstAvailable);
    if (firstAvailable) {
      const idx = imageForColor(firstAvailable);
      if (idx >= 0) setActiveImg(idx);
    }
  }, [product?.id, availableColors, override?.color_stock]);

  // Klik na barvu přepne hlavní fotku na barevnou verzi (u MORSEO), pokud pro barvu fotka existuje.
  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    const idx = imageForColor(color);
    if (idx >= 0) setActiveImg(idx);
  };


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
          <button
            type="button"
            onClick={goBackToCatalog}
            className="text-primary font-semibold underline underline-offset-4"
          >
            Zpět na katalog
          </button>
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
    addItem(
      product.id,
      quantity,
      selectedColor,
      customImageUrl ? { imageUrl: customImageUrl } : null,
    );

    // Prodloužené pásky – jen když si je zákazník vyžádá zaškrtnutím.
    const strapsId = getSetting("longer_straps_product_id", "").trim();
    if (needStraps && strapsId) {
      const strapsProduct = getProductById(strapsId);
      if (strapsProduct) {
        addItem(strapsId, 1, null, { auto: true, autoFor: product.id });
        toast({
          title: "Přidány prodloužené pásky",
          description: "Přidali jsme prodloužené suché zipy pro širší rámovou trubku.",
        });
      } else {
        console.warn(
          "[ProductDetail] longer_straps_product_id is set but product not found:",
          strapsId,
        );
      }
    }
    // KLICKfix adaptér – B2C zákazníkovi se k vybraným modelům přidá automaticky
    // (B2B partner si příslušenství objednává sám).
    if (!isPartner && KLICKFIX_BAG_CODES.includes(sku)) {
      const adapter = getProductByCode(KLICKFIX_ADAPTER_CODE);
      if (adapter && adapter.id !== product.id) {
        addItem(adapter.id, quantity, null, { auto: true, autoFor: product.id });
        toast({
          title: "Přidán držák KLICKfix",
          description:
            "K této brašně jsme přidali adaptér KLICKfix (310107) pro uchycení na kolo.",
        });
      } else if (!adapter) {
        console.warn(
          "[ProductDetail] KLICKfix adaptér 310107 nebyl v katalogu nalezen – auto-přidání přeskočeno.",
        );
      }
    }

    openDrawer();
  };

  const metaTitle =
    override.meta_title || `${product.name} (${getEffectiveProductCode(baseProduct, override)}) | VAPESPORT`;
  const metaDesc = override.meta_description || stripRichMarkers(product.shortDescription);
  // Hlavní fotka produktu jako náhled pro Facebook / Instagram / WhatsApp.
  // Musí být absolutní URL — relativní cestu sociální sítě neumí načíst.
  const ogImage = absoluteUrl(gallery[0] || product.image || DEFAULT_OG_IMAGE);

  return (
    <main className="min-h-screen bg-background">
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        {/* Náhled při sdílení: fotka produktu, ne obecná ikona webu. */}
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={product.name} />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDesc} />
        <meta name="twitter:image" content={ogImage} />
        {override.ai_keywords ? <meta name="keywords" content={override.ai_keywords} /> : null}
      </Head>
      <Navbar />

      <section className="pt-28 pb-16 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <button
          type="button"
          onClick={goBackToCatalog}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          Zpět na katalog
        </button>

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
              <PriceTag retailGross={grossPrice} b2bNet={b2bPrice} size="lg" />
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
                  onSelect={handleSelectColor}
                />
              </div>
            )}

            {/* Prodloužené pásky — jen trojúhelníky, SMB a produkty s dlouhými pásky */}
            {(/troj[uúûù]h|smb/i.test(`${product.name} ${product.id}`) ||
              (product.features ?? []).includes("LongStrap™")) && (
            <div className="mt-6 rounded-lg border border-border bg-secondary/40 p-4">
              <label htmlFor="need-straps" className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  id="need-straps"
                  checked={needStraps}
                  onCheckedChange={(v) => setNeedStraps(v === true)}
                  className="mt-0.5"
                />
                <span className="font-body text-sm text-foreground">
                  <span className="font-semibold">Mám širší rámovou trubku</span> – přidejte prodloužené suché zipy zdarma.
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    Zaškrtněte jen pokud vám standardní pásky nestačí. Nic měřit nemusíte.
                  </span>
                </span>
              </label>
            </div>
            )}

            {/* Obrázek pro produkty na míru */}
            {(/na m[ií]ru/i.test(product.name) || CUSTOM_UPLOAD_IDS.includes(product.id)) && (
              <div className="mt-6 rounded-lg border border-border bg-secondary/40 p-4">
                <Label className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
                  Přiložte obrázek (volitelné)
                </Label>
                <p className="font-body text-xs text-muted-foreground mt-1 mb-3">
                  Nahrajte fotku nebo návrh, podle kterého vám kus vyrobíme na míru.
                </p>
                <ImageUpload
                  value={customImageUrl}
                  onChange={setCustomImageUrl}
                  folder="produkt-na-miru"
                  hint="JPG nebo PNG, do 5 MB."
                />
              </div>
            )}

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

            {/* BLOCK C — Problém / Funkce / Použití (napevno z feedu) */}
            {(product.problem || product.funkce || product.pouziti) && (
              <div className="mt-10">
                <ProblemSolutionBullets
                  problem={product.problem}
                  fn={product.funkce}
                  usage={product.pouziti}
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

            </Accordion>
          </div>
        </div>

        {/* BLOCK D — full-width tech table */}
        <TechSpecTable
          sku={sku}
          categoryLabel={product.categoryLabel}
          override={override}
          specs={visibleSpecs}
        />

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
              brand: { "@type": "Brand", name: override.manufacturer ?? "Vapesport" },
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
