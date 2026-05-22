const Footer = () => {
  return (
    <footer id="kontakt" className="bg-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-heading text-xl font-bold text-primary-foreground mb-4">Vapesport</h3>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              Prémiová pouzdra pro aktivní životní styl. Česká značka.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-primary-foreground mb-4 text-sm uppercase tracking-widest">Navigace</h4>
            <ul className="space-y-2">
              {["Domů", "Kolekce", "Obchod", "O nás", "Blog", "Kontakt"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-primary-foreground mb-4 text-sm uppercase tracking-widest">Kontakt</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li>info@vapesport.cz</li>
              <li>+420 123 456 789</li>
              <li>Praha, Česká republika</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/40 text-xs">
            © 2024 Vapesport. Všechna práva vyhrazena.
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
