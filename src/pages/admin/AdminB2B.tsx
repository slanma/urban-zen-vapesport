import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Check, X, Pencil, Trash2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Partner[]>([]);
  const [approved, setApproved] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState<EditForm>(EMPTY_FORM);
  const [pendingDiscounts, setPendingDiscounts] = useState<Record<string, number>>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [activity, setActivity] = useState<Record<string, string | null>>({});
  const [search, setSearch] = useState("");
  const [discountFilter, setDiscountFilter] = useState<"all" | "with" | "without">("all");
  const [activityFilter, setActivityFilter] = useState<"all" | "registered" | "never">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkDiscount, setBulkDiscount] = useState("");

  // Filtrovaný seznam schválených partnerů (hledání textem + filtr slevy)
  const lastLogin = (p: Partner): string | null => (p.user_id ? activity[p.user_id] ?? null : null);

  const approvedFiltered = approved.filter((p) => {
    const disc = Number(p.discount_percent) || 0;
    if (discountFilter === "with" && disc <= 0) return false;
    if (discountFilter === "without" && disc > 0) return false;
    if (activityFilter === "registered" && !lastLogin(p)) return false;
    if (activityFilter === "never" && lastLogin(p)) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const hay = [p.company_name, p.contact_person, p.invoice_email, p.city, p.ico, p.phone, p.notes]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  // --- Přehled aktivace účtů ----------------------------------------------
  const statRegistered = approved.filter((p) => lastLogin(p)).length;
  const statActive7 = approved.filter((p) => {
    const l = lastLogin(p);
    return l ? (Date.now() - new Date(l).getTime()) / 86400000 <= 7 : false;
  }).length;
  const statNever = approved.length - statRegistered;
  const activityKnown = Object.keys(activity).length > 0;

  // --- Hromadné úpravy -----------------------------------------------------
  const visibleIds = approvedFiltered.map((p) => p.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const selectedCount = selectedIds.size;

  const toggleOne = (id: string) => {
    setSelectedIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelectedIds((s) => {
      const next = new Set(s);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  // Skupiny podle výše slevy – počítají se z právě zobrazených partnerů
  const discountGroups = (() => {
    const map = new Map<number, string[]>();
    approvedFiltered.forEach((p) => {
      const d = Number(p.discount_percent) || 0;
      const arr = map.get(d) ?? [];
      arr.push(p.id);
      map.set(d, arr);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([value, ids]) => ({ value, ids }));
  })();

  const fmtPct = (v: number) => `${v.toLocaleString("cs-CZ")} %`;

  const toggleGroup = (ids: string[]) => {
    const allIn = ids.every((id) => selectedIds.has(id));
    setSelectedIds((s) => {
      const next = new Set(s);
      if (allIn) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  // Supabase update po dávkách – u 231 ID by jeden dotaz narazil na délku URL
  const bulkUpdate = async (patch: Partial<Partner>, doneLabel: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkBusy(true);

    const keys = Object.keys(patch) as (keyof Partner)[];
    let failed = 0;
    let reverted = 0;

    for (let i = 0; i < ids.length; i += 100) {
      const part = ids.slice(i, i + 100);
      const { data, error } = await supabase
        .from("b2b_profiles")
        .update(patch)
        .in("id", part)
        .select("*");
      if (error) {
        failed += part.length;
        continue;
      }
      // b2b_guard vrací změny chráněných sloupců tiše zpět – ověříme výsledek
      (data ?? []).forEach((row) => {
        if (keys.some((k) => row[k] !== patch[k])) reverted += 1;
      });
    }

    setBulkBusy(false);

    if (failed > 0) {
      toast.error(`Uložení selhalo u ${failed} partnerů`);
      await loadApproved();
      return;
    }
    if (reverted > 0) {
      toast.error(`Databáze změnu zamítla u ${reverted} partnerů`, {
        description: "Nejspíš chybí role admin (trigger b2b_guard).",
      });
      await loadApproved();
      return;
    }

    setApproved((a) => a.map((p) => (selectedIds.has(p.id) ? { ...p, ...patch } : p)));
    toast.success(`${doneLabel} – ${ids.length} partnerů`);
  };

  const bulkSetDiscount = async () => {
    const v = parseInt(bulkDiscount, 10);
    if (Number.isNaN(v) || v < 0 || v > 100) {
      toast.error("Zadej slevu 0–100 %");
      return;
    }
    await bulkUpdate({ discount_percent: v }, `Sleva nastavena na ${v} %`);
    setBulkDiscount("");
  };

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
    (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const token = sess?.session?.access_token;
        if (!token) return;
        const r = await fetch("/api/partner-activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
        const d = await r.json().catch(() => ({}));
        if (r.ok && d.activity) setActivity(d.activity);
      } catch { /* stitky jsou nepovinne */ }
    })();
  }, []);

  const handleApprove = async (id: string) => {
    setLoadingAction(id);
    const discount = Math.max(0, Math.min(100, pendingDiscounts[id] ?? 0));
    const { data } = await supabase
      .from("b2b_profiles")
      .update({ status: "approved", discount_percent: discount })
      .eq("id", id)
      .select()
      .single();
    setRegistrations((r) => r.filter((x) => x.id !== id));
    if (data) setApproved((a) => [...a, data].sort((x, y) => x.company_name.localeCompare(y.company_name)));

    // E-mail partnerovi „účet schválen" (best-effort)
    if (data?.invoice_email) {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const token = sess?.session?.access_token;
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "b2b_approved",
            token,
            user: {
              email: data.invoice_email,
              company: data.company_name,
              contactName: data.contact_person,
            },
          }),
        });
      } catch {
        /* schválení platí i když se e-mail nepovede odeslat */
      }
    }

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

  const handleDelete = async (p: Partner) => {
    if (!window.confirm(`Opravdu smazat partnera „${p.company_name}"? Tuto akci nelze vzít zpět.`)) return;
    setLoadingAction(p.id);
    const { error } = await supabase.from("b2b_profiles").delete().eq("id", p.id);
    setLoadingAction(null);
    if (error) {
      toast.error("Smazání selhalo", { description: error.message });
      return;
    }
    setRegistrations((r) => r.filter((x) => x.id !== p.id));
    setApproved((a) => a.filter((x) => x.id !== p.id));
    setSelectedIds((s) => {
      const next = new Set(s);
      next.delete(p.id);
      return next;
    });
    toast.success("Partner smazán");
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 id="b2b-heading" className="text-2xl font-heading font-bold text-foreground">B2B Partneři</h1>
        <Button className="gap-2" onClick={() => navigate("/admin/b2b-novy")}>
          <UserPlus className="w-4 h-4" />
          Nový partner
        </Button>
      </div>
      <Tabs defaultValue="approved" className="w-full">
        <TabsList>
          <TabsTrigger value="approved">
            Schválení partneři
            <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0">{approved.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Čekající registrace
            {registrations.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs px-1.5 py-0">{registrations.length}</Badge>
            )}
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
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Sleva (%)</th>
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
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={pendingDiscounts[r.id] ?? 0}
                              onChange={(e) => {
                                const v = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
                                setPendingDiscounts((d) => ({ ...d, [r.id]: v }));
                              }}
                              className="h-8 w-20 text-sm"
                            />
                            <span className="text-xs text-muted-foreground">%</span>
                          </div>
                        </td>
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
                            <Button size="sm" variant="ghost" className="gap-1.5 text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(r)} disabled={loadingAction === r.id}>
                              <Trash2 className="w-3.5 h-3.5" /> SMAZAT
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
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <Input
                  placeholder="Hledat firmu, kontakt, e-mail, IČO, město…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 flex-1"
                />
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant={discountFilter === "all" ? "default" : "outline"}
                    onClick={() => setDiscountFilter("all")}
                  >
                    Vše
                  </Button>
                  <Button
                    size="sm"
                    variant={discountFilter === "with" ? "default" : "outline"}
                    onClick={() => setDiscountFilter("with")}
                  >
                    Se slevou
                  </Button>
                  <Button
                    size="sm"
                    variant={discountFilter === "without" ? "default" : "outline"}
                    onClick={() => setDiscountFilter("without")}
                  >
                    Bez slevy
                  </Button>
                </div>
              </div>
              {/* Souhrn aktivace účtů */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActivityFilter("all")}
                  className={`text-left rounded-lg border px-4 py-3 transition-colors ${activityFilter === "all" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted/40"}`}
                >
                  <div className="text-2xl font-bold text-foreground">{approved.length}</div>
                  <div className="text-xs text-muted-foreground">schválených partnerů celkem</div>
                </button>
                <button
                  type="button"
                  onClick={() => setActivityFilter("registered")}
                  className={`text-left rounded-lg border px-4 py-3 transition-colors ${activityFilter === "registered" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted/40"}`}
                >
                  <div className="text-2xl font-bold text-emerald-700">{statRegistered}</div>
                  <div className="text-xs text-muted-foreground">
                    už se přihlásilo{statActive7 > 0 ? ` · ${statActive7} za posledních 7 dní` : ""}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setActivityFilter("never")}
                  className={`text-left rounded-lg border px-4 py-3 transition-colors ${activityFilter === "never" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted/40"}`}
                >
                  <div className="text-2xl font-bold text-foreground">{statNever}</div>
                  <div className="text-xs text-muted-foreground">zatím se nepřihlásilo</div>
                </button>
              </div>

              {!activityKnown && (
                <p className="text-xs text-muted-foreground">
                  Údaje o přihlášení se teď nepodařilo načíst, čísla o aktivaci proto nemusí sedět.
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Zobrazeno {approvedFiltered.length} z {approved.length} partnerů
                {activityFilter === "registered" ? " · jen přihlášení" : activityFilter === "never" ? " · jen nepřihlášení" : ""}
              </p>

              {/* Hromadné akce – viditelné pořád, nad tabulkou */}
              <div className="rounded-lg border border-border bg-muted/60 px-4 py-3 space-y-3">
                {/* Řádek 1: rychlý výběr skupin */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground shrink-0">Vybrat skupinu:</span>
                  <Button
                    size="sm"
                    variant={allVisibleSelected ? "secondary" : "default"}
                    className="h-8 text-xs font-bold"
                    onClick={toggleAllVisible}
                    disabled={bulkBusy || visibleIds.length === 0}
                  >
                    {allVisibleSelected ? "ODZNAČIT VŠE" : `VŠICHNI (${visibleIds.length})`}
                  </Button>
                  {discountGroups.map((g) => {
                    const active = g.ids.every((id) => selectedIds.has(id));
                    return (
                      <Button
                        key={g.value}
                        size="sm"
                        variant={active ? "secondary" : "outline"}
                        className="h-8 text-xs"
                        onClick={() => toggleGroup(g.ids)}
                        disabled={bulkBusy}
                      >
                        {g.value === 0 ? "Bez slevy" : fmtPct(g.value)}
                        <span className="ml-1.5 text-muted-foreground">({g.ids.length})</span>
                      </Button>
                    );
                  })}
                </div>

                {/* Řádek 2: co se s výběrem má stát */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 border-t border-border/60">
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-3">
                    {bulkBusy && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                    <span className={`text-sm ${selectedCount > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      Vybráno {selectedCount}
                    </span>
                    {selectedCount > 0 && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={clearSelection} disabled={bulkBusy}>
                        Zrušit výběr
                      </Button>
                    )}
                  </div>

                  <div className="h-4 w-px bg-border hidden sm:block sm:mt-3" />

                  <div className="flex items-center gap-2 flex-wrap sm:pt-3">
                    <span className="text-xs text-muted-foreground">Doprava zdarma:</span>
                    <Button
                      size="sm"
                      className="h-8 text-xs font-bold"
                      disabled={bulkBusy || selectedCount === 0}
                      onClick={() => bulkUpdate({ free_shipping: true }, "Doprava zdarma zapnuta")}
                    >
                      ZAPNOUT
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-bold"
                      disabled={bulkBusy || selectedCount === 0}
                      onClick={() => bulkUpdate({ free_shipping: false }, "Doprava zdarma vypnuta")}
                    >
                      VYPNOUT
                    </Button>
                  </div>

                  <div className="h-4 w-px bg-border hidden sm:block sm:mt-3" />

                  <div className="flex items-center gap-2 sm:pt-3">
                    <span className="text-xs text-muted-foreground">Sleva:</span>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={bulkDiscount}
                      onChange={(e) => setBulkDiscount(e.target.value)}
                      placeholder="%"
                      className="h-8 w-20 text-sm"
                      disabled={bulkBusy || selectedCount === 0}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-bold"
                      disabled={bulkBusy || selectedCount === 0 || bulkDiscount.trim() === ""}
                      onClick={bulkSetDiscount}
                    >
                      NASTAVIT
                    </Button>
                  </div>
                </div>
              </div>
              {approvedFiltered.length === 0 ? (
                <div className="bg-background border border-border rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">Nic nenalezeno.</p>
                </div>
              ) : (
              <div className="bg-background border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left pl-4 pr-1 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={toggleAllVisible}
                          className="h-4 w-4 cursor-pointer accent-primary align-middle"
                          aria-label="Vybrat všechny zobrazené"
                          title="Vybrat všechny zobrazené"
                        />
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Firma / IČO</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Kontakt</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground w-32">Sleva (%)</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground w-40">Doprava zdarma</th>
                      <th className="text-right px-4 py-3 font-semibold text-foreground w-28">Akce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedFiltered.map((p) => (
                      <tr
                        key={p.id}
                        className={`border-b border-border last:border-0 transition-colors ${
                          selectedIds.has(p.id) ? "bg-muted/50" : "hover:bg-muted/30"
                        }`}
                      >
                        <td className="pl-4 pr-1 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(p.id)}
                            onChange={() => toggleOne(p.id)}
                            className="h-4 w-4 cursor-pointer accent-primary align-middle"
                            aria-label={`Vybrat ${p.company_name}`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-foreground font-medium">{p.company_name}</span>
                            {(() => {
                              const last = p.user_id ? activity[p.user_id] : null;
                              if (!last) return null;
                              const days = (Date.now() - new Date(last).getTime()) / 86400000;
                              return (
                                <>
                                  <span className="text-[10px] font-bold uppercase tracking-wide text-blue-700 bg-blue-100 rounded px-1.5 py-0.5">Registrace</span>
                                  {days <= 7 ? <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5">Aktivní</span> : null}
                                </>
                              );
                            })()}
                          </div>
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
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold" onClick={() => openEdit(p)}>
                              <Pencil className="w-3.5 h-3.5" /> UPRAVIT
                            </Button>
                            <Button size="sm" variant="ghost" className="gap-1.5 text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p)} disabled={loadingAction === p.id}>
                              <Trash2 className="w-3.5 h-3.5" /> SMAZAT
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
