import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type AuthorizationDetails = {
  client?: { name?: string; client_id?: string; redirect_uri?: string };
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};

// Beta-only namespace; add a minimal typed wrapper.
const oauth = (supabase.auth as unknown as {
  oauth: {
    getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
    approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
    denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  };
}).oauth;

const OAuthConsent = () => {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Chybí authorization_id.");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/b2b-login?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("Autorizační server nevrátil žádnou návratovou URL.");
      return;
    }
    window.location.href = target;
  };

  if (error) {
    return (
      <main className="min-h-screen bg-secondary flex items-center justify-center px-4 py-12">
        <div className="max-w-md bg-background border border-border rounded-lg p-8">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-3">Autorizaci se nepodařilo načíst</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen bg-secondary flex items-center justify-center px-4 py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  const clientName = details.client?.name ?? "externí aplikace";

  return (
    <main className="min-h-screen bg-secondary flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md bg-background border border-border rounded-lg p-8 md:p-10 shadow-sm">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
          Propojit {clientName} s Vapesport
        </h1>
        <p className="text-muted-foreground mb-6">
          Aplikace <strong className="text-foreground">{clientName}</strong> bude moci volat nástroje Vapesport
          vaším jménem, dokud jste přihlášeni. Přístup je omezen vašimi oprávněními v systému
          (RLS pravidla).
        </p>
        {details.scope && (
          <p className="text-sm text-muted-foreground mb-6">
            Rozsah: <span className="font-mono text-foreground">{details.scope}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
            {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Povolit
          </Button>
          <Button className="flex-1" variant="outline" disabled={busy} onClick={() => decide(false)}>
            Zamítnout
          </Button>
        </div>
      </section>
    </main>
  );
};

export default OAuthConsent;
