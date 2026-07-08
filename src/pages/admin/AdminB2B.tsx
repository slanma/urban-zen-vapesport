import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const AdminB2B = () => {
  const [registrations, setRegistrations] = useState<Tables<"b2b_profiles">[]>([]);
  const [approved, setApproved] = useState<Tables<"b2b_profiles">[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

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

  const updatePartner = async (id: string, patch: Partial<Tables<"b2b_profiles">>) => {
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
                      <th className="text-left px-4 py-3 font-semibold text-foreground w-20">Stav</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approved.map((p) => (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-foreground font-medium block">{p.company_name}</span>
                          <span className="text-xs text-muted-foreground">IČO: {p.ico}{p.dic ? ` · DIČ: ${p.dic}` : ""}</span>
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
                          <Switch
                            checked={p.free_shipping ?? false}
                            onCheckedChange={(v) => updatePartner(p.id, { free_shipping: v })}
                            aria-label="Doprava zdarma"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {savingId === p.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Check className="w-4 h-4 text-emerald-600" />
                          )}
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
    </section>
  );
};

export default AdminB2B;
