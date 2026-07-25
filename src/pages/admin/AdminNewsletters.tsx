import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Trash2, Eye, Send, History } from "lucide-react";
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
  segment: string | null;
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
  const [partners, setPartners] = useState<{ id: string; company_name: string; contact_person: string | null; invoice_email: string; discount_percent: number }[]>([]);
  const [selAll, setSelAll] = useState(false);
  const [selDiscounts, setSelDiscounts] = useState<Set<number>>(new Set());
  const [selManual, setSelManual] = useState<Set<string>>(new Set());
  const [pSearch, setPSearch] = useState("");
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

  const openSend = async (nl: Newsletter) => {
    setSendTarget(nl);
    setSelAll(false);
    setSelDiscounts(new Set());
    setSelManual(new Set());
    setPSearch("");
    try {
      const r = await api("/api/newsletters", { action: "partners" });
      setPartners(r.partners || []);
    } catch (e: any) {
      toast.error(e.message || "Načtení partnerů selhalo");
    }
  };

  // seskupení podle slevy (unikátní hodnoty + počty)
  const discountGroups = Array.from(
    partners.reduce((m, p) => {
      const d = Number(p.discount_percent) || 0;
      m.set(d, (m.get(d) || 0) + 1);
      return m;
    }, new Map<number, number>())
  ).sort((a, b) => a[0] - b[0]);

  // spočítej příjemce (e-maily) z aktuálního výběru
  const recipientEmails = (() => {
    const set = new Set<string>();
    for (const p of partners) {
      const e = (p.invoice_email || "").trim().toLowerCase();
      if (!e) continue;
      const d = Number(p.discount_percent) || 0;
      if (selAll || selDiscounts.has(d) || selManual.has(p.id)) set.add(e);
    }
    return [...set];
  })();

  const segmentLabel = selAll
    ? "Všichni"
    : [
        [...selDiscounts].sort((a, b) => a - b).map((d) => `${d} %`).join(", "),
        selManual.size ? `${selManual.size} ručně` : "",
      ].filter(Boolean).join(" + ") || "—";

  const toggleDiscount = (d: number) =>
    setSelDiscounts((s2) => {
      const n = new Set(s2);
      n.has(d) ? n.delete(d) : n.add(d);
      return n;
    });
  const toggleManual = (id: string) =>
    setSelManual((s2) => {
      const n = new Set(s2);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const doSend = async () => {
    if (!sendTarget) return;
    if (!recipientEmails.length) { toast.error("Vyber alespoň jednoho příjemce."); return; }
    if (!window.confirm(`Opravdu rozeslat „${sendTarget.subject}" na ${recipientEmails.length} příjemců?`)) return;
    setSending(true);
    try {
      const r = await api("/api/send-newsletter", {
        action: "send",
        newsletter_id: sendTarget.id,
        subject: sendTarget.subject,
        html: sendTarget.html,
        emails: recipientEmails,
        segment: segmentLabel,
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
        <h2 className="font-semibold text-foreground">Nový newsletter</h2>
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

          <p className="text-xs text-muted-foreground bg-primary/5 rounded-md px-3 py-2">
            Tip: do HTML newsletteru vlož <code className="font-mono">{"{osloveni}"}</code> — nahradí se za „Dobrý den, [příjmení]," (nebo „Dobrý den," když partner nemá kontaktní osobu).
          </p>

          <div>
            <label className="flex items-center gap-2 mb-2 cursor-pointer">
              <input type="checkbox" checked={selAll} onChange={(e) => setSelAll(e.target.checked)} className="w-4 h-4 accent-primary" />
              <span className="text-sm font-medium text-foreground">Všichni ({partners.length})</span>
            </label>
            {!selAll && (
              <>
                <p className="text-sm text-muted-foreground mb-1">Podle slevy:</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {discountGroups.map(([d, n]) => (
                    <label key={d} className={`flex items-center gap-1.5 text-sm border rounded-md px-2.5 py-1 cursor-pointer ${selDiscounts.has(d) ? "border-primary bg-primary/10" : "border-border"}`}>
                      <input type="checkbox" checked={selDiscounts.has(d)} onChange={() => toggleDiscount(d)} className="w-3.5 h-3.5 accent-primary" />
                      {d} % <span className="text-muted-foreground">({n})</span>
                    </label>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mb-1">Nebo vyber ručně:</p>
                <Input placeholder="Hledat partnera…" value={pSearch} onChange={(e) => setPSearch(e.target.value)} className="h-9 mb-2" />
                <div className="max-h-52 overflow-y-auto border border-border rounded-md divide-y divide-border">
                  {partners
                    .filter((p) => {
                      const q = pSearch.trim().toLowerCase();
                      if (!q) return true;
                      return [p.company_name, p.contact_person, p.invoice_email].filter(Boolean).join(" ").toLowerCase().includes(q);
                    })
                    .slice(0, 200)
                    .map((p) => (
                      <label key={p.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted/40">
                        <input type="checkbox" checked={selManual.has(p.id)} onChange={() => toggleManual(p.id)} className="w-4 h-4 accent-primary shrink-0" />
                        <span className="flex-1">
                          <span className="text-foreground">{p.company_name}</span>
                          <span className="text-xs text-muted-foreground block">{p.invoice_email} · {Number(p.discount_percent) || 0} %</span>
                        </span>
                      </label>
                    ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm bg-muted/40 rounded-md px-3 py-2">
            Pošle se <strong className="text-foreground">{recipientEmails.length}</strong> příjemcům
            <span className="text-muted-foreground">· výběr: {segmentLabel}</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button variant="ghost" onClick={() => setSendTarget(null)} disabled={sending}>Zrušit</Button>
            <Button onClick={doSend} disabled={sending || recipientEmails.length === 0} className="gap-2">
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
                  <th className="px-4 py-3 font-semibold">Komu</th>
                  <th className="px-4 py-3 font-semibold">Příjemců</th>
                  <th className="px-4 py-3 font-semibold">Odesláno</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">{h.subject}</td>
                    <td className="px-4 py-3 text-muted-foreground">{h.segment || "—"}</td>
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
