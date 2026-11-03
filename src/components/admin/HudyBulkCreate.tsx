import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Users, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Admin → Nový partner → „Prodejny HUDY sport“
 * Načte prodejny ze skupiny „hudy“ v newsletteru, které ještě nemají
 * B2B účet, a jedním tlačítkem jim založí účty se slevou 10 %.
 * Každá prodejna dostane e-mail s odkazem na nastavení hesla.
 * Po prvním přihlášení musí vyplnit fakturační údaje.
 */
type Pending = { email: string; company_name: string | null; city: string | null; address: string | null; zip: string | null; phone: string | null };
type RowState = "ceka" | "zaklada" | "hotovo" | "chyba";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const HudyBulkCreate = () => {
  const [list, setList] = useState<Pending[] | null>(null);
  const [state, setState] = useState<Record<string, { s: RowState; msg?: string }>>({});
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const token = async () => (await supabase.auth.getSession()).data.session?.access_token ?? "";

  const load = async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/create-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: await token(), action: "hudy_pending" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Načtení se nezdařilo.");
      setList(data.pending || []);
      setState({});
    } catch (e: any) {
      setErr(String(e?.message || e));
    }
    setLoading(false);
  };

  const run = async () => {
    if (!list?.length) return;
    setRunning(true);
    for (const c of list) {
      if (state[c.email]?.s === "hotovo") continue;
      setState((s) => ({ ...s, [c.email]: { s: "zaklada" } }));
      try {
        const res = await fetch("/api/create-partner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: await token(),
            company_name: c.company_name || c.email,
            invoice_email: c.email,
            city: c.city || "",
            address: c.address || "",
            zip: c.zip || "",
            phone: c.phone || "",
            discount_percent: 10,
            free_shipping: false,
            notes: "Založeno hromadně – síť HUDY sport",
            send_email: sendEmail,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Nezdařilo se.");
        const msg = sendEmail && !data.email_sent ? "účet ano, e-mail neodešel" : undefined;
        setState((s) => ({ ...s, [c.email]: { s: msg ? "chyba" : "hotovo", msg } }));
      } catch (e: any) {
        setState((s) => ({ ...s, [c.email]: { s: "chyba", msg: String(e?.message || e) } }));
      }
      await sleep(700);
    }
    setRunning(false);
  };

  const done = list ? list.filter((c) => state[c.email]?.s === "hotovo").length : 0;

  return (
    <div className="bg-background border border-border rounded-lg p-6 space-y-4">
      <div>
        <h2 className="text-lg font-heading font-bold text-foreground">Prodejny HUDY sport</h2>
        <p className="text-sm text-muted-foreground">
          Založí účty všem prodejnám ze skupiny „hudy“ v newsletteru, které ještě účet nemají. Sleva 10 %,
          v B2B uvidí jen návleky. Po nastavení hesla musí vyplnit fakturační údaje.
        </p>
      </div>

      {list === null ? (
        <Button variant="outline" className="gap-2" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
          Načíst prodejny Hudy
        </Button>
      ) : list.length === 0 ? (
        <p className="text-sm">Všechny prodejny Hudy už účet mají.</p>
      ) : (
        <>
          <ul className="text-sm divide-y divide-border border border-border rounded-md max-h-80 overflow-auto">
            {list.map((c) => {
              const st = state[c.email];
              return (
                <li key={c.email} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span>
                    {c.company_name} <span className="text-muted-foreground">· {c.email}</span>
                  </span>
                  <span className="shrink-0 flex items-center gap-1">
                    {st?.s === "zaklada" && <Loader2 className="w-4 h-4 animate-spin" />}
                    {st?.s === "hotovo" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    {st?.s === "chyba" && (
                      <span className="text-destructive flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {st.msg}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} disabled={running} />
            Poslat každé prodejně e-mail s odkazem na nastavení hesla
          </label>
          <div className="flex items-center gap-3">
            <Button className="gap-2" onClick={run} disabled={running}>
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              Založit účty ({list.length})
            </Button>
            {Object.keys(state).length > 0 && (
              <span className="text-sm text-muted-foreground">
                Hotovo {done} z {list.length}
              </span>
            )}
          </div>
        </>
      )}
      {err && <p className="text-sm text-destructive">{err}</p>}
    </div>
  );
};

export default HudyBulkCreate;
