import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, KeyRound, MailCheck } from "lucide-react";

/**
 * B2B "Nastavit / obnovit heslo" (/b2b-heslo)
 *  - request: partner zadá e-mail → pošle se mu jednorázový odkaz
 *  - set:     po kliknutí na odkaz z e-mailu (recovery session) zadá nové heslo
 */
const B2BSetPassword = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"request" | "sent" | "set">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setMode("set");
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setMode("set");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const sendReset = async () => {
    if (!email.trim()) {
      toast.error("Zadejte prosím svůj e-mail.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/b2b-heslo`,
    });
    setLoading(false);
    if (error) {
      toast.error("Odeslání se nezdařilo", { description: error.message });
      return;
    }
    setMode("sent");
  };

  const savePassword = async () => {
    if (password.length < 8) {
      toast.error("Heslo musí mít alespoň 8 znaků.");
      return;
    }
    if (password !== password2) {
      toast.error("Hesla se neshodují.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setLoading(false);
      toast.error("Nastavení hesla se nezdařilo", { description: error.message });
      return;
    }
    await supabase.auth.signOut();
    setLoading(false);
    toast.success("Heslo nastaveno. Nyní se přihlaste.");
    navigate("/b2b-login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-secondary flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md bg-background border border-border rounded-lg p-8 md:p-10 shadow-sm">
        <header className="text-center mb-8">
          <Link to="/" className="font-heading text-2xl font-bold text-foreground tracking-tight inline-block mb-6">
            Vapesport
          </Link>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
            {mode === "set" ? "Nastavte si nové heslo" : "Přístup do B2B portálu"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "set"
              ? "Zvolte si heslo pro přihlášení do portálu."
              : mode === "sent"
              ? "Zkontrolujte svou e-mailovou schránku."
              : "Zadejte e-mail a pošleme vám odkaz pro nastavení hesla."}
          </p>
        </header>

        {mode === "request" && (
          <div className="space-y-4">
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
              <Link to="/b2b-login" className="text-primary hover:underline">Zpět na přihlášení</Link>
            </p>
          </div>
        )}

        {mode === "sent" && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <MailCheck className="w-7 h-7" />
            </div>
            <p className="text-muted-foreground">
              Poslali jsme odkaz na <strong className="text-foreground">{email}</strong>. Klikněte na něj a nastavte si heslo.
              Pokud e-mail nevidíte, zkontrolujte složku se spamem.
            </p>
            <Button variant="outline" className="w-full" onClick={() => setMode("request")}>
              Poslat znovu
            </Button>
          </div>
        )}

        {mode === "set" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pass">Nové heslo</Label>
              <Input id="pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Alespoň 8 znaků" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pass2">Heslo znovu</Label>
              <Input id="pass2" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} onKeyDown={(e) => e.key === "Enter" && savePassword()} placeholder="Zopakujte heslo" />
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
