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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        <a href="#" className="font-heading text-xl font-bold tracking-tight text-foreground">
          Vapesport
        </a>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Hledat">
            <Search className="w-5 h-5" />
          </button>
          <button className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors" aria-label="Účet">
            <User className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Košík">
            <ShoppingCart className="w-5 h-5" />
            <span className="sr-only">Košík (0)</span>
          </button>
          <button
            className="lg:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-background border-t border-border animate-fade-in">
          <ul className="flex flex-col py-4 px-6 gap-4">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
