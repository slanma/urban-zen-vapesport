import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Check, X, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Partner = Tables<"b2b_profiles">;

interface EditForm {
  company_name: string;
  ico: string;
  dic: string;
  contact_person: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  notes: string;
}

const EMPTY_FORM: EditForm = {
  company_name: "", ico: "", dic: "", contact_person: "",
  phone: "", address: "", city: "", zip: "", notes: "",
};

const AdminB2B = () => {
  const [registrations, setRegistrations] = useState<Partner[]>([]);
  const [approved, setApproved] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState<EditForm>(EMPTY_FORM);
  const [savingEdit, setSavingEdit] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [pending, ok] = await Promise.all([
        supabase.from("b2b_profiles").select("*").eq("status", "pending").order("created_at", { ascending: false }),
        supabase.from("b2b_profiles").select("*").eq("status", "approved").order("company_name", { ascending: true }),
      ]);
      if (pending.error) throw pending.error;
      if (ok.error) throw ok.error;
      setRegistrations(pending.data ?? []);
      setApproved(ok.data ?? []);
    } catch {
      setLoadError(true);
      setRegistrations([]);
      setApproved([]);
    } finally {
      setLoading(false);
    }
  };

  const loadApproved = async () => {
    const { data } = await supabase
      .from("b2b_profiles")
      .select("*")
      .eq("status", "approved")
      .order("company_name", { ascending: true });
    if (data) setApproved(data);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleApprove = async (id: string) => {
    setLoadingAction(id);
    const { data } = await supabase
      .from("b2b_profiles")
      .update({ status: "approved", discount_percent: 0 })
      .eq("id", id)
      .select()
      .single();
    setRegistrations((r) => r.filter((x) => x.id !== id));
    if (data) setApproved((a) => [...a, data].sort((x, y) => x.company_name.localeCompare(y.company_name)));
    setLoadingAction(null);
    toast.success("Partner schválen");
  };

  const updatePartner = async (id: string, patch: Partial<Partner>) => {
    setApproved((a) => a.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    setSavingId(id);
    const { error } = await supabase.from("b2b_profiles").update(patch).eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error("Uložení selhalo");
      await loadApproved();
    }
  };

  const handleReject = async (id: string) => {
    setLoadingAction(id);
    await supabase.from("b2b_profiles").update({ status: "rejected" }).eq("id", id);
    setRegistrations((r) => r.filter((x) => x.id !== id));
    setLoadingAction(null);
  };

  const openEdit = (p: Partner) => {
    setEditing(p);
    setForm({
      company_name: p.company_name ?? "",
      ico: p.ico ?? "",
      dic: p.dic ?? "",
      contact_person: p.contact_person ?? "",
      phone: p.phone ?? "",
      address: p.address ?? "",
      city: p.city ?? "",
      zip: p.zip ?? "",
      notes: p.notes ?? "",
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const required: [keyof EditForm, string][] = [
      ["company_name", "Firma"], ["ico", "IČO"], ["contact_person", "Kontaktní osoba"],
      ["phone", "Telefon"], ["address", "Adresa"], ["city", "Město"], ["zip", "PSČ"],
    ];
    const missing = required.filter(([k]) => !form[k].trim()).map(([, label]) => label);
    if (missing.length > 0) {
      toast.error("Vyplňte povinná pole", { description: missing.join(", ") });
      return;
    }
    setSavingEdit(true);
    const patch: Partial<Partner> = {
      company_name: form.company_name.trim(),
      ico: form.ico.trim(),
      dic: form.dic.trim() || null,
      contact_person: form.contact_person.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      zip: form.zip.trim(),
      notes: form.notes.trim() || null,
    };
    const { error } = await supabase.from("b2b_profiles").update(patch).eq("id", editing.id);
    setSavingEdit(false);
    if (error) {
      toast.error("Uložení selhalo", { description: error.message });
      return;
    }
    toast.success("Údaje partnera uloženy");
    setEditing(null);
    await loadAll();
  };

  const field = (label: string, key: keyof EditForm, opts?: { optional?: boolean }) => (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1">
        {label}{opts?.optional ? "" : " *"}
      </label>
      <Input
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="h-9 text-sm"
      />
    </div>
  );

  return (
    <section aria-labelledby="b2b-heading" className="p-6 md:p-8">
      <h1 id="b2b-heading" className="text-2xl font-heading font-bold text-foreground mb-6">B2B Partneři</h1>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Čekající registrace
            {registrations.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs px-1.5 py-0">{registrations.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Schválení partneři
            <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0">{approved.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {loading ? (
            <div className="bg-background border border-border rounded-lg p-8 text-center flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" /> Načítám…
            </div>
          ) : loadError ? (
            <div className="bg-background border border-border rounded-lg p-8 text-center space-y-3">
              <p className="text-muted-foreground">Načtení se nepodařilo.</p>
              <Button size="sm" variant="outline" onClick={loadAll}>Zkusit znovu</Button>
            </div>
          ) : registrations.length === 0 ? (
            <div className="bg-background border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground text-lg">Žádné čekající registrace.</p>
            </div>
          ) : (
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Datum</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Firma / IČO</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Kontaktní osoba</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Telefon</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Adresa</th>
                      <th className="text-right px-4 py-3 font-semibold text-foreground">Akce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((r) => (
                      <tr key={r.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-foreground">{new Date(r.created_at).toLocaleDateString("cs-CZ")}</td>
                        <td className="px-4 py-3">
                          <span className="text-foreground font-medium block">{r.company_name}</span>
                          <span className="text-xs text-muted-foreground">IČO: {r.ico}{r.dic ? ` · DIČ: ${r.dic}` : ""}</span>
                        </td>
                        <td className="px-4 py-3 text-foreground">{r.contact_person}</td>
                        <td className="px-4 py-3 text-foreground">{r.phone}</td>
                        <td className="px-4 py-3 text-foreground text-xs">{r.address}, {r.city} {r.zip}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="ghost" className="gap-1.5 text-xs font-bold" onClick={() => openEdit(r)}>
                              <Pencil className="w-3.5 h-3.5" /> UPRAVIT
                            </Button>
                            <Button size="sm" className="gap-1.5 text-xs font-bold" onClick={() => handleApprove(r.id)} disabled={loadingAction === r.id}>
                              {loadingAction === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              SCHVÁLIT
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold" onClick={() => handleReject(r.id)} disabled={loadingAction === r.id}>
                              <X className="w-4 h-4" />
                              ZAMÍTNOUT
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          {loading ? (
            <div className="bg-background border border-border rounded-lg p-8 text-center flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" /> Načítám…
            </div>
          ) : loadError ? (
            <div className="bg-background border border-border rounded-lg p-8 text-center space-y-3">
              <p className="text-muted-foreground">Načtení se nepodařilo.</p>
              <Button size="sm" variant="outline" onClick={loadAll}>Zkusit znovu</Button>
            </div>
          ) : approved.length === 0 ? (
            <div className="bg-background border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground text-lg">Zatím žádní schválení partneři.</p>
            </div>
          ) : (
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Firma / IČO</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Kontakt</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground w-32">Sleva (%)</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground w-40">Doprava zdarma</th>
                      <th className="text-right px-4 py-3 font-semibold text-foreground w-28">Akce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approved.map((p) => (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-foreground font-medium block">{p.company_name}</span>
                          <span className="text-xs text-muted-foreground">IČO: {p.ico}{p.dic ? ` · DIČ: ${p.dic}` : ""}</span>
                          {p.notes ? <span className="text-xs text-muted-foreground italic block mt-0.5">📝 {p.notes}</span> : null}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          <div className="text-foreground text-sm">{p.contact_person}</div>
                          {p.phone}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={p.discount_percent}
                              onChange={(e) => {
                                const v = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
                                setApproved((a) => a.map((x) => (x.id === p.id ? { ...x, discount_percent: v } : x)));
                              }}
                              onBlur={(e) => {
                                const v = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
                                updatePartner(p.id, { discount_percent: v });
                              }}
                              className="h-8 w-20 text-sm"
                            />
                            <span className="text-xs text-muted-foreground">%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={p.free_shipping ?? false}
                              onCheckedChange={(v) => updatePartner(p.id, { free_shipping: v })}
                              aria-label="Doprava zdarma"
                            />
                            {savingId === p.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            ) : (
                              <Check className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold" onClick={() => openEdit(p)}>
                            <Pencil className="w-3.5 h-3.5" /> UPRAVIT
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Editace údajů partnera */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upravit údaje partnera</DialogTitle>
            <DialogDescription>
              Doplň nebo oprav údaje partnera. Změny se uloží do jeho profilu.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {field("Firma", "company_name")}
            {field("IČO", "ico")}
            {field("DIČ", "dic", { optional: true })}
            {field("Kontaktní osoba", "contact_person")}
            {field("Telefon", "phone")}
            {field("Adresa", "address")}
            {field("Město", "city")}
            {field("PSČ", "zip")}
          </div>

          <div className="mt-2">
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Poznámka (jen pro tebe)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Interní poznámka k partnerovi…"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[72px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex items-center justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditing(null)} disabled={savingEdit}>
              Zrušit
            </Button>
            <Button onClick={saveEdit} disabled={savingEdit} className="gap-2">
              {savingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
              Uložit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AdminB2B;
