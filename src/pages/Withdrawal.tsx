import { useEffect, useState } from "react";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  order_number: z.string().trim().min(1, "Zadejte číslo objednávky").max(64),
  email: z.string().trim().email("Neplatný e-mail").max(255),
  full_name: z.string().trim().min(1, "Zadejte jméno a příjmení").max(160),
  bank_account: z.string().trim().max(64).optional().or(z.literal("")),
  items: z.string().trim().max(2000).optional().or(z.literal("")),
});

type WithdrawalForm = z.infer<typeof schema>;

const Withdrawal = () => {
  const { user } = useAuth();
  const [isB2B, setIsB2B] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [items, setItems] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // Dvoufázové potvrzení: null = fáze 1 (vyplňování), objekt = fáze 2 (rekapitulace)
  const [pending, setPending] = useState<WithdrawalForm | null>(null);

  useEffect(() => {
    document.title = "Odstoupení od smlouvy | Vapesport";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Formulář pro odstoupení od kupní smlouvy do 14 dnů dle českého a EU práva.");
  }, []);

  useEffect(() => {
    const checkB2B = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("b2b_profiles")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data && data.status === "approved") setIsB2B(true);
    };
    checkB2B();
  }, [user]);

  /** Fáze 1 → validace a přechod na rekapitulaci. Nic se zatím neukládá. */
  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      order_number: orderNumber,
      email,
      full_name: fullName,
      bank_account: bankAccount,
      items,
    });
    if (!parsed.success) {
      toast({ title: "Zkontrolujte údaje", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setPending(parsed.data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** Fáze 2 → vědomé potvrzení, teprve teď se odstoupení odesílá. */
  const handleConfirm = async () => {
    if (!pending) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("withdrawal_requests")
      .insert({
        order_number: pending.order_number,
        email: pending.email,
        full_name: pending.full_name,
        bank_account: pending.bank_account || null,
        items: pending.items || null,
        user_id: user?.id ?? null,
      })
      .select()
      .single();

    if (error) {
      setLoading(false);
      toast({ title: "Nepodařilo se odeslat", description: error.message, variant: "destructive" });
      return;
    }

    await supabase.functions.invoke("notify-withdrawal-request", {
      body: {
        order_number: pending.order_number,
        email: pending.email,
        full_name: pending.full_name,
        bank_account: pending.bank_account || null,
        items: pending.items || null,
        request_id: data?.id,
      },
    }).catch(() => null);

    setLoading(false);
    setSuccess(true);
  };

  if (isB2B) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn={!!user} />
        <main className="container mx-auto px-4 pt-32 pb-24 max-w-2xl">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">Odstoupení od smlouvy</h1>
          <p className="text-muted-foreground">
            Tato možnost je dostupná pouze pro koncové spotřebitele (B2C). Pro velkoobchodní objednávky
            kontaktujte prosím naše obchodní oddělení na <a className="text-primary underline" href="mailto:info@vapesport.cz">info@vapesport.cz</a>.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar isLoggedIn={!!user} />
      <main className="flex-1 container mx-auto px-4 pt-32 pb-24 max-w-2xl">
        <header className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">Odstoupení od smlouvy</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Jako spotřebitel máte právo odstoupit od kupní smlouvy bez udání důvodu do 14 dnů od převzetí zboží.
            Vyplňte prosím formulář níže a my vám obratem zašleme potvrzení.
          </p>
        </header>

        {success ? (
          <div className="rounded-lg border border-border bg-card p-8">
            <h2 className="font-heading text-xl font-semibold mb-3">Odstoupení jsme přijali</h2>
            <p className="text-muted-foreground mb-4">
              Potvrzení jsme odeslali na <strong className="text-foreground">{pending?.email}</strong>. Uschovejte si ho — je dokladem o tom, že jste od smlouvy odstoupili ve lhůtě.
            </p>
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Co bude dál</p>
              <p>1. Zboží nám zašlete nebo předejte nejpozději do 14 dnů od dnešního dne na adresu Vapesport Vlach s.r.o., Paskovská 636/275, 720 00 Ostrava-Hrabová.</p>
              <p>2. Náklady na vrácení zboží nesete vy.</p>
              <p>3. Peníze včetně nákladů na dodání (ve výši nejlevnějšího nabízeného způsobu) vám vrátíme do 14 dnů od odstoupení. Vrácení můžeme pozdržet do chvíle, než zboží obdržíme nebo než nám prokážete jeho odeslání.</p>
            </div>
          </div>
        ) : pending ? (
          <div className="rounded-lg border border-border bg-card p-6 md:p-8">
            <h2 className="font-heading text-xl font-semibold mb-2">Zkontrolujte a potvrďte</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Odstoupení se odešle až po potvrzení. Zkontrolujte prosím údaje.
            </p>

            <dl className="text-sm space-y-3 mb-6">
              <div className="flex gap-4">
                <dt className="text-muted-foreground w-40 shrink-0">Číslo objednávky</dt>
                <dd className="font-medium">{pending.order_number}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="text-muted-foreground w-40 shrink-0">Jméno a příjmení</dt>
                <dd className="font-medium">{pending.full_name}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="text-muted-foreground w-40 shrink-0">E-mail</dt>
                <dd className="font-medium">{pending.email}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="text-muted-foreground w-40 shrink-0">Účet pro vrácení</dt>
                <dd className="font-medium">{pending.bank_account || "neuvedeno — vrátíme stejným způsobem, jakým jsme platbu přijali"}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="text-muted-foreground w-40 shrink-0">Rozsah odstoupení</dt>
                <dd className="font-medium">{pending.items || "celá objednávka"}</dd>
              </div>
            </dl>

            <div className="flex flex-col md:flex-row gap-3">
              <Button onClick={handleConfirm} disabled={loading} className="w-full md:w-auto">
                {loading ? "Odesílám…" : "Potvrdit odstoupení"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setPending(null)}
                disabled={loading}
                className="w-full md:w-auto"
              >
                Zpět k úpravě
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReview} className="space-y-5 rounded-lg border border-border bg-card p-6 md:p-8">
            <div className="space-y-2">
              <Label htmlFor="order_number">Číslo objednávky</Label>
              <Input
                id="order_number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="např. 2026000123"
                required
                maxLength={64}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Jméno a příjmení</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jan Novák"
                required
                maxLength={160}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.cz"
                required
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_account">Číslo účtu pro vrácení peněz</Label>
              <Input
                id="bank_account"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="123456789/0800 — nepovinné"
                maxLength={64}
              />
              <p className="text-xs text-muted-foreground">
                Nevyplníte-li účet, vrátíme peníze stejným způsobem, jakým jsme je přijali.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="items">Které zboží vracíte</Label>
              <Textarea
                id="items"
                value={items}
                onChange={(e) => setItems(e.target.value)}
                placeholder="Nechte prázdné, pokud vracíte celou objednávku. Jinak vypište položky."
                maxLength={2000}
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full md:w-auto">
              Pokračovat
            </Button>
            <p className="text-xs text-muted-foreground pt-2">
              Pozn.: Právo na odstoupení nelze uplatnit u zboží vyrobeného podle vašeho přání nebo přizpůsobeného vašim
              osobním potřebám (§ 1837 obč. zák.) ani u služeb, které již byly na vaši výslovnou žádost zcela poskytnuty.
              Zboží si můžete vyzkoušet stejně, jako byste to udělali v prodejně; odpovídáte však za snížení jeho hodnoty,
              pokud s ním nakládáte nad tento rámec. Náklady na vrácení zboží nese kupující. Peníze vám vrátíme do 14 dnů
              od odstoupení, stejným způsobem, jakým jsme je přijali.
            </p>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Withdrawal;
