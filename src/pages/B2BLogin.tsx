import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const LOGIN_TIMEOUT_MS = 15000;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

interface PasswordLoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: { id: string; email?: string };
  error?: string;
  error_description?: string;
  msg?: string;
}

const withTimeout = async <T,>(promise: PromiseLike<T>, message: string): Promise<T> => {
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), LOGIN_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
};

const getAuthStorageKey = () => {
  const host = new URL(SUPABASE_URL).host;
  const projectRef = host.split(".")[0];
  return `sb-${projectRef}-auth-token`;
};

const fetchJsonWithTimeout = async <T,>(url: string, init: RequestInit, message: string): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), LOGIN_TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const errorPayload = payload as Partial<PasswordLoginResponse> | null;
      throw new Error(errorPayload?.error_description || errorPayload?.msg || errorPayload?.error || `HTTP ${response.status}`);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw new Error(message);
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const persistAuthSession = (authData: PasswordLoginResponse) => {
  const expiresAt = authData.expires_at ?? Math.floor(Date.now() / 1000) + authData.expires_in;
  window.localStorage.setItem(
    getAuthStorageKey(),
    JSON.stringify({
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      expires_in: authData.expires_in,
      expires_at: expiresAt,
      token_type: authData.token_type || "bearer",
      user: authData.user,
    })
  );
};

const B2BLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vyplňte prosím všechna pole.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } = await withTimeout(
        supabase.auth.signInWithPassword({ email: email.trim(), password }),
        "Přihlášení trvá příliš dlouho. Zkuste to prosím znovu."
      );

      if (authError) {
        console.error("[B2BLogin] signIn error:", authError);
        const msg = authError.message || "";
        if (msg.includes("Invalid login")) {
          setError("Nesprávný e-mail nebo heslo.");
        } else if (msg.includes("Email not confirmed")) {
          setError("Váš e-mail ještě nebyl potvrzen. Zkontrolujte svou schránku.");
        } else {
          setError(`Přihlášení se nezdařilo: ${msg}`);
        }
        return;
      }

      const user = authData.user;
      if (!user) {
        setError("Přihlášení se nezdařilo (relace).");
        return;
      }

      const { data: profile, error: profileErr } = await withTimeout(
        supabase
          .from("b2b_profiles")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle(),
        "Ověření B2B účtu trvá příliš dlouho. Zkuste to prosím znovu."
      );

      if (profileErr) {
        console.error("[B2BLogin] b2b profile error:", profileErr);
        setError(`Nelze ověřit B2B profil: ${profileErr.message}`);
        return;
      }

      const status = profile?.status;

      if (!status) {
        setError("K tomuto e-mailu nemáme B2B profil. Zaregistrujte se jako B2B partner.");
        void supabase.auth.signOut();
        return;
      }

      if (status === "pending") {
        setError("Vaše registrace čeká na schválení.");
        void supabase.auth.signOut();
        return;
      }

      if (status === "rejected") {
        setError("Vaše B2B registrace byla zamítnuta.");
        void supabase.auth.signOut();
        return;
      }

      navigate("/b2b-dashboard", { replace: true });
    } catch (err) {
      console.error("[B2BLogin] unexpected error:", err);
      setError(`Neočekávaná chyba: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
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
            description: "Český výrobce cyklobrašen a příslušenství pro elektrokola a gravel od roku 1994.",
            foundingDate: "1994",
            address: { "@type": "PostalAddress", addressCountry: "CZ" },
            contactPoint: { "@type": "ContactPoint", contactType: "B2B wholesale", availableLanguage: ["cs", "en"] },
          }),
        }}
      />

      <main className="min-h-screen bg-secondary flex items-center justify-center px-4 py-12">
        <section
          aria-labelledby="b2b-login-heading"
          className="w-full max-w-md bg-background border border-border rounded-lg p-8 md:p-10 shadow-sm"
        >
          <header className="text-center mb-8">
            <Link
              to="/"
              className="font-heading text-2xl font-bold text-foreground tracking-tight inline-block mb-6"
            >
              Vapesport
            </Link>
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
              <Label htmlFor="b2b-email" className="text-base font-semibold text-foreground block">
                E-mailová adresa
              </Label>
              <Input
                id="b2b-email"
                type="email"
                autoComplete="email"
                placeholder="vas@email.cz"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="h-14 text-lg px-4 bg-secondary border-border focus-visible:ring-primary"
                aria-required="true"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="b2b-password" className="text-base font-semibold text-foreground block">
                Heslo
              </Label>
              <div className="relative">
                <Input
                  id="b2b-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="h-14 text-lg px-4 pr-14 bg-secondary border-border focus-visible:ring-primary"
                  aria-required="true"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? "Skrýt heslo" : "Zobrazit heslo"}
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
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
              disabled={loading}
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogIn className="w-6 h-6" />}
              {loading ? "PŘIHLAŠOVÁNÍ..." : "PŘIHLÁSIT SE"}
            </Button>
          </form>

          <footer className="mt-10 pt-6 border-t border-border text-center space-y-3">
            <p className="text-base text-muted-foreground">
              Nemáte ještě B2B účet?{" "}
              <Link
                to="/b2b-register"
                className="text-primary underline underline-offset-4 font-semibold hover:text-primary/80 transition-colors"
              >
                Registrujte se
              </Link>
            </p>
          </footer>
        </section>
      </main>
    </>
  );
};

export default B2BLogin;
