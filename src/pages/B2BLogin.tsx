import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn } from "lucide-react";

const B2BLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vyplňte prosím všechna pole.");
      return;
    }
    // Demo: navigate to dashboard
    navigate("/b2b-dashboard");
  };

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
            address: {
              "@type": "PostalAddress",
              addressCountry: "CZ",
            },
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "B2B wholesale",
              availableLanguage: ["cs", "en"],
            },
          }),
        }}
      />

      <main className="min-h-screen bg-secondary flex items-center justify-center px-4 py-12">
        <section
          aria-labelledby="b2b-login-heading"
          className="w-full max-w-md bg-background border border-border rounded-lg p-8 md:p-10 shadow-sm"
        >
          <header className="text-center mb-8">
            <a
              href="/"
              className="font-heading text-2xl font-bold text-foreground tracking-tight inline-block mb-6"
            >
              Vapesport
            </a>
            <h1
              id="b2b-login-heading"
              className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2"
            >
              B2B Velkoobchodní portál
            </h1>
            <p className="text-lg text-muted-foreground">
              Přihlaste se ke svému partnerskému účtu.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <Label
                htmlFor="b2b-email"
                className="text-base font-semibold text-foreground block"
              >
                E-mailová adresa
              </Label>
              <Input
                id="b2b-email"
                type="email"
                autoComplete="email"
                placeholder="vas@email.cz"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className="h-14 text-lg px-4 bg-secondary border-border focus-visible:ring-primary"
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="b2b-password"
                className="text-base font-semibold text-foreground block"
              >
                Heslo
              </Label>
              <div className="relative">
                <Input
                  id="b2b-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="h-14 text-lg px-4 pr-14 bg-secondary border-border focus-visible:ring-primary"
                  aria-required="true"
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
            </div>

            {error && (
              <p role="alert" className="text-destructive text-base font-medium">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-16 text-xl font-bold tracking-wide gap-3"
              size="lg"
            >
              <LogIn className="w-6 h-6" />
              PŘIHLÁSIT SE
            </Button>

            <div className="text-center pt-2">
              <a
                href="#"
                className="text-lg text-primary underline underline-offset-4 hover:text-primary/80 font-medium transition-colors"
              >
                Zapomenuté heslo?
              </a>
            </div>
          </form>

          <footer className="mt-10 pt-6 border-t border-border text-center">
            <p className="text-base text-muted-foreground">
              Nemáte B2B účet?{" "}
              <a
                href="#"
                className="text-primary underline underline-offset-4 font-medium"
              >
                Kontaktujte nás
              </a>
            </p>
          </footer>
        </section>
      </main>
    </>
  );
};

export default B2BLogin;
