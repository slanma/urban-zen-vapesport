import { Building2, Phone, Mail, Globe, Download, MapPin, Send, MessageSquare, Facebook, Instagram, Youtube, Share2 } from "lucide-react";

const ContactSection = () => {
  const vcfData = `BEGIN:VCARD
VERSION:3.0
FN:Vapesport
ORG:Vapesport Vlach s.r.o.
TEL;TYPE=WORK,VOICE:+420606080922
TEL;TYPE=WORK,VOICE:+420606080933
EMAIL:info@vapesport.cz
EMAIL:vapesport.lucka@gmail.com
URL:https://www.vapesport.cz
ADR;TYPE=WORK:;;Paskovská 636/275;Ostrava - Hrabová;;720 00;Česká republika
END:VCARD`;

  const vcfHref = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcfData)}`;

  return (
    <section id="kontakt-detail" className="relative bg-[hsl(var(--concrete-light))] py-20 md:py-28">
      {/* Urban grid overlay */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 border-l-4 border-[hsl(var(--moss))] pl-5">
          <span className="text-xs uppercase tracking-[0.3em] text-foreground/50 font-heading">
            /03 — Ozvěte se
          </span>
          <h2 className="mt-2 text-4xl md:text-5xl font-heading font-bold uppercase tracking-tight text-foreground">
            Kontakt
          </h2>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT — Info block */}
          <div className="bg-background border border-foreground/10 p-8 md:p-10">
            {/* Address */}
            <div className="flex items-start gap-4 pb-6 border-b border-foreground/10">
              <div className="shrink-0 w-10 h-10 bg-[hsl(var(--moss))]/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[hsl(var(--moss))]" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-xs uppercase tracking-widest text-foreground/50 font-heading mb-2">
                  Adresa
                </h3>
                <p className="font-heading font-bold text-foreground leading-tight">Vapesport</p>
                <p className="text-sm text-foreground/70">Paskovská 636/275</p>
                <p className="text-sm text-foreground/70">720 00 Ostrava — Hrabová</p>
                <a
                  href={vcfHref}
                  download="vapesport.vcf"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-foreground text-background text-xs uppercase tracking-widest font-heading hover:bg-[hsl(var(--moss))] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" strokeWidth={2} />
                  Stáhnout VCF
                </a>
              </div>
            </div>

            {/* Phones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-foreground/10">
              {[
                { num: "+420 606 080 922", role: "marketing a prodej" },
                { num: "+420 606 080 933", role: "výroba na míru + golf" },
              ].map((p) => (
                <a
                  key={p.num}
                  href={`tel:${p.num.replace(/\s/g, "")}`}
                  className="group flex items-start gap-3"
                >
                  <Phone className="w-4 h-4 mt-1 text-[hsl(var(--moss))] shrink-0" strokeWidth={1.8} />
                  <div>
                    <p className="font-heading font-semibold text-foreground group-hover:text-[hsl(var(--moss))] transition-colors">
                      {p.num}
                    </p>
                    <p className="text-xs italic text-foreground/50">{p.role}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Emails */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-foreground/10">
              {[
                { mail: "info@vapesport.cz", role: "obecné dotazy" },
                { mail: "vapesport.lucka@gmail.com", role: "obchodní zástupce" },
              ].map((e) => (
                <a key={e.mail} href={`mailto:${e.mail}`} className="group flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-1 text-[hsl(var(--moss))] shrink-0" strokeWidth={1.8} />
                  <div className="min-w-0">
                    <p className="font-heading font-semibold text-foreground group-hover:text-[hsl(var(--moss))] transition-colors truncate">
                      {e.mail}
                    </p>
                    <p className="text-xs italic text-foreground/50">{e.role}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Web */}
            <a
              href="https://www.vapesport.cz"
              className="group flex items-center gap-3 pt-6"
            >
              <Globe className="w-4 h-4 text-[hsl(var(--moss))]" strokeWidth={1.8} />
              <span className="font-heading font-semibold text-foreground group-hover:text-[hsl(var(--moss))] transition-colors">
                www.vapesport.cz
              </span>
            </a>
          </div>

          {/* RIGHT — Map + Form */}
          <div className="flex flex-col gap-8">
            {/* Map */}
            <div className="relative border border-foreground/10 overflow-hidden">
              <div className="absolute top-3 left-3 z-10 bg-foreground text-background px-3 py-1.5 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
                <span className="text-[10px] uppercase tracking-widest font-heading">Hrabová</span>
              </div>
              <iframe
                title="Mapa Vapesport"
                src="https://www.google.com/maps?q=Paskovsk%C3%A1+636%2F275,+720+00+Ostrava-Hrabov%C3%A1&output=embed"
                className="w-full h-64 grayscale contrast-110"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Form */}
            <form
              className="bg-background border border-foreground/10 p-6 md:p-8"
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const body = encodeURIComponent(
                  `Jméno: ${data.get("name")}\nE-mail: ${data.get("email")}\nTelefon: ${data.get("phone")}\n\n${data.get("message")}`,
                );
                window.location.href = `mailto:info@vapesport.cz?subject=Kontaktn%C3%AD%20formul%C3%A1%C5%99&body=${body}`;
              }}
            >
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-foreground/10">
                <MessageSquare className="w-4 h-4 text-[hsl(var(--moss))]" strokeWidth={2} />
                <h3 className="font-heading font-bold uppercase tracking-widest text-sm text-foreground">
                  Kontaktní formulář
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  name="name"
                  placeholder="Vaše jméno *"
                  className="bg-[hsl(var(--concrete-light))] border border-transparent focus:border-[hsl(var(--moss))] px-3 py-2.5 text-sm outline-none transition-colors"
                />
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="Váš e-mail *"
                  className="bg-[hsl(var(--concrete-light))] border border-transparent focus:border-[hsl(var(--moss))] px-3 py-2.5 text-sm outline-none transition-colors"
                />
                <input
                  name="phone"
                  placeholder="Váš telefon"
                  className="bg-[hsl(var(--concrete-light))] border border-transparent focus:border-[hsl(var(--moss))] px-3 py-2.5 text-sm outline-none transition-colors sm:col-span-2"
                />
                <textarea
                  required
                  name="message"
                  placeholder="Vaše zpráva *"
                  rows={4}
                  className="bg-[hsl(var(--concrete-light))] border border-transparent focus:border-[hsl(var(--moss))] px-3 py-2.5 text-sm outline-none transition-colors sm:col-span-2 resize-none"
                />
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-[11px] italic text-foreground/50 leading-snug">
                  Položky označené <span className="text-[hsl(var(--moss))]">*</span> jsou povinné.
                  Odesláním souhlasíte se zpracováním osobních údajů.
                </p>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-xs uppercase tracking-widest font-heading hover:bg-[hsl(var(--moss))] transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" strokeWidth={2} />
                  Odeslat
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
