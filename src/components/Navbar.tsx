import { useState } from "react";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";

const navItems = [
  { label: "DOMŮ", href: "#" },
  { label: "KOLEKCE (Morseovape)", href: "#kolekce" },
  { label: "OBCHOD", href: "#obchod" },
  { label: "O NÁS", href: "#onas" },
  { label: "BLOG", href: "#blog" },
  { label: "KONTAKT", href: "#kontakt" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <nav className="flex items-center justify-between h-20 px-6 lg:px-12 max-w-[1600px] mx-auto">
        {/* Logo – bold italic like original */}
        <a href="#" className="font-heading text-2xl font-bold italic text-foreground tracking-tight">
          Vapesport
        </a>

        {/* Desktop nav – centered */}
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

        {/* Right icons with labels */}
        <div className="flex items-center gap-5">
          <a href="#" className="hidden md:flex items-center gap-1.5 text-foreground text-[13px] font-medium hover:text-primary transition-colors">
            <Search className="w-4 h-4" />
            <span>Hledat</span>
          </a>
          <a href="#" className="hidden md:flex items-center gap-1.5 text-foreground text-[13px] font-medium hover:text-primary transition-colors">
            <User className="w-4 h-4" />
            <span>Účet</span>
          </a>
          <a href="#" className="flex items-center gap-1.5 text-foreground text-[13px] font-medium hover:text-primary transition-colors">
            <ShoppingCart className="w-4 h-4" />
            <span>Košík (0)</span>
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
