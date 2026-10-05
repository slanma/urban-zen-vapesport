import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Pencil, Copy, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DISCOUNT_COLLECTIONS, type DiscountCollection } from "@/lib/discounts";
import { pragueDayToIso, isoToPragueDay, formatPragueDay } from "@/lib/pragueDate";

/**
 * Admin → Akce a slevy (dříve Slevové kódy).
 *
 * Každá akce určuje: jak se uplatní (kódem / automaticky), komu (B2C,
 * všichni B2B, nebo skupiny B2B podle partnerské slevy), na jaké kolekce,
 * výši slevy, volitelnou hranici košíku bez DPH a období od–do.
 * Zákazník vždy dostane jen nejvyšší slevu, na kterou má nárok.
 */

type RuleRow = {
  id: string;
  name: string;
  code: string | null;
  percent: number;
  min_net: number | null;
  audience_b2c: boolean;
  audience_b2b_all: boolean;
  audience_b2b_groups: number[] | null;
  collections: DiscountCollection[];
  valid_from: string;
  valid_to: string;
  active: boolean;
  created_at: string;
};

type FormState = {
  id: string | null;
  name: string;
  mode: "auto" | "code";
  code: string;
  percent: string;
  minNet: string;
  b2c: boolean;
  b2bAll: boolean;
  b2bGroups: number[];
  collections: DiscountCollection[];
  from: string;
  to: string;
  active: boolean;
};

const today = () => isoToPragueDay(new Date().toISOString());

const emptyForm = (): FormState => ({
  id: null,
  name: "",
  mode: "code",
  code: "",
  percent: "10",
  minNet: "",
  b2c: true,
  b2bAll: false,
  b2bGroups: [],
  collections: ["vapesport", "morseo-evo", "outdoor"],
  from: today(),
  to: today(),
  active: true,
});

const ruleToForm = (r: RuleRow, asCopy = false): FormState => ({
  id: asCopy ? null : r.id,
  name: asCopy ? `${r.name} (kopie)` : r.name,
  mode: r.code ? "code" : "auto",
  code: asCopy ? "" : r.code ?? "",
  percent: String(r.percent),
  minNet: r.min_net == null ? "" : String(r.min_net),
  b2c: r.audience_b2c,
  b2bAll: r.audience_b2b_all,
  b2bGroups: (r.audience_b2b_groups ?? []).map(Number),
  collections: r.collections,
  from: isoToPragueDay(r.valid_from),
  to: isoToPragueDay(r.valid_to),
  active: asCopy ? true : r.active,
});

type Status = { label: string; tone: "wait" | "run" | "done" | "off" };
const statusOf = (r: RuleRow): Status => {
  const now = Date.now();
  if (!r.active) return { label: "Vypnutá", tone: "off" };
  if (now < new Date(r.valid_from).getTime()) return { label: "Čeká", tone: "wait" };
  if (now > new Date(r.valid_to).getTime()) return { label: "Skončila", tone: "done" };
  return { label: "Běží", tone: "run" };
};
const STATUS_CLASS: Record<Status["tone"], string> = {
  run: "bg-primary/15 text-primary",
  wait: "bg-muted text-foreground",
  done: "bg-muted text-muted-foreground",
  off: "bg-destructive/10 text-destructive",
};

const groupLabel = (pct: number) => (pct === 0 ? "Bez slevy" : `${pct.toLocaleString("cs-CZ")} %`);

