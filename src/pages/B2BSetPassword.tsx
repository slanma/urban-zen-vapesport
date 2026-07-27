import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, KeyRound, MailCheck, AlertCircle, Eye, EyeOff } from "lucide-react";

/**
 * B2B "Nastavit / obnovit heslo" (/b2b-heslo)
 *  - request: partner zadá e-mail → pošle se mu jednorázový odkaz
 *  - set:     po kliknutí na odkaz z e-mailu (recovery session) zadá nové heslo
 *  - expired: odkaz je propadlý / už použitý → vysvětlíme a nabídneme nový
 *
 * Chyby se zobrazují přímo ve formuláři (ne jen toastem) a česky.
 */

const MIN_LEN = 8;

/** Přeloží chybu ze Supabase do češtiny. */
function czechAuthError(code: string | null | undefined, message: string): string {
  const c = (code || "").toLowerCase();
  const m = (message || "").toLowerCase();

  if (c === "same_password" || m.includes("should be different"))
    return "Toto heslo už používáte. Zvolte prosím jiné.";
  if (c === "weak_password" || m.includes("password should be at least"))
    return `Heslo je příliš krátké — použijte alespoň ${MIN_LEN} znaků.`;
  if (c === "otp_expired" || m.includes("expired"))
    return "Platnost odkazu vypršela. Nechte si prosím poslat nový.";
  if (c === "access_denied" || m.includes("invalid") || m.includes("not found"))
    return "Odkaz už není platný — pravděpodobně byl použit. Nechte si prosím poslat nový.";
  if (c === "session_not_found" || m.includes("auth session") || m.includes("session missing"))
    return "Platnost odkazu vypršela. Nechte si prosím poslat nový a nastavte heslo hned.";
  if (c === "over_email_send_rate_limit" || m.includes("rate limit") || m.includes("too many"))
    return "Příliš mnoho pokusů po sobě. Zkuste to prosím za pár minut.";
  if (c === "user_not_found")
    return "K této adrese jsme nenašli účet. Zkontrolujte e-mail, nebo nám napište na info@vapesport.cz.";

  return message || "Něco se nepovedlo. Zkuste to prosím znovu.";
}

const B2BSetPassword = () => {
  const [mode, setMode] = useState<"request" | "sent" | "set" | "expired">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // Supabase vrací chybu propadlého odkazu v URL hashi, např.
    // #error=access_denied&error_code=otp_expired&error_description=...
    const raw = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    const params = new URLSearchParams(raw);
    const errCode = params.get("error_code") || params.get("error");
    if (errCode) {
      const desc = (params.get("error_description") || "").replace(/\+/g, " ");
      setErr(czechAuthError(errCode, decodeURIComponent(desc)));
      setMode("expired");
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setErr(null);
        setMode("set");
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setMode("set");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const sendReset = async () => {
    setErr(null);
    if (!email.trim()) {
      setErr("Zadejte prosím svůj e-mail.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/b2b-heslo`,
    });
    setLoading(false);
    if (error) {
      const msg = czechAuthError((error as any).code, error.message);
      setErr(msg);
      toast.error(msg);
      return;
    }
    setMode("sent");
  };

  const savePassword = async () => {
    setErr(null);

    if (password.length < MIN_LEN) {
      setErr(`Heslo musí mít alespoň ${MIN_LEN} znaků.`);
      return;
    }
    if (password !== password2) {
      setErr("Hesla se neshodují. Zkontrolujte prosím obě pole.");
      return;
    }

    setLoading(true);

    // Bez platné session nemá smysl posílat požadavek — odkaz mezitím propadl.
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) {
      setLoading(false);
      setErr("Platnost odkazu vypršela. Nechte si prosím poslat nový.");
      setMode("expired");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      const msg = czechAuthError((error as any).code, error.message);
      setErr(msg);
      toast.error(msg);
      return; // DŮLEŽITÉ: při chybě nepokračujeme do portálu
    }

    toast.success("Heslo nastaveno. Vítejte v portálu!");
    window.location.assign("/b2b-dashboard");
  };

  const ErrorBox = () =>
    err ? (
      <div
        role="alert"
        className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
      >
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{err}</span>
      </div>
    ) : null;

  return (
    <main className="min-h-screen bg-secondary flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md bg-background border border-border rounded-lg p-8 md:p-10 shadow-sm">
        <header className="text-center mb-8">
          <Link to="/" className="font-heading text-2xl font-bold text-foreground tracking-tight inline-block mb-6">
            Vapesport
          </Link>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
            {mode === "set"
              ? "Nastavte si nové heslo"
              : mode === "expired"
              ? "Odkaz už není platný"
              : "Přístup do B2B portálu"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "set"
              ? "Zvolte si heslo pro přihlášení do portálu."
              : mode === "sent"
              ? "Zkontrolujte svou e-mailovou schránku."
              : mode === "expired"
              ? "Pošleme vám nový — platí jednorázově a jen krátkou dobu."
              : "Zadejte e-mail a pošleme vám odkaz pro nastavení hesla."}
          </p>
        </header>

        {(mode === "request" || mode === "expired") && (
          <div className="space-y-4">
            <ErrorBox />
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.cz"
                onKeyDown={(e) => e.key === "Enter" && sendReset()}
              />
            </div>
            <Button className="w-full gap-2" onClick={sendReset} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MailCheck className="w-4 h-4" />}
              Poslat odkaz pro nastavení hesla
            </Button>
            <p className="text-center text-sm">
              <Link to="/b2b-login" className="text-primary hover:underline">
                Zpět na přihlášení
              </Link>
            </p>
          </div>
        )}

        {mode === "sent" && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <MailCheck className="w-7 h-7" />
            </div>
            <p className="text-muted-foreground">
              Poslali jsme odkaz na <strong className="text-foreground">{email}</strong>. Klikněte na něj a nastavte si
              heslo. Pokud e-mail nevidíte, zkontrolujte složku se spamem.
            </p>
            <p className="text-sm text-muted-foreground">
              Odkaz funguje jen jednou. Otevřete ho prosím v tom prohlížeči, kde chcete být přihlášeni, a heslo nastavte
              hned.
            </p>
            <Button variant="outline" className="w-full" onClick={() => setMode("request")}>
              Poslat znovu
            </Button>
          </div>
        )}

        {mode === "set" && (
          <div className="space-y-4">
            <ErrorBox />
            <div className="space-y-1.5">
              <Label htmlFor="pass">Nové heslo</Label>
              <div className="relative">
                <Input
                  id="pass"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={`Alespoň ${MIN_LEN} znaků`}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Skrýt heslo" : "Zobrazit heslo"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pass2">Heslo znovu</Label>
              <Input
                id="pass2"
                type={showPass ? "text" : "password"}
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && savePassword()}
                placeholder="Zopakujte heslo"
              />
            </div>
            <Button className="w-full gap-2" onClick={savePassword} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Nastavit heslo a pokračovat
            </Button>
          </div>
        )}
      </section>
    </main>
  );
};

export default B2BSetPassword;
