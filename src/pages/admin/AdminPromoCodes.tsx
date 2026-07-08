import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PromoRow = {
  id: string;
  code: string;
  type: "percentage" | "fixed_amount";
  value: number;
  active: boolean;
  created_at: string;
};

const AdminPromoCodes = () => {
  const [codes, setCodes] = useState<PromoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{ code: string; type: "percentage" | "fixed_amount"; value: string }>({
    code: "",
    type: "percentage",
    value: "10",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setCodes(data as PromoRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    const code = form.code.trim().toUpperCase();
    const value = Number(form.value);
    if (!code) {
      toast.error("Zadejte kód.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Hodnota musí být kladné číslo.");
      return;
    }
    if (form.type === "percentage" && value > 100) {
      toast.error("Procentuální sleva max. 100 %.");
      return;
    }
    setCreating(true);
    const { error } = await (supabase as any)
      .from("promo_codes")
      .insert({ code, type: form.type, value, active: true });
    setCreating(false);
    if (error) {
      toast.error(error.message?.includes("duplicate") ? "Tento kód již existuje." : "Vytvoření selhalo.");
      return;
    }
    setForm({ code: "", type: "percentage", value: "10" });
    toast.success(`Kód „${code}" vytvořen.`);
    load();
  };

  const toggleActive = async (row: PromoRow) => {
    setCodes((c) => c.map((x) => (x.id === row.id ? { ...x, active: !x.active } : x)));
    const { error } = await (supabase as any)
      .from("promo_codes")
      .update({ active: !row.active })
      .eq("id", row.id);
    if (error) {
      toast.error("Změna se nepodařila.");
      load();
    }
  };

  const handleDelete = async (row: PromoRow) => {
    if (!confirm(`Smazat kód „${row.code}"?`)) return;
    const { error } = await (supabase as any).from("promo_codes").delete().eq("id", row.id);
    if (error) {
      toast.error("Smazání selhalo.");
      return;
    }
    setCodes((c) => c.filter((x) => x.id !== row.id));
    toast.success("Kód smazán.");
  };

  return (
    <section aria-labelledby="promo-heading" className="p-6 md:p-8 max-w-4xl">
      <h1 id="promo-heading" className="text-2xl font-heading font-bold text-foreground mb-6">
        Slevové kódy
      </h1>

      <div className="bg-background border border-border rounded-lg p-5 mb-6">
        <h2 className="text-base font-heading font-semibold text-foreground mb-4">Nový kód</h2>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_140px_auto] gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Kód</label>
            <Input
              placeholder="VAPE10"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              className="font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Typ</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PromoRow["type"] }))}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
            >
              <option value="percentage">Procentuální (%)</option>
              <option value="fixed_amount">Pevná částka (Kč)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Hodnota {form.type === "percentage" ? "(%)" : "(Kč)"}
            </label>
            <Input
              type="number"
              min={1}
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            />
          </div>
          <Button onClick={handleCreate} disabled={creating} className="gap-1.5">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Vytvořit
          </Button>
        </div>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
          </div>
        ) : codes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Zatím žádné kódy.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-4 py-3 font-semibold text-foreground">Kód</th>
                <th className="px-4 py-3 font-semibold text-foreground">Typ</th>
                <th className="px-4 py-3 font-semibold text-foreground">Hodnota</th>
                <th className="px-4 py-3 font-semibold text-foreground">Aktivní</th>
                <th className="px-4 py-3 font-semibold text-foreground text-right">Akce</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">{r.code}</td>
                  <td className="px-4 py-3 text-foreground">
                    {r.type === "percentage" ? "Procentuální" : "Pevná částka"}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {r.type === "percentage" ? `${r.value} %` : `${r.value} Kč`}
                  </td>
                  <td className="px-4 py-3">
                    <Switch checked={r.active} onCheckedChange={() => toggleActive(r)} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(r)} aria-label="Smazat">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default AdminPromoCodes;
