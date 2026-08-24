import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, AlertCircle, CheckCircle2, Copy } from "lucide-react";

/**
 * Admin → Nový B2B partner
 * Založí přihlašovací účet a profil v b2b_profiles. Heslo si partner
 * nastaví sám přes odkaz, který mu přijde e-mailem.
 */

type Result = {
  email: string;
  email_sent: boolean;
  email_error?: string | null;
  set_password_link?: string | null;
};

const emptyForm = {
  company_name: "",
  invoice_email: "",
  contact_person: "",
  phone: "",
  ico: "",
  dic: "",
  address: "",
  city: "",
  zip: "",
  discount_percent: "0",
  free_shipping: false,
  notes: "",
  send_email: true,
};

const AdminB2BNovy = () => {
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (k: keyof typeof emptyForm, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setErr(null);
    setResult(null);

    if (!form.company_name.trim()) return setErr("Vyplňte název firmy.");
    if (!form.invoice_email.trim()) return setErr("Vyplňte e-mail partnera.");

    setLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) {
        setLoading(false);
        return setErr("Vypršelo přihlášení. Přihlaste se prosím znovu.");
      }

      const res = await fetch("/api/create-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          ...form,
          discount_percent: Number(form.discount_percent) || 0,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) return setErr(data?.error || "Založení se nezdařilo.");

      setResult({
        email: data.email,
        email_sent: data.email_sent,
        email_error: data.email_error,
        set_password_link: data.set_password_link,
      });
      setForm({ ...emptyForm });
    } catch (e: any) {
      setLoading(false);
      setErr(String(e?.message || e));
    }
  };

  const copyLink = async () => {
    if (!result?.set_password_link) return;
    await navigator.clipboard.writeText(result.set_password_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const field = (
    key: keyof typeof emptyForm,
    label: string,
    placeholder = "",
    type = "text"
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type={type}
        value={String(form[key])}
        placeholder={placeholder}
        onChange={(e) => set(key, e.target.value)}
      />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Nový B2B partner</h1>
        <p className="text-muted-foreground mt-1">
          Partnerovi přijde e-mail s odkazem, přes který si nastaví vlastní heslo.
        </p>
      </header>

      {result && (
        <div className="mb-6 rounded-md border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Partner založen</p>
              <p className="text-sm text-muted-foreground">
                {result.email_sent
                  ? `Na ${result.email} jsme poslali odkaz pro nastavení hesla.`
                  : result.email_error
                  ? `E-mail se nepodařilo odeslat (${result.email_error}). Předejte partnerovi odkaz níže.`
                  : "E-mail jsme neposílali — předejte partnerovi odkaz níže."}
              </p>
            </div>
          </div>

          {result.set_password_link && (
            <div className="rounded border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground mb-2">
                Záložní odkaz — použijte, jen když e-mail nedorazí.
                Platí 24 hodin a lze ho použít jednou.
              </p>
              <Button variant="outline" size="sm" className="gap-2" onClick={copyLink}>
                <Copy className="w-3.5 h-3.5" />
                {copied ? "Zkopírováno" : "Zkopírovat odkaz"}
              </Button>
            </div>
          )}

          <div className="mt-3 flex items-start gap-2 rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              Ten odkaz neotvírejte v okně, kde jste přihlášená jako admin —
              přepsalo by to heslo vám, ne partnerovi. Na testování použijte
              anonymní okno (Cmd&nbsp;+&nbsp;Shift&nbsp;+&nbsp;N).
            </span>
          </div>
        </div>
      )}

      {err && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{err}</span>
        </div>
      )}

      <div className="space-y-5 rounded-lg border border-border bg-background p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {field("company_name", "Název firmy *", "Cyklo Novák s.r.o.")}
          {field("invoice_email", "E-mail (přihlašovací) *", "info@cyklonovak.cz", "email")}
          {field("contact_person", "Kontaktní osoba", "Jan Novák")}
          {field("phone", "Telefon", "+420 601 234 567")}
          {field("ico", "IČO", "12345678")}
          {field("dic", "DIČ", "CZ12345678")}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {field("address", "Ulice a číslo", "Hlavní 12")}
          {field("city", "Město", "Ostrava")}
          {field("zip", "PSČ", "70200")}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="discount_percent">Sleva (%)</Label>
            <Input
              id="discount_percent"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={form.discount_percent}
              onChange={(e) => set("discount_percent", e.target.value)}
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-current"
                checked={form.free_shipping}
                onChange={(e) => set("free_shipping", e.target.checked)}
              />
              Doprava zdarma
            </label>
          </div>
        </div>

        {field("notes", "Poznámka", "Interní poznámka k partnerovi")}

        <label className="flex items-start gap-2 text-sm cursor-pointer pt-1">
          <input
            type="checkbox"
            className="w-4 h-4 mt-0.5 accent-current"
            checked={form.send_email}
            onChange={(e) => set("send_email", e.target.checked)}
          />
          <span>
            Poslat partnerovi e-mail s odkazem na nastavení hesla
            <span className="block text-xs text-muted-foreground">
              Když necháte nezaškrtnuté, partner se jen založí a nic mu nepřijde.
              Přístup mu pak můžete oznámit hromadně přes Newslettery — v e-mailu
              stačí odkaz na <strong>vapesport.cz/b2b-heslo</strong>, kde si o heslo
              požádá sám zadáním svého e-mailu.
            </span>
          </span>
        </label>

        <div className="flex items-center gap-3 pt-2">
          <Button className="gap-2" onClick={submit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Založit partnera
          </Button>
          <Link to="/admin/b2b" className="text-sm text-muted-foreground hover:text-foreground">
            Zpět na seznam
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminB2BNovy;