const Chip = ({ on, onClick, children, disabled }: { on: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) => (
  <button
    type="button"
    aria-pressed={on}
    disabled={disabled}
    onClick={onClick}
    className={`h-9 px-3 rounded-md border text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
      on
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-background text-foreground border-border hover:bg-muted"
    }`}
  >
    {children}
  </button>
);

const AdminPromoCodes = () => {
  const [rules, setRules] = useState<RuleRow[]>([]);
  const [groups, setGroups] = useState<{ pct: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const load = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data, error } = await (supabase as any)
        .from("discount_rules")
        .select("*")
        .order("valid_from", { ascending: false });
      if (error) throw error;
      setRules(((data as RuleRow[]) ?? []).map((r) => ({ ...r, percent: Number(r.percent), min_net: r.min_net == null ? null : Number(r.min_net) })));
    } catch {
      setLoadError(true);
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    const { data } = await (supabase as any)
      .from("b2b_profiles")
      .select("discount_percent")
      .eq("status", "approved");
    const counts = new Map<number, number>();
    for (const row of (data as { discount_percent: number | null }[]) ?? []) {
      const pct = Number(row.discount_percent ?? 0);
      counts.set(pct, (counts.get(pct) ?? 0) + 1);
    }
    setGroups([...counts.entries()].map(([pct, count]) => ({ pct, count })).sort((a, b) => a.pct - b.pct));
  };

  useEffect(() => {
    load();
    loadGroups();
  }, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const toggleGroup = (pct: number) =>
    setForm((f) => ({
      ...f,
      b2bAll: false,
      b2bGroups: f.b2bGroups.includes(pct) ? f.b2bGroups.filter((g) => g !== pct) : [...f.b2bGroups, pct],
    }));

  const toggleCollection = (c: DiscountCollection) =>
    setForm((f) => ({
      ...f,
      collections: f.collections.includes(c) ? f.collections.filter((x) => x !== c) : [...f.collections, c],
    }));

  const audienceText = (r: RuleRow) => {
    const parts: string[] = [];
    if (r.audience_b2c) parts.push("B2C");
    if (r.audience_b2b_all) parts.push("B2B všichni");
    else if (r.audience_b2b_groups?.length) parts.push(`B2B ${r.audience_b2b_groups.map((g) => groupLabel(Number(g))).join(", ")}`);
    return parts.join(" + ");
  };
  const collectionsText = (r: RuleRow) =>
    r.collections.length === DISCOUNT_COLLECTIONS.length
      ? "Vše"
      : DISCOUNT_COLLECTIONS.filter((c) => r.collections.includes(c.id)).map((c) => c.label).join(", ");

  const handleSave = async () => {
    const name = form.name.trim();
    const code = form.mode === "code" ? form.code.trim().toUpperCase() : null;
    const percent = Number(form.percent.replace(",", "."));
    const minNet = form.minNet.trim() ? Number(form.minNet.replace(/\s/g, "").replace(",", ".")) : null;

    if (!name) return toast.error("Vyplňte název akce.");
    if (form.mode === "code" && !code) return toast.error("Vyplňte slevový kód.");
    if (code && !/^[A-Z0-9_-]+$/.test(code)) return toast.error("Kód smí obsahovat jen písmena bez diakritiky, číslice, - a _.");
    if (!Number.isFinite(percent) || percent <= 0 || percent > 90) return toast.error("Sleva musí být 1 až 90 %.");
    if (minNet != null && (!Number.isFinite(minNet) || minNet <= 0)) return toast.error("Hodnota košíku musí být kladné číslo.");
    if (!form.b2c && !form.b2bAll && form.b2bGroups.length === 0) return toast.error("Vyberte, komu je akce určena.");
    if (form.collections.length === 0) return toast.error("Vyberte alespoň jednu kolekci.");
    if (!form.from || !form.to) return toast.error("Vyplňte období od–do.");
    if (form.to < form.from) return toast.error("Konec akce musí být po jejím začátku.");

    const row = {
      name,
      code,
      percent,
      min_net: minNet,
      audience_b2c: form.b2c,
      audience_b2b_all: form.b2bAll,
      audience_b2b_groups: form.b2bAll ? null : form.b2bGroups.length ? form.b2bGroups : null,
      collections: form.collections,
      valid_from: pragueDayToIso(form.from),
      valid_to: pragueDayToIso(form.to, true),
      active: form.active,
    };

    setSaving(true);
    const query = form.id
      ? (supabase as any).from("discount_rules").update(row).eq("id", form.id)
      : (supabase as any).from("discount_rules").insert(row);
    const { error } = await query;
    setSaving(false);
    if (error) {
      toast.error(error.message?.includes("duplicate") ? "Tento kód už má jiná akce." : "Uložení se nepodařilo.");
      return;
    }
    toast.success(form.id ? "Akce uložena." : "Akce vytvořena.");
    setForm(emptyForm());
    load();
  };

  const toggleActive = async (row: RuleRow) => {
    setRules((rs) => rs.map((x) => (x.id === row.id ? { ...x, active: !x.active } : x)));
    const { error } = await (supabase as any).from("discount_rules").update({ active: !row.active }).eq("id", row.id);
    if (error) {
      toast.error("Změna se nepodařila.");
      load();
    }
  };

  const handleDelete = async (row: RuleRow) => {
    if (!confirm(`Smazat akci „${row.name}“?`)) return;
    const { error } = await (supabase as any).from("discount_rules").delete().eq("id", row.id);
    if (error) {
      toast.error(
        error.code === "23503"
          ? "Akce už byla použitá v objednávce. Místo smazání ji vypněte."
          : "Smazání se nepodařilo.",
      );
      return;
    }
    setRules((rs) => rs.filter((x) => x.id !== row.id));
    toast.success("Akce smazána.");
  };

  const editing = form.id != null;
  const groupChips = useMemo(() => groups, [groups]);

  return (
    <section aria-labelledby="discounts-heading" className="p-6 md:p-8 max-w-5xl">
      <h1 id="discounts-heading" className="text-2xl font-heading font-bold text-foreground mb-1">
        Akce a slevy
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Zákazník vždy dostane jen jednu slevu, a to tu nejvyšší, na kterou má nárok. Doprava se nezlevňuje.
      </p>

      <div className="bg-background border border-border rounded-lg p-5 mb-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-heading font-semibold text-foreground">
            {editing ? "Upravit akci" : "Nová akce"}
          </h2>
          {editing && (
            <Button size="sm" variant="ghost" onClick={() => setForm(emptyForm())} className="gap-1.5">
              <X className="w-4 h-4" /> Zrušit úpravy
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-3">
          <div>
            <label htmlFor="d-name" className="block text-xs font-medium text-muted-foreground mb-1">Název akce</label>
            <Input id="d-name" placeholder="MORSEO podzim" value={form.name} onChange={(e) => set("name", e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">Zákazník ho uvidí u slevy v košíku.</p>
          </div>
          <div>
            <label htmlFor="d-pct" className="block text-xs font-medium text-muted-foreground mb-1">Sleva (%)</label>
            <Input id="d-pct" type="number" min={1} max={90} value={form.percent} onChange={(e) => set("percent", e.target.value)} />
          </div>
          <div>
            <label htmlFor="d-min" className="block text-xs font-medium text-muted-foreground mb-1">Od hodnoty košíku (Kč bez DPH)</label>
            <Input id="d-min" type="number" min={1} placeholder="bez hranice" value={form.minNet} onChange={(e) => set("minNet", e.target.value)} />
          </div>
        </div>

        <fieldset>
          <legend className="text-xs font-medium text-muted-foreground mb-2">Jak se sleva uplatní</legend>
          <div className="flex flex-wrap items-center gap-2">
            <Chip on={form.mode === "code"} onClick={() => set("mode", "code")}>Zákazník zadá kód</Chip>
            <Chip on={form.mode === "auto"} onClick={() => set("mode", "auto")}>Automaticky v košíku</Chip>
            {form.mode === "code" && (
              <Input
                aria-label="Slevový kód"
                placeholder="MORSEO15"
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                className="font-mono uppercase w-44 h-9"
              />
            )}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-medium text-muted-foreground mb-2">Komu je určena</legend>
          <div className="flex flex-wrap gap-2">
            <Chip on={form.b2c} onClick={() => set("b2c", !form.b2c)}>B2C zákazníci</Chip>
            <Chip on={form.b2bAll} onClick={() => setForm((f) => ({ ...f, b2bAll: !f.b2bAll, b2bGroups: [] }))}>
              B2B všichni
            </Chip>
            {groupChips.map((g) => (
              <Chip key={g.pct} on={form.b2bGroups.includes(g.pct)} disabled={form.b2bAll} onClick={() => toggleGroup(g.pct)}>
                B2B {groupLabel(g.pct).toLowerCase()} ({g.count})
              </Chip>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Skupiny B2B jsou podle partnerské slevy nastavené v B2B partnerech.</p>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-medium text-muted-foreground mb-2">Na jaké kolekce</legend>
          <div className="flex flex-wrap gap-2">
            {DISCOUNT_COLLECTIONS.map((c) => (
              <Chip key={c.id} on={form.collections.includes(c.id)} onClick={() => toggleCollection(c.id)}>
                {c.label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-medium text-muted-foreground mb-2">Období</legend>
          <div className="flex flex-wrap items-center gap-3">
            <Input type="date" aria-label="Platí od" value={form.from} onChange={(e) => set("from", e.target.value)} className="w-44" />
            <span className="text-muted-foreground text-sm">až</span>
            <Input type="date" aria-label="Platí do" value={form.to} onChange={(e) => set("to", e.target.value)} className="w-44" />
            <label className="flex items-center gap-2 text-sm text-foreground ml-2">
              <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} />
              Aktivní
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Platí od 0:00 prvního dne do 23:59 posledního dne.</p>
        </fieldset>

        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? null : <Plus className="w-4 h-4" />}
          {editing ? "Uložit změny" : "Vytvořit akci"}
        </Button>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
          </div>
        ) : loadError ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-muted-foreground">Načtení se nepodařilo. Je spuštěná SQL migrace pro Akce a slevy?</p>
            <Button size="sm" variant="outline" onClick={load}>Zkusit znovu</Button>
          </div>
        ) : rules.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Zatím žádné akce. Vytvořte první ve formuláři výše.</div>
        ) : (
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-4 py-3 font-semibold text-foreground">Akce</th>
                <th className="px-4 py-3 font-semibold text-foreground">Komu</th>
                <th className="px-4 py-3 font-semibold text-foreground">Kolekce</th>
                <th className="px-4 py-3 font-semibold text-foreground">Období</th>
                <th className="px-4 py-3 font-semibold text-foreground">Stav</th>
                <th className="px-4 py-3 font-semibold text-foreground">Aktivní</th>
                <th className="px-4 py-3 font-semibold text-foreground text-right">Úpravy</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => {
                const st = statusOf(r);
                return (
                  <tr key={r.id} className="border-b border-border last:border-0 align-top">
                    <td className="px-4 py-3 text-foreground">
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-xs text-muted-foreground">
                        −{r.percent.toLocaleString("cs-CZ")} %
                        {r.min_net != null && ` od ${r.min_net.toLocaleString("cs-CZ")} Kč bez DPH`}
                        {r.code ? <> · kód <span className="font-mono">{r.code}</span></> : " · automaticky"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{audienceText(r)}</td>
                    <td className="px-4 py-3 text-foreground">{collectionsText(r)}</td>
                    <td className="px-4 py-3 text-foreground whitespace-nowrap">
                      {formatPragueDay(r.valid_from)} – {formatPragueDay(r.valid_to)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${STATUS_CLASS[st.tone]}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Switch checked={r.active} onCheckedChange={() => toggleActive(r)} aria-label={`Aktivní: ${r.name}`} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button size="sm" variant="ghost" onClick={() => { setForm(ruleToForm(r)); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label={`Upravit ${r.name}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setForm(ruleToForm(r, true)); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label={`Kopírovat ${r.name}`}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(r)} aria-label={`Smazat ${r.name}`}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default AdminPromoCodes;
