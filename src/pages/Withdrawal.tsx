import { useEffect, useState } from "react";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  order_number: z.string().trim().min(1, "Zadejte číslo objednávky").max(64),
  email: z.string().trim().email("Neplatný e-mail").max(255),
});

const Withdrawal = () => {
  const { user } = useAuth();
  const [isB2B, setIsB2B] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ order_number: orderNumber, email });
    if (!parsed.success) {
      toast({ title: "Zkontrolujte údaje", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("withdrawal_requests")
      .insert({
        order_number: parsed.data.order_number,
        email: parsed.data.email,
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
      body: { order_number: parsed.data.order_number, email: parsed.data.email, request_id: data?.id },
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
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h2 className="font-heading text-xl font-semibold mb-3">Žádost odeslána</h2>
            <p className="text-muted-foreground">
              Vaše žádost o odstoupení od smlouvy byla úspěšně odeslána. Na e-mail jsme vám zaslali potvrzení.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-border bg-card p-6 md:p-8">
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
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? "Odesílám…" : "Odeslat žádost"}
            </Button>
            <p className="text-xs text-muted-foreground pt-2">
              Pozn.: Právo na odstoupení nelze uplatnit u zboží upraveného podle vašeho přání nebo vyrobeného na míru (§ 1837 obč. zák.) ani u jednorázových služeb (např. tréninky, konzultace), které již byly s vaším souhlasem poskytnuty. Náklady na vrácení zboží nese kupující. Peníze vám vrátíme do 14 dnů od odstoupení, stejným způsobem, jakým jsme je přijali.
            </p>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Withdrawal;
