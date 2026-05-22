import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProductById } from "@/data/products";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { ArrowLeft, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id);
  const { get } = useProductOverrides();
  const override = product ? get(product.id) : null;
  const effectivePrice = override?.price_override ?? product?.price ?? 0;
  const inStock = override?.in_stock ?? true;
  const gallery = product?.images && product.images.length > 0
    ? product.images
    : product ? [product.image] : [];
  const [activeImg, setActiveImg] = useState(0);

  if (!product) {
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

            <span className="font-heading text-3xl font-bold text-foreground mt-8">
              {product.price.toLocaleString("cs-CZ")}&nbsp;Kč
            </span>

            <Button
              size="lg"
              className="mt-6 w-full sm:w-auto gap-2 text-base font-semibold rounded-full px-10"
            >
              <ShoppingCart className="w-5 h-5" />
              Přidat do košíku
            </Button>

            {/* Key features */}
            <div className="mt-12">
              <h2 className="font-heading text-lg font-bold text-foreground mb-4">
                Klíčové vlastnosti
              </h2>
              <ul className="space-y-3">
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
            </div>

            {/* Specs */}
            <div className="mt-12">
              <h2 className="font-heading text-lg font-bold text-foreground mb-4">
                Specifikace
              </h2>
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableBody>
                    {product.specs.map((spec) => (
                      <TableRow key={spec.label}>
                        <TableCell className="font-semibold text-foreground w-1/3">
                          {spec.label}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {spec.value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default ProductDetail;
