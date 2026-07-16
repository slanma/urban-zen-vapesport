import { Facebook, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer id="kontakt" className="bg-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-heading text-xl font-bold text-primary-foreground mb-4">Vapesport</h3>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              Prémiové brašny pro aktivní životní styl. Česká značka.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://www.facebook.com/VAPESPORT"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-primary-foreground/20 text-primary-foreground/70 flex items-center justify-center hover:bg-primary-foreground hover:text-foreground transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/vapesport_vlach/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-primary-foreground/20 text-primary-foreground/70 flex items-center justify-center hover:bg-primary-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@morseovlach"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 rounded-full border border-primary-foreground/20 text-primary-foreground/70 flex items-center justify-center hover:bg-primary-foreground hover:text-foreground transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4">
                  <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.08-.14 1.62.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@luckazvapesportu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full border border-primary-foreground/20 text-primary-foreground/70 flex items-center justify-center hover:bg-primary-foreground hover:text-foreground transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-primary-foreground mb-4 text-sm uppercase tracking-widest">Navigace</h4>
            <ul className="space-y-2">
              {[
                { label: "Domů", href: "/" },
                { label: "Katalog", href: "/produkty" },
                { label: "Obchod", href: "/obchod" },
                { label: "B2B Velkoobchod", href: "/b2b-login" },
                { label: "Obchodní podmínky", href: "/obchodni-podminky" },
                { label: "Kontakt", href: "/kontakt" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-primary-foreground mb-4 text-sm uppercase tracking-widest">Rychlý kontakt</h4>
            <p className="text-sm text-primary-foreground/60 mb-3">
              Máte dotaz? Napište nebo zavolejte, rádi poradíme.
            </p>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li>
                <a href="mailto:info@vapesport.cz" className="hover:text-primary-foreground transition-colors">
                  info@vapesport.cz
                </a>
              </li>
              <li>
                <a href="tel:+420606080922" className="hover:text-primary-foreground transition-colors">
                  +420 606 080 922
                </a>
              </li>
              <li>Ostrava, Česká republika</li>
            </ul>
            <p className="mt-4 text-sm text-primary-foreground/60">
              <span className="text-primary-foreground/40 uppercase tracking-widest text-xs">Otevírací doba</span>
              <br />
              Po–Pá 9:00–14:00
            </p>
            <a
              href="/kontakt"
              className="inline-block mt-4 text-sm text-primary-foreground/80 hover:text-primary-foreground underline underline-offset-4"
            >
              Celý kontakt →
            </a>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/40 text-xs">
            © 2026 Vapesport Vlach s.r.o. Všechna práva vyhrazena.
          </p>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href="/obchodni-podminky"
              className="text-primary-foreground/60 hover:text-primary-foreground text-xs transition-colors underline-offset-4 hover:underline"
            >
              Obchodní podmínky
            </a>
            <a
              href="/ochrana-udaju"
              className="text-primary-foreground/60 hover:text-primary-foreground text-xs transition-colors underline-offset-4 hover:underline"
            >
              Ochrana osobních údajů
            </a>
            <a
              href="/odstoupeni"
              className="text-primary-foreground/60 hover:text-primary-foreground text-xs transition-colors underline-offset-4 hover:underline"
            >
              Odstoupení od smlouvy
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
