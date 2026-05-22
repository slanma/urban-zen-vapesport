import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
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

    const { error: authError } = await signIn(email, password);
    if (authError) {
      setLoading(false);
      setError("Nesprávný e-mail nebo heslo.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setError("Přihlášení se nezdařilo.");
      return;
    }

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });

    setLoading(false);

    if (!isAdmin) {
      setError("Nemáte oprávnění pro přístup do administrace.");
      await supabase.auth.signOut();
      return;
    }

    navigate("/admin");
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <section aria-labelledby="admin-login-heading" className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h1 id="admin-login-heading" className="text-2xl font-heading font-bold text-foreground">
            Administrace
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="admin-email" className="text-sm font-semibold text-foreground block">E-mail</Label>
            <Input id="admin-email" type="email" autoComplete="email" placeholder="admin@vapesport.cz" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} className="h-12 text-base px-4 bg-secondary border-border focus-visible:ring-foreground" aria-required="true" disabled={loading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-sm font-semibold text-foreground block">Heslo</Label>
            <div className="relative">
              <Input id="admin-password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} className="h-12 text-base px-4 pr-12 bg-secondary border-border focus-visible:ring-foreground" aria-required="true" disabled={loading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1" aria-label={showPassword ? "Skrýt heslo" : "Zobrazit heslo"}>
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && <p role="alert" className="text-destructive text-sm font-medium">{error}</p>}

          <Button type="submit" className="w-full h-14 text-base font-bold tracking-wide bg-foreground text-background hover:bg-foreground/90" size="lg" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {loading ? "OVĚŘOVÁNÍ..." : "VSTOUPIT DO ADMINISTRACE"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/ucet"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zpět na účet
          </Link>
        </div>
      </section>
    </main>
  );
};

export default AdminLogin;
