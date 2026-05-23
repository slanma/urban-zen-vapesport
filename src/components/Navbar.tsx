import { useState } from "react";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useB2BPartner } from "@/hooks/useB2BPartner";

const navItems = [
  { label: "DOMŮ", href: "/" },
  { label: "KOLEKCE MORSEOVAPE", href: "/produkty?kategorie=morseo" },
  { label: "OBCHOD", href: "/obchod" },
  { label: "O NÁS", href: "#onas" },
  { label: "BLOG", href: "#blog" },
  { label: "KONTAKT", href: "#kontakt" },
];

interface NavbarProps {
  isLoggedIn?: boolean;
}

const Navbar = ({ isLoggedIn = false }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count } = useCart();
  const { isPartner } = useB2BPartner();


  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <nav className="flex items-center justify-between h-20 px-6 lg:px-12 max-w-[1600px] mx-auto">
        {/* Logo */}
        <a href="/" className="font-heading text-2xl font-bold text-foreground tracking-tight">
          Vapesport
        </a>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="text-[13px] font-body font-medium text-foreground hover:text-primary transition-colors tracking-wide underline-offset-4 hover:underline"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right icons */}
        <div className="flex items-center gap-5">
          <a href="/produkty" className="hidden md:flex items-center gap-1.5 text-foreground text-[13px] font-medium hover:text-primary transition-colors" aria-label="AI vyhledávání produktů">
            <Search className="w-4 h-4" />
            <span>Hledat</span>
          </a>
          <a href="/ucet" className="relative hidden md:flex items-center gap-1.5 text-foreground text-[13px] font-medium hover:text-primary transition-colors">
            <User className="w-4 h-4" />
            <span>Účet</span>
            {isLoggedIn && (
              <span
                className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_6px_2px_hsl(var(--primary)/0.45)] animate-pulse"
                aria-label="Přihlášen"
              />
            )}
          </a>
          {isPartner ? (
            <a
              href="/b2b-dashboard"
              className="hidden md:inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border border-primary/30 hover:bg-primary/15 transition-colors"
              title="Velkoobchodní režim aktivní"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_2px_hsl(var(--primary)/0.45)] animate-pulse" />
              B2B · VOC
            </a>
          ) : (
            <a href="/b2b-login" className="hidden md:inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[13px] font-bold px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              B2B Portál
            </a>
          )}
          <a href="/kosik" className="flex items-center gap-1.5 text-foreground text-[13px] font-medium hover:text-primary transition-colors">
            <ShoppingCart className="w-4 h-4" />
            <span>Košík ({count})</span>
          </a>
          <button
            className="lg:hidden text-foreground ml-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-md border-t border-border animate-fade-in">
          <ul className="flex flex-col py-4 px-6 gap-4">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
