import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { products } from "@/data/products";
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
  const product = products.find((p) => p.id === id);

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
            <div className="aspect-[4/3] bg-muted rounded-2xl overflow-hidden flex items-center justify-center sticky top-28">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
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
