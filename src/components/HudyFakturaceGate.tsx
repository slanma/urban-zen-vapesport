import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { B2BProfile } from "@/hooks/useB2BPartner";

/**
 * Povinné fakturační údaje pro prodejny HUDY sport.
 * Zobrazí se po prvním přihlášení místo katalogu. Dokud prodejna
 * nevyplní firmu, na kterou se fakturuje, nemůže objednávat.
 *
 * Název prodejny (např. „HUDY sport – Jablonec“) se při uložení přesune
 * do doručovací adresy, aby zboží dál chodilo na prodejnu.
 */
type Props = { profile: B2BProfile };

const HudyFakturaceGate = ({ profile }: Props) => {
  const storeName = (profile.delivery_company || profile.company_name || "").trim();
  const [f, setF] = useState({
    company_name: "",
    ico: (profile.ico ?? "").trim(),
    dic: (profile.dic ?? "").trim(),
    address: (profile.address ?? "").trim(),
    city: (profile.city ?? "").trim(),
    zip: (profile.zip ?? "").trim(),
    contact_person: (profile.contact_person ?? "").trim(),
    phone: (profile.phone ?? "").trim(),
    store_address: (profile.delivery_address ?? "").trim(),
    store_city: (profile.delivery_city ?? profile.city ?? "").trim(),
    store_zip: (profile.delivery_zip ?? "").trim(),
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof f, v: string) => {
    setErr(null);
    setF((s) => ({ ...s, [k]: v }));
  };

  const save = async () => {
    const required: [keyof typeof f, string][] = [
      ["company_name", "fakturační firmu"],
      ["ico", "IČO"],
      ["address", "ulici fakturační adresy"],
      ["city", "město fakturační adresy"],
      ["zip", "PSČ fakturační adresy"],
      ["store_address", "ulici prodejny"],
      ["store_city", "město prodejny"],
      ["store_zip", "PSČ prodejny"],
    ];
    const missing = required.find(([k]) => !f[k].trim());
    if (missing) return setErr(`Vyplňte prosím ${missing[1]}.`);

    setSaving(true);
    const { error } = await supabase
      .from("b2b_profiles")
      .update({
        company_name: f.company_name.trim(),
        ico: f.ico.trim(),
        dic: f.dic.trim() || null,
        address: f.address.trim(),
        city: f.city.trim(),
        zip: f.zip.trim(),
        contact_person: f.contact_person.trim(),
        phone: f.phone.trim(),
        delivery_same: false,
        delivery_company: storeName || null,
        delivery_address: f.store_address.trim(),
        delivery_city: f.store_city.trim(),
        delivery_zip: f.store_zip.trim(),
        delivery_contact: f.contact_person.trim() || null,
        delivery_phone: f.phone.trim() || null,
      })
      .eq("user_id", profile.user_id);
    setSaving(false);
    if (error) {
      setErr("Uložení se nepovedlo: " + error.message);
      return;
    }
    toast.success("Fakturační údaje uloženy");
    window.location.reload();
  };

  const field = (k: keyof typeof f, label: string, placeholder = "") => (
    <div className="space-y-1.5">
      <Label htmlFor={`hudy-${k}`}>{label}</Label>
      <Input id={`hudy-${k}`} value={f[k]} placeholder={placeholder} onChange={(e) => set(k, e.target.value)} />
    </div>
  );

  return (
    <section className="max-w-2xl mx-auto bg-background border border-border rounded-xl p-6 md:p-8 space-y-6">
      <header className="space-y-2">
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Ještě fakturační údaje</h1>
        <p className="text-muted-foreground">
          Než začnete objednávat, vyplňte prosím firmu, na kterou budeme fakturovat. Stačí jednou,
          později je změníte na Nástěnce.
        </p>
      </header>

      <div className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">Fakturační údaje</h2>
        {field("company_name", "Firma (na koho fakturujeme) *", "HUDYsport Czech s. r. o.")}
        <div className="grid sm:grid-cols-2 gap-4">
          {field("ico", "IČO *")}
          {field("dic", "DIČ / IČ DPH")}
        </div>
        {field("address", "Ulice a číslo *")}
        <div className="grid sm:grid-cols-[1fr_140px] gap-4">
          {field("city", "Město *")}
          {field("zip", "PSČ *")}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">
          Kam posíláme zboží{storeName ? ` – ${storeName}` : ""}
        </h2>
        {field("store_address", "Ulice a číslo prodejny *")}
        <div className="grid sm:grid-cols-[1fr_140px] gap-4">
          {field("store_city", "Město *")}
          {field("store_zip", "PSČ *")}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {field("contact_person", "Kontaktní osoba")}
          {field("phone", "Telefon")}
        </div>
      </div>

      {err && <p className="text-sm text-destructive">{err}</p>}

      <Button size="lg" className="w-full" onClick={save} disabled={saving}>
        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Uložit a pokračovat k objednávce
      </Button>
    </section>
  );
};

export default HudyFakturaceGate;
