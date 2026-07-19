import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useB2BPartner } from "@/hooks/useB2BPartner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { User as UserIcon, LogOut, Mail } from "lucide-react";

const Account = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const { isPartner } = useB2BPartner();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) toast.error(error.message);
        else toast.success("Přihlášeno");
      } else {
        const { error } = await signUp(email, password);
        if (error) toast.error(error.message);
        else toast.success("Registrace odeslána. Zkontrolujte e-mail.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Přihlášený B2B partner má „účet“ = svůj B2B profil (nástěnka).
  if (isPartner) return <Navigate to="/b2b-nastenka" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={!!user} />
      <main className="max-w-md mx-auto px-6 pt-32 pb-20">
        <h1 className="font-heading text-3xl font-bold mb-8 text-foreground">Můj účet</h1>

        {loading ? (
          <p className="text-muted-foreground">Načítám…</p>
        ) : user ? (
          <div className="space-y-6 border border-border rounded-lg p-6 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Přihlášen jako</p>
                <p className="font-medium text-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                await signOut();
                toast.success("Odhlášeno");
              }}
            >
              <LogOut className="w-4 h-4 mr-2" /> Odhlásit se
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-lg p-6 bg-card">
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 py-2 text-sm font-medium rounded ${mode === "login" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
              >
                Přihlášení
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 py-2 text-sm font-medium rounded ${mode === "register" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
              >
                Registrace
              </button>
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Heslo</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Odesílám…" : mode === "login" ? "Přihlásit se" : "Vytvořit účet"}
            </Button>
            <div className="space-y-2 text-center">
              <p className="text-xs text-muted-foreground">
                B2B zákazník?{" "}
                <a href="/b2b-login" className="underline hover:text-primary">
                  B2B portál
                </a>
              </p>
              <p className="text-xs text-muted-foreground">
                Administrace?{" "}
                <a href="/admin-login" className="underline hover:text-primary">
                  Přihlášení do administrace
                </a>
              </p>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default Account;
