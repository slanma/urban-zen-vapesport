import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const GA_ID_RE = /^G-[A-Z0-9]{4,}$/i;

type BankAccountRow = { id: string; bank_name: string; iban: string; sort_order: number };

const AdminBankAccounts = () => {
  const [rows, setRows] = useState<BankAccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{ bank_name: string; iban: string }>({ bank_name: "", iban: "" });

  const load = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data, error } = await (supabase as any)
        .from("bank_accounts")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      setRows((data as BankAccountRow[]) ?? []);
    } catch {
      setLoadError(true);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    const bank_name = form.bank_name.trim();
    const iban = form.iban.replace(/\s+/g, "").toUpperCase();
    if (!bank_name || !iban) {
      toast.error("Vyplňte název banky a IBAN");
      return;
    }
    setCreating(true);
    const { error } = await (supabase as any)
      .from("bank_accounts")
      .insert({ bank_name, iban, sort_order: rows.length });
    setCreating(false);
    if (error) { toast.error("Uložení selhalo"); return; }
    toast.success("Bankovní účet přidán");
    setForm({ bank_name: "", iban: "" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Smazat tento bankovní účet?")) return;
    const { error } = await (supabase as any).from("bank_accounts").delete().eq("id", id);
    if (error) { toast.error("Smazání selhalo"); return; }
    toast.success("Smazáno");
    load();
  };

  return (
    <div className="bg-background border border-border rounded-lg p-6 mt-6">
      <h2 className="text-lg font-heading font-semibold text-foreground mb-1">Bankovní účty</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Účty pro generování QR plateb v detailu objednávky. Nejsou veřejně viditelné.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_auto] gap-2 mb-4">
        <Input
          placeholder="Název banky (např. Fio)"
          value={form.bank_name}
          onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))}
          disabled={creating}
        />
        <Input
          placeholder="IBAN (např. CZ6508000000192000145399)"
          value={form.iban}
          onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value }))}
          disabled={creating}
          className="font-mono"
        />
        <Button onClick={handleCreate} disabled={creating}>
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
          Přidat
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Načítám…
        </div>
      ) : loadError ? (
        <div className="text-sm space-y-2">
          <p className="text-muted-foreground">Načtení se nepodařilo.</p>
          <Button size="sm" variant="outline" onClick={load}>Zkusit znovu</Button>
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Zatím žádné bankovní účty.</p>
      ) : (
        <ul className="divide-y divide-border border border-border rounded-md">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate">{r.bank_name}</div>
                <div className="text-xs text-muted-foreground font-mono truncate">{r.iban}</div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AdminSettings = () => {
  const [gaId, setGaId] = useState("");
  const [initialGaId, setInitialGaId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadGa = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ga4_measurement_id")
        .maybeSingle();
      if (error) throw error;
      const v = data?.value ?? "";
      setGaId(v);
      setInitialGaId(v);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGa(); }, []);

  const handleSave = async () => {
    const trimmed = gaId.trim();
    if (trimmed && !GA_ID_RE.test(trimmed)) {
      toast.error("Neplatné Measurement ID. Formát: G-XXXXXXXXXX");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "ga4_measurement_id", value: trimmed || null }, { onConflict: "key" });
    setSaving(false);
    if (error) {
      toast.error("Uložení selhalo");
      return;
    }
    setInitialGaId(trimmed);
    toast.success("Nastavení uloženo. Obnovte stránku pro aktivaci.");
  };

  const dirty = gaId.trim() !== initialGaId.trim();

  return (
    <section aria-labelledby="settings-heading" className="p-6 md:p-8 max-w-2xl">
      <h1 id="settings-heading" className="text-2xl font-heading font-bold text-foreground mb-6">Nastavení</h1>

      <div className="bg-background border border-border rounded-lg p-6">
        <h2 className="text-lg font-heading font-semibold text-foreground mb-1">Google Analytics 4</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Vložte své GA4 Measurement ID. Po uložení bude skript automaticky načten na celém webu.
        </p>

        {loadError ? (
          <div className="text-sm space-y-2">
            <p className="text-muted-foreground">Načtení se nepodařilo.</p>
            <Button size="sm" variant="outline" onClick={loadGa}>Zkusit znovu</Button>
          </div>
        ) : (
          <>
            <label htmlFor="ga4-id" className="block text-sm font-medium text-foreground mb-2">
              Measurement ID
            </label>
            <Input
              id="ga4-id"
              placeholder={loading ? "Načítám…" : "G-XXXXXXXXXX"}
              value={gaId}
              onChange={(e) => setGaId(e.target.value)}
              disabled={loading || saving}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Najdete v Google Analytics → Správce → Datové streamy.
            </p>

            <div className="flex items-center gap-3 mt-5">
              <Button onClick={handleSave} disabled={!dirty || loading || saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Uložit
              </Button>
              {initialGaId && (
                <span className="text-xs text-muted-foreground">
                  Aktivní: <span className="font-mono text-foreground">{initialGaId}</span>
                </span>
              )}
            </div>
          </>
        )}

      <AdminBankAccounts />
    </section>
  );
};

export default AdminSettings;
