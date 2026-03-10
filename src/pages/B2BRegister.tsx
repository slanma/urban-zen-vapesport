import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, UserPlus } from "lucide-react";

const B2BRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    contactName: "",
    phone: "",
    orderEmail: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = "Zadejte přihlašovací e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Neplatný formát e-mailu.";
    if (!form.password) errs.password = "Zadejte heslo.";
    else if (form.password.length < 8)
      errs.password = "Heslo musí mít alespoň 8 znaků.";
    if (!form.contactName) errs.contactName = "Zadejte kontaktní osobu.";
    if (!form.phone) errs.phone = "Zadejte telefonní číslo.";
    if (!form.orderEmail) errs.orderEmail = "Zadejte e-mail pro objednávky.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.orderEmail))
      errs.orderEmail = "Neplatný formát e-mailu.";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    // Demo: redirect to login
    navigate("/b2b-login");
  };

  const fieldClass =
    "h-14 text-lg px-4 bg-secondary border-border focus-visible:ring-primary";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Vapesport s.r.o.",
            url: "https://vapesport.cz",
            description:
              "Český výrobce cyklobrašen a příslušenství pro elektrokola a gravel od roku 1994.",
            foundingDate: "1994",
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "B2B wholesale registration",
              availableLanguage: ["cs", "en"],
            },
          }),
        }}
      />

      <main className="min-h-screen bg-secondary flex items-center justify-center px-4 py-12">
        <section
          aria-labelledby="b2b-register-heading"
          className="w-full max-w-lg bg-background border border-border rounded-lg p-8 md:p-10 shadow-sm"
        >
          <header className="text-center mb-8">
            <a
              href="/"
              className="font-heading text-2xl font-bold text-foreground tracking-tight inline-block mb-6"
            >
              Vapesport
            </a>
            <h1
              id="b2b-register-heading"
              className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2"
            >
              B2B Registrace
            </h1>
            <p className="text-lg text-muted-foreground">
              Vytvořte si svůj velkoobchodní partnerský účet.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Section 1 */}
            <fieldset className="space-y-5">
              <legend className="text-xl font-heading font-bold text-foreground mb-1">
                Přihlašovací údaje
              </legend>

              <div className="space-y-2">
                <Label
                  htmlFor="reg-email"
                  className="text-base font-semibold text-foreground block"
                >
                  Přihlašovací e-mail
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="vas@email.cz"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={fieldClass}
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "err-email" : undefined}
                />
                {errors.email && (
                  <p id="err-email" role="alert" className="text-destructive text-base font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="reg-password"
                  className="text-base font-semibold text-foreground block"
                >
                  Heslo
                </Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Minimálně 8 znaků"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className={`${fieldClass} pr-14`}
                    aria-required="true"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "err-password" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label={showPassword ? "Skrýt heslo" : "Zobrazit heslo"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-6 h-6" />
                    ) : (
                      <Eye className="w-6 h-6" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="err-password" role="alert" className="text-destructive text-base font-medium">
                    {errors.password}
                  </p>
                )}
              </div>
            </fieldset>

            {/* Section 2 */}
            <fieldset className="space-y-5">
              <legend className="text-xl font-heading font-bold text-foreground mb-1">
                Kontaktní údaje
              </legend>

              <div className="space-y-2">
                <Label
                  htmlFor="reg-contact"
                  className="text-base font-semibold text-foreground block"
                >
                  Kontaktní osoba
                </Label>
                <Input
                  id="reg-contact"
                  type="text"
                  autoComplete="name"
                  placeholder="Jméno a příjmení"
                  value={form.contactName}
                  onChange={(e) => update("contactName", e.target.value)}
                  className={fieldClass}
                  aria-required="true"
                  aria-invalid={!!errors.contactName}
                  aria-describedby={errors.contactName ? "err-contact" : undefined}
                />
                {errors.contactName && (
                  <p id="err-contact" role="alert" className="text-destructive text-base font-medium">
                    {errors.contactName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="reg-phone"
                  className="text-base font-semibold text-foreground block"
                >
                  Telefon
                </Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+420 123 456 789"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className={fieldClass}
                  aria-required="true"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "err-phone" : undefined}
                />
                {errors.phone && (
                  <p id="err-phone" role="alert" className="text-destructive text-base font-medium">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="reg-order-email"
                  className="text-base font-semibold text-foreground block"
                >
                  E-mail pro informace o objednávkách
                </Label>
                <Input
                  id="reg-order-email"
                  type="email"
                  autoComplete="email"
                  placeholder="objednavky@firma.cz"
                  value={form.orderEmail}
                  onChange={(e) => update("orderEmail", e.target.value)}
                  className={fieldClass}
                  aria-required="true"
                  aria-invalid={!!errors.orderEmail}
                  aria-describedby={errors.orderEmail ? "err-order-email" : undefined}
                />
                {errors.orderEmail && (
                  <p id="err-order-email" role="alert" className="text-destructive text-base font-medium">
                    {errors.orderEmail}
                  </p>
                )}
              </div>
            </fieldset>

            <Button
              type="submit"
              className="w-full h-16 text-xl font-bold tracking-wide gap-3"
              size="lg"
            >
              <UserPlus className="w-6 h-6" />
              DOKONČIT REGISTRACI
            </Button>
          </form>

          <footer className="mt-10 pt-6 border-t border-border text-center">
            <p className="text-base text-muted-foreground">
              Již máte B2B účet?{" "}
              <a
                href="/b2b-login"
                className="text-primary underline underline-offset-4 font-medium"
              >
                Přihlaste se
              </a>
            </p>
          </footer>
        </section>
      </main>
    </>
  );
};

export default B2BRegister;
