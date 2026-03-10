import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const B2BRegister = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    companyName: "",
    ico: "",
    dic: "",
    contactName: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setGlobalError("");
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = "Zadejte přihlašovací e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Neplatný formát e-mailu.";
    if (!form.password) errs.password = "Zadejte heslo.";
    else if (form.password.length < 8) errs.password = "Heslo musí mít alespoň 8 znaků.";
    if (!form.companyName) errs.companyName = "Zadejte název firmy.";
    if (!form.ico) errs.ico = "Zadejte IČO.";
    else if (!/^\d{8}$/.test(form.ico)) errs.ico = "IČO musí mít 8 číslic.";
    if (!form.contactName) errs.contactName = "Zadejte kontaktní osobu.";
    if (!form.phone) errs.phone = "Zadejte telefonní číslo.";
    if (!form.address) errs.address = "Zadejte adresu.";
    if (!form.city) errs.city = "Zadejte město.";
    if (!form.zip) errs.zip = "Zadejte PSČ.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setGlobalError("");

    // 1. Create auth user
    const { user, error: signUpError } = await signUp(form.email, form.password);

    if (signUpError) {
      setLoading(false);
      if (signUpError.message.includes("already registered")) {
        setGlobalError("Tento e-mail je již zaregistrován. Přihlaste se nebo použijte jiný e-mail.");
      } else {
        setGlobalError("Registrace se nezdařila. Zkuste to prosím znovu.");
      }
      return;
    }

    if (!user) {
      setLoading(false);
      setGlobalError("Registrace se nezdařila. Zkuste to prosím znovu.");
      return;
    }

    // 2. Create B2B profile
    const { error: profileError } = await supabase.from("b2b_profiles").insert({
      user_id: user.id,
      company_name: form.companyName,
      ico: form.ico,
      dic: form.dic || null,
      contact_person: form.contactName,
      phone: form.phone,
      address: form.address,
      city: form.city,
      zip: form.zip,
    });

    setLoading(false);

    if (profileError) {
      setGlobalError("Profil se nepodařilo vytvořit. Kontaktujte nás prosím.");
      return;
    }

    // 3. Send webhook notification (fire and forget)
    supabase.functions.invoke('notify-b2b-registration', {
      body: {
        companyName: form.companyName,
        ico: form.ico,
        dic: form.dic,
        contactPerson: form.contactName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        zip: form.zip,
      },
    }).catch((err) => console.error('Webhook notification failed:', err));

    // Sign out after registration (pending approval)
    await supabase.auth.signOut();
    setSuccess(true);
  };

  if (success) {
    return (
      <main className="min-h-screen bg-secondary flex items-center justify-center px-4 py-12">
        <section className="w-full max-w-lg bg-background border border-border rounded-lg p-8 md:p-10 shadow-sm text-center">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
            Registrace dokončena!
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Vaše žádost o B2B partnerský účet byla odeslána ke schválení.
          </p>
          <p className="text-base text-muted-foreground mb-8">
            O schválení vás budeme informovat na e-mail <strong className="text-foreground">{form.email}</strong>.
          </p>
          <Button size="lg" className="h-14 text-lg font-bold" onClick={() => navigate("/b2b-login")}>
            Zpět na přihlášení
          </Button>
        </section>
      </main>
    );
  }

  const fieldClass = "h-14 text-lg px-4 bg-secondary border-border focus-visible:ring-primary";

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
            description: "Český výrobce cyklobrašen a příslušenství pro elektrokola a gravel od roku 1994.",
            foundingDate: "1994",
            contactPoint: { "@type": "ContactPoint", contactType: "B2B wholesale registration", availableLanguage: ["cs", "en"] },
          }),
        }}
      />

      <main className="min-h-screen bg-secondary flex items-center justify-center px-4 py-12">
        <section
          aria-labelledby="b2b-register-heading"
          className="w-full max-w-lg bg-background border border-border rounded-lg p-8 md:p-10 shadow-sm"
        >
          <header className="text-center mb-8">
            <Link to="/" className="font-heading text-2xl font-bold text-foreground tracking-tight inline-block mb-6">
              Vapesport
            </Link>
            <h1 id="b2b-register-heading" className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
              B2B Registrace
            </h1>
            <p className="text-lg text-muted-foreground">
              Vytvořte si svůj velkoobchodní partnerský účet.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Section 1: Credentials */}
            <fieldset className="space-y-5" disabled={loading}>
              <legend className="text-xl font-heading font-bold text-foreground mb-1">
                Přihlašovací údaje
              </legend>

              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-base font-semibold text-foreground block">Přihlašovací e-mail</Label>
                <Input id="reg-email" type="email" autoComplete="email" placeholder="vas@email.cz" value={form.email} onChange={(e) => update("email", e.target.value)} className={fieldClass} aria-required="true" aria-invalid={!!errors.email} />
                {errors.email && <p role="alert" className="text-destructive text-base font-medium">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-base font-semibold text-foreground block">Heslo</Label>
                <div className="relative">
                  <Input id="reg-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Minimálně 8 znaků" value={form.password} onChange={(e) => update("password", e.target.value)} className={`${fieldClass} pr-14`} aria-required="true" aria-invalid={!!errors.password} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1" aria-label={showPassword ? "Skrýt heslo" : "Zobrazit heslo"}>
                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
                {errors.password && <p role="alert" className="text-destructive text-base font-medium">{errors.password}</p>}
              </div>
            </fieldset>

            {/* Section 2: Company details */}
            <fieldset className="space-y-5" disabled={loading}>
              <legend className="text-xl font-heading font-bold text-foreground mb-1">
                Firemní údaje
              </legend>

              <div className="space-y-2">
                <Label htmlFor="reg-company" className="text-base font-semibold text-foreground block">Název firmy</Label>
                <Input id="reg-company" type="text" placeholder="Název vaší firmy" value={form.companyName} onChange={(e) => update("companyName", e.target.value)} className={fieldClass} aria-required="true" aria-invalid={!!errors.companyName} />
                {errors.companyName && <p role="alert" className="text-destructive text-base font-medium">{errors.companyName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-ico" className="text-base font-semibold text-foreground block">IČO</Label>
                  <Input id="reg-ico" type="text" placeholder="12345678" value={form.ico} onChange={(e) => update("ico", e.target.value)} className={fieldClass} aria-required="true" aria-invalid={!!errors.ico} maxLength={8} />
                  {errors.ico && <p role="alert" className="text-destructive text-base font-medium">{errors.ico}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-dic" className="text-base font-semibold text-foreground block">DIČ <span className="text-muted-foreground font-normal">(nepovinné)</span></Label>
                  <Input id="reg-dic" type="text" placeholder="CZ12345678" value={form.dic} onChange={(e) => update("dic", e.target.value)} className={fieldClass} />
                </div>
              </div>
            </fieldset>

            {/* Section 3: Contact */}
            <fieldset className="space-y-5" disabled={loading}>
              <legend className="text-xl font-heading font-bold text-foreground mb-1">
                Kontaktní údaje
              </legend>

              <div className="space-y-2">
                <Label htmlFor="reg-contact" className="text-base font-semibold text-foreground block">Kontaktní osoba</Label>
                <Input id="reg-contact" type="text" autoComplete="name" placeholder="Jméno a příjmení" value={form.contactName} onChange={(e) => update("contactName", e.target.value)} className={fieldClass} aria-required="true" aria-invalid={!!errors.contactName} />
                {errors.contactName && <p role="alert" className="text-destructive text-base font-medium">{errors.contactName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-phone" className="text-base font-semibold text-foreground block">Telefon</Label>
                <Input id="reg-phone" type="tel" autoComplete="tel" placeholder="+420 123 456 789" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={fieldClass} aria-required="true" aria-invalid={!!errors.phone} />
                {errors.phone && <p role="alert" className="text-destructive text-base font-medium">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-address" className="text-base font-semibold text-foreground block">Adresa</Label>
                <Input id="reg-address" type="text" autoComplete="street-address" placeholder="Ulice a číslo popisné" value={form.address} onChange={(e) => update("address", e.target.value)} className={fieldClass} aria-required="true" aria-invalid={!!errors.address} />
                {errors.address && <p role="alert" className="text-destructive text-base font-medium">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-city" className="text-base font-semibold text-foreground block">Město</Label>
                  <Input id="reg-city" type="text" autoComplete="address-level2" placeholder="Město" value={form.city} onChange={(e) => update("city", e.target.value)} className={fieldClass} aria-required="true" aria-invalid={!!errors.city} />
                  {errors.city && <p role="alert" className="text-destructive text-base font-medium">{errors.city}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-zip" className="text-base font-semibold text-foreground block">PSČ</Label>
                  <Input id="reg-zip" type="text" autoComplete="postal-code" placeholder="12345" value={form.zip} onChange={(e) => update("zip", e.target.value)} className={fieldClass} aria-required="true" aria-invalid={!!errors.zip} maxLength={5} />
                  {errors.zip && <p role="alert" className="text-destructive text-base font-medium">{errors.zip}</p>}
                </div>
              </div>
            </fieldset>

            {globalError && (
              <p role="alert" className="text-destructive text-base font-medium">{globalError}</p>
            )}

            <Button type="submit" className="w-full h-16 text-xl font-bold tracking-wide gap-3" size="lg" disabled={loading}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UserPlus className="w-6 h-6" />}
              {loading ? "REGISTRACE..." : "DOKONČIT REGISTRACI"}
            </Button>
          </form>

          <footer className="mt-10 pt-6 border-t border-border text-center">
            <p className="text-base text-muted-foreground">
              Již máte B2B účet?{" "}
              <Link to="/b2b-login" className="text-primary underline underline-offset-4 font-medium">
                Přihlaste se
              </Link>
            </p>
          </footer>
        </section>
      </main>
    </>
  );
};

export default B2BRegister;
