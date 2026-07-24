import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Inbox, Trash2, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Poptavka {
  id: string;
  company: string | null;
  email: string;
  phone: string | null;
  web: string | null;
  message: string | null;
  services: { name: string; price: string }[] | null;
  price_once: number;
  price_month: number;
  has_custom: boolean;
  status: string;
  created_at: string;
}

const getToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || "";
};

const api = async (payload: Record<string, unknown>) => {
  const token = await getToken();
  const res = await fetch("/api/poptavka", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, token }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Chyba ${res.status}`);
  return data;
};

const fmt = (n: number) => Math.round(n).toLocaleString("cs-CZ");
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

const AdminPoptavky = () => {
  const [items, setItems] = useState<Poptavka[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api({ action: "list" });
      setItems(r.poptavky || []);
    } catch (e: any) {
      toast.error(e.message || "Načtení selhalo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleStatus = async (p: Poptavka) => {
    const status = p.status === "handled" ? "new" : "handled";
    setItems((list) => list.map((x) => (x.id === p.id ? { ...x, status } : x)));
    try {
      await api({ action: "status", id: p.id, status });
    } catch (e: any) {
      toast.error(e.message || "Uložení selhalo");
      load();
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Opravdu smazat tuto poptávku?")) return;
    try {
      await api({ action: "delete", id });
      setItems((list) => list.filter((x) => x.id !== id));
      toast.success("Smazáno");
    } catch (e: any) {
      toast.error(e.message || "Mazání selhalo");
    }
  };

  const newCount = items.filter((p) => p.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Inbox className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-heading font-bold text-foreground">Poptávky</h1>
        {newCount > 0 && (
          <span className="ml-1 text-xs font-bold bg-primary text-primary-foreground rounded-full px-2 py-0.5">{newCount} nové</span>
        )}
      </div>

      {loading ? (
        <div className="bg-background border border-border rounded-lg p-8 text-center flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Načítám…
        </div>
      ) : items.length === 0 ? (
        <div className="bg-background border border-border rounded-lg p-8 text-center text-muted-foreground">
          Zatím žádné poptávky. Objeví se tu, jakmile někdo odešle kalkulačku na stránce Aplikace a služby.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <div
              key={p.id}
              className={`bg-background border rounded-lg p-5 ${p.status === "new" ? "border-primary/60" : "border-border"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-foreground text-lg">{p.company || "—"}</span>
                    {p.status === "new" ? (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 rounded px-2 py-0.5">Nová</span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted rounded px-2 py-0.5">Vyřízeno</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{fmtDate(p.created_at)}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toggleStatus(p)}>
                    <Check className="w-3.5 h-3.5" /> {p.status === "handled" ? "Označit jako novou" : "Vyřízeno"}
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => remove(p.id)}>
                    <Trash2 className="w-3.5 h-3.5" /> Smazat
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mt-3 text-sm">
                <div><span className="text-muted-foreground">E-mail: </span><a className="text-primary hover:underline" href={`mailto:${p.email}`}>{p.email}</a></div>
                <div><span className="text-muted-foreground">Telefon: </span>{p.phone ? <a className="text-primary hover:underline" href={`tel:${p.phone}`}>{p.phone}</a> : "—"}</div>
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Web: </span>
                  {p.web ? (
                    <a className="text-primary hover:underline inline-flex items-center gap-1" href={p.web.startsWith("http") ? p.web : `https://${p.web}`} target="_blank" rel="noreferrer">
                      {p.web} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : "—"}
                </div>
              </div>

              {p.message ? (
                <p className="mt-3 text-sm text-foreground bg-muted/40 rounded-md px-3 py-2 italic">„{p.message}“</p>
              ) : null}

              <div className="mt-3 border-t border-border pt-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Poptávané služby</span>
                <ul className="mt-1.5 space-y-0.5">
                  {(p.services || []).map((s, i) => (
                    <li key={i} className="text-sm text-foreground flex justify-between gap-4">
                      <span>{s.name}</span>
                      <span className="text-muted-foreground whitespace-nowrap">{s.price}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex flex-wrap gap-x-6 text-sm font-medium">
                  <span>Jednorázově: <strong>{fmt(p.price_once)} Kč</strong> <span className="text-muted-foreground font-normal">bez DPH</span></span>
                  <span>Měsíčně: <strong>{fmt(p.price_month)} Kč</strong> <span className="text-muted-foreground font-normal">bez DPH</span></span>
                  {p.has_custom ? <span className="text-primary">+ e-shop na míru</span> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPoptavky;
