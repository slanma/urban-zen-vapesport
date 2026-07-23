import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Trash2, Eye, Send, Plus, History } from "lucide-react";
import { toast } from "sonner";

interface Newsletter {
  id: string;
  subject: string;
  html: string;
  created_at: string;
}
interface SendRecord {
  id: string;
  subject: string;
  discount_min: number;
  discount_max: number;
  recipient_count: number;
  sent_at: string;
}

const getToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || "";
};

const api = async (path: string, payload: Record<string, unknown>) => {
  const token = await getToken();
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, token }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Chyba ${res.status}`);
  return data;
};

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

const AdminNewsletters = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [history, setHistory] = useState<SendRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [saving, setSaving] = useState(false);

  const [previewId, setPreviewId] = useState<string | null>(null);

  // odesílání
  const [sendTarget, setSendTarget] = useState<Newsletter | null>(null);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState<number | null>(null);
  const [counting, setCounting] = useState(false);
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [nl, hist] = await Promise.all([
        api("/api/newsletters", { action: "list" }),
        api("/api/newsletters", { action: "history" }),
      ]);
      setNewsletters(nl.newsletters || []);
      setHistory(hist.history || []);
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

  const handleSave = async () => {
    if (!subject.trim() || !html.trim()) {
      toast.error("Vyplň předmět i HTML obsah.");
      return;
    }
    setSaving(true);
    try {
      await api("/api/newsletters", { action: "create", subject, html });
      toast.success("Newsletter uložen");
      setSubject("");
      setHtml("");
      load();
    } catch (e: any) {
      toast.error(e.message || "Uložení selhalo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Opravdu smazat tento newsletter?")) return;
    try {
      await api("/api/newsletters", { action: "delete", id });
      setNewsletters((n) => n.filter((x) => x.id !== id));
      if (previewId === id) setPreviewId(null);
      toast.success("Smazáno");
    } catch (e: any) {
      toast.error(e.message || "Mazání selhalo");
    }
  };

  const openSend = (nl: Newsletter) => {
    setSendTarget(nl);
    setMin(0);
    setMax(100);
    setCount(null);
  };

  const applyPreset = (lo: number, hi: number) => {
    setMin(lo);
    setMax(hi);
    setCount(null);
  };

  const doCount = async () => {
    setCounting(true);
    try {
      const r = await api("/api/send-newsletter", { action: "count", discount_min: min, discount_max: max });
      setCount(r.count);
    } catch (e: any) {
      toast.error(e.message || "Spočítání selhalo");
    } finally {
      setCounting(false);
    }
  };

  const doSend = async () => {
    if (!sendTarget) return;
    if (!window.confirm(`Opravdu rozeslat „${sendTarget.subject}" na ${count ?? "?"} příjemců?`)) return;
    setSending(true);
    try {
      const r = await api("/api/send-newsletter", {
        action: "send",
        newsletter_id: sendTarget.id,
        subject: sendTarget.subject,
        html: sendTarget.html,
        discount_min: min,
        discount_max: max,
      });
      toast.success(`Odesláno ${r.sent} příjemcům`);
      setSendTarget(null);
      load();
    } catch (e: any) {
      toast.error(e.message || "Odeslání selhalo");
    } finally {
      setSending(false);
    }
  };

  const previewNl = newsletters.find((n) => n.id === previewId);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Mail className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-heading font-bold text-foreground">Newslettery</h1>
      </div>

      {/* Nový newsletter */}
      <section className="bg-background border border-border rounded-lg p-5 space-y-3">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nový newsletter
        </h2>
        <Input
          placeholder="Předmět e-mailu"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          placeholder="Sem vlož HTML newsletteru (např. vygenerované v Claude Design)…"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={10}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono min-h-[160px] focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Uložit newsletter
          </Button>
        </div>
      </section>

      {/* Uložené newslettery */}
      <section className="space-y-3">
        <h2 className="font-semibold text-foreground">Uložené newslettery</h2>
        {loading ? (
          <div className="bg-background border border-border rounded-lg p-8 text-center flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Načítám…
          </div>
        ) : newsletters.length === 0 ? (
          <div className="bg-background border border-border rounded-lg p-8 text-center text-muted-foreground">
            Zatím žádné newslettery. Vytvoř první výše.
          </div>
        ) : (
          <div className="space-y-2">
            {newsletters.map((nl) => (
              <div key={nl.id} className="bg-background border border-border rounded-lg p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <span className="font-medium text-foreground block">{nl.subject}</span>
                  <span className="text-xs text-muted-foreground">{fmtDate(nl.created_at)}</span>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setPreviewId(previewId === nl.id ? null : nl.id)}>
                  <Eye className="w-3.5 h-3.5" /> Náhled
                </Button>
                <Button size="sm" className="gap-1.5" onClick={() => openSend(nl)}>
                  <Send className="w-3.5 h-3.5" /> Rozeslat
                </Button>
                <Button size="sm" variant="ghost" className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(nl.id)}>
                  <Trash2 className="w-3.5 h-3.5" /> Smazat
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Náhled */}
      {previewNl && (
        <section className="space-y-2">
          <h2 className="font-semibold text-foreground">Náhled: {previewNl.subject}</h2>
          <iframe
            title="Náhled newsletteru"
            srcDoc={previewNl.html}
            className="w-full h-[500px] bg-white border border-border rounded-lg"
          />
        </section>
      )}

      {/* Odesílání */}
      {sendTarget && (
        <section className="bg-background border-2 border-primary rounded-lg p-5 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Send className="w-4 h-4" /> Rozeslat: {sendTarget.subject}
          </h2>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Komu poslat (podle výše slevy):</p>
            <div className="flex flex-wrap gap-1 mb-3">
              <Button size="sm" variant={min === 0 && max === 100 ? "default" : "outline"} onClick={() => applyPreset(0, 100)}>Všichni</Button>
              <Button size="sm" variant={min === 0 && max === 0 ? "default" : "outline"} onClick={() => applyPreset(0, 0)}>Bez slevy</Button>
              <Button size="sm" variant={min === 1 && max === 100 ? "default" : "outline"} onClick={() => applyPreset(1, 100)}>Se slevou</Button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Sleva od</span>
              <Input type="number" min={0} max={100} value={min} onChange={(e) => { setMin(Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0))); setCount(null); }} className="h-9 w-20" />
              <span className="text-muted-foreground">% do</span>
              <Input type="number" min={0} max={100} value={max} onChange={(e) => { setMax(Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0))); setCount(null); }} className="h-9 w-20" />
              <span className="text-muted-foreground">%</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={doCount} disabled={counting} className="gap-2">
              {counting && <Loader2 className="w-4 h-4 animate-spin" />} Spočítat příjemce
            </Button>
            {count !== null && (
              <span className="text-sm font-medium text-foreground">
                Pošle se <strong>{count}</strong> partnerům
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button variant="ghost" onClick={() => setSendTarget(null)} disabled={sending}>Zrušit</Button>
            <Button onClick={doSend} disabled={sending || count === null || count === 0} className="gap-2">
              {sending && <Loader2 className="w-4 h-4 animate-spin" />} Rozeslat teď
            </Button>
          </div>
        </section>
      )}

      {/* Historie */}
      <section className="space-y-2">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <History className="w-4 h-4" /> Historie odeslání
        </h2>
        {history.length === 0 ? (
          <div className="bg-background border border-border rounded-lg p-6 text-center text-muted-foreground text-sm">
            Zatím nebyl odeslán žádný newsletter.
          </div>
        ) : (
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  <th className="px-4 py-3 font-semibold">Předmět</th>
                  <th className="px-4 py-3 font-semibold">Sleva</th>
                  <th className="px-4 py-3 font-semibold">Příjemců</th>
                  <th className="px-4 py-3 font-semibold">Odesláno</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">{h.subject}</td>
                    <td className="px-4 py-3 text-muted-foreground">{h.discount_min}–{h.discount_max} %</td>
                    <td className="px-4 py-3 text-foreground">{h.recipient_count}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(h.sent_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminNewsletters;
