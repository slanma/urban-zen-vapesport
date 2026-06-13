import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "@/hooks/use-toast";

/**
 * Global tunable settings shown on the admin overview.
 * Currently exposes the longer-straps auto-injection knobs used by the
 * product detail page when the customer enters a frame circumference
 * larger than the standard.
 */
const SiteSettingsPanel = () => {
  const { get, set, loading } = useSiteSettings();
  const [strapsId, setStrapsId] = useState("");
  const [maxCirc, setMaxCirc] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    setStrapsId(get("longer_straps_product_id", ""));
    setMaxCirc(get("default_max_frame_circumference_cm", "7.5"));
  }, [loading, get]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await set("longer_straps_product_id", strapsId.trim());
      await set("default_max_frame_circumference_cm", maxCirc.trim() || "7.5");
      toast({ title: "Nastavení uloženo" });
    } catch (e) {
      toast({
        title: "Uložení selhalo",
        description: e instanceof Error ? e.message : "Zkuste znovu.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-bold text-foreground">
          Automatické přidání prodloužených pásků
        </h3>
        <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Uložit
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="straps-id">ID produktu pro prodloužené pásky</Label>
          <Input
            id="straps-id"
            value={strapsId}
            onChange={(e) => setStrapsId(e.target.value)}
            placeholder="např. vs-prodlouzene-pasky-123"
            className="mt-1 font-mono text-xs"
          />
        </div>
        <div>
          <Label htmlFor="max-circ">Výchozí max obvod rámu (cm)</Label>
          <Input
            id="max-circ"
            type="number"
            step="0.1"
            value={maxCirc}
            onChange={(e) => setMaxCirc(e.target.value)}
            placeholder="7.5"
            className="mt-1"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Když zákazník na detailu produktu zadá obvod větší než tato hodnota, do košíku
        se automaticky přidá produkt zadaný výše.
      </p>
    </div>
  );
};

export default SiteSettingsPanel;
