import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, LayoutDashboard, ShoppingCart, Users, Package, LogOut, Check, X, ChevronLeft, ChevronRight, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type View = "overview" | "orders" | "b2b" | "products" | "settings";

const orders = [
  { id: "OBJ-2026-001", date: "2026-03-10", customer: "CykloPro s.r.o.", amount: "12 450 Kč", status: "Nová" as const },
  { id: "OBJ-2026-002", date: "2026-03-09", customer: "Jan Malý", amount: "2 890 Kč", status: "Zpracovává se" as const },
  { id: "OBJ-2026-003", date: "2026-03-08", customer: "BikeWorld a.s.", amount: "34 200 Kč", status: "Odesláno" as const },
  { id: "OBJ-2026-004", date: "2026-03-08", customer: "Eva Krátká", amount: "1 490 Kč", status: "Nová" as const },
  { id: "OBJ-2026-005", date: "2026-03-07", customer: "GravelShop s.r.o.", amount: "8 760 Kč", status: "Zpracovává se" as const },
];

const statusColor: Record<string, string> = {
  "Nová": "bg-primary/15 text-primary",
  "Zpracovává se": "bg-amber-100 text-amber-800",
  "Odesláno": "bg-emerald-100 text-emerald-800",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [view, setView] = useState<View>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [registrations, setRegistrations] = useState<Tables<"b2b_profiles">[]>([]);
  const [approved, setApproved] = useState<Tables<"b2b_profiles">[]>([]);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/admin"); return; }

    const checkAdmin = async () => {
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (!isAdmin) { await signOut(); navigate("/admin"); return; }
      await Promise.all([loadRegistrations(), loadApproved()]);
      setCheckingAccess(false);
    };
    checkAdmin();
  }, [user, authLoading, navigate, signOut]);

  const loadRegistrations = async () => {
    const { data } = await supabase
      .from("b2b_profiles")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (data) setRegistrations(data);
  };

  const loadApproved = async () => {
    const { data } = await supabase
      .from("b2b_profiles")
      .select("*")
      .eq("status", "approved")
      .order("company_name", { ascending: true });
    if (data) setApproved(data);
  };

  const handleApprove = async (id: string) => {
    setLoadingAction(id);
    const { data } = await supabase
      .from("b2b_profiles")
      .update({ status: "approved", discount_percent: 30 })
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

  const handleLogout = async () => { await signOut(); navigate("/admin"); };

  if (authLoading || checkingAccess) {
    return <div className="min-h-screen bg-secondary flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const navItems = [
    { key: "overview" as View, label: "Přehled", icon: LayoutDashboard },
    { key: "orders" as View, label: "Objednávky", icon: ShoppingCart, count: orders.filter((o) => o.status === "Nová").length },
    { key: "b2b" as View, label: "B2B Partneři", icon: Users, count: registrations.length },
    { key: "products" as View, label: "Produkty", icon: Package },
    { key: "settings" as View, label: "Nastavení", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-secondary flex">
      <aside className={`${collapsed ? "w-16" : "w-64"} bg-background border-r border-border flex flex-col transition-all duration-200 shrink-0`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && <span className="font-heading font-bold text-foreground text-sm tracking-tight">Vapesport Admin</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground transition-colors p-1" aria-label={collapsed ? "Rozbalit menu" : "Sbalit menu"}>
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <button key={item.key} onClick={() => setView(item.key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${view === item.key ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`} title={collapsed ? item.label : undefined}>
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count != null && item.count > 0 && <Badge variant="destructive" className="text-xs px-1.5 py-0.5 min-w-[20px] justify-center">{item.count}</Badge>}
                </>
              )}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-border">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title={collapsed ? "Odhlásit se" : undefined}>
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Odhlásit se</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {view === "overview" && (
          <section aria-labelledby="overview-heading">
            <h1 id="overview-heading" className="text-2xl font-heading font-bold text-foreground mb-6">Přehled</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <article className="bg-background border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Nové objednávky</p>
                <p className="text-3xl font-heading font-bold text-foreground">{orders.filter((o) => o.status === "Nová").length}</p>
              </article>
              <article className="bg-background border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Čekající B2B registrace</p>
                <p className="text-3xl font-heading font-bold text-primary">{registrations.length}</p>
              </article>
              <article className="bg-background border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Celkem produktů</p>
                <p className="text-3xl font-heading font-bold text-foreground">6</p>
              </article>
            </div>
            <h2 className="text-lg font-heading font-bold text-foreground mb-3">Poslední objednávky</h2>
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/50"><th className="text-left px-4 py-3 font-semibold text-foreground">ID</th><th className="text-left px-4 py-3 font-semibold text-foreground">Datum</th><th className="text-left px-4 py-3 font-semibold text-foreground">Zákazník</th><th className="text-right px-4 py-3 font-semibold text-foreground">Částka</th><th className="text-left px-4 py-3 font-semibold text-foreground">Stav</th></tr></thead>
                  <tbody>
                    {orders.slice(0, 3).map((o) => (
                      <tr key={o.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.id}</td>
                        <td className="px-4 py-3 text-foreground">{o.date}</td>
                        <td className="px-4 py-3 text-foreground font-medium">{o.customer}</td>
                        <td className="px-4 py-3 text-right text-foreground font-semibold">{o.amount}</td>
                        <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColor[o.status]}`}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {view === "orders" && (
          <section aria-labelledby="orders-heading">
            <h1 id="orders-heading" className="text-2xl font-heading font-bold text-foreground mb-6">Objednávky</h1>
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/50"><th className="text-left px-4 py-3 font-semibold text-foreground">ID Objednávky</th><th className="text-left px-4 py-3 font-semibold text-foreground">Datum</th><th className="text-left px-4 py-3 font-semibold text-foreground">Zákazník</th><th className="text-right px-4 py-3 font-semibold text-foreground">Částka</th><th className="text-left px-4 py-3 font-semibold text-foreground">Stav</th></tr></thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.id}</td>
                        <td className="px-4 py-3 text-foreground">{o.date}</td>
                        <td className="px-4 py-3 text-foreground font-medium">{o.customer}</td>
                        <td className="px-4 py-3 text-right text-foreground font-semibold">{o.amount}</td>
                        <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColor[o.status]}`}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {view === "b2b" && (
          <section aria-labelledby="b2b-heading">
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
                {registrations.length === 0 ? (
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
                {approved.length === 0 ? (
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
                                      if (v !== p.discount_percent || true) updatePartner(p.id, { discount_percent: v });
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
        )}

        {view === "products" && (
          <section aria-labelledby="products-heading">
            <h1 id="products-heading" className="text-2xl font-heading font-bold text-foreground mb-6">Produkty</h1>
            <div className="bg-background border border-border rounded-lg p-8 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-lg">Správa produktů bude dostupná v další verzi.</p>
            </div>
          </section>
        )}

        {view === "settings" && <AdminSettings />}
      </main>
    </div>
  );
};

const GA_ID_RE = /^G-[A-Z0-9]{4,}$/i;

const AdminSettings = () => {
  const [gaId, setGaId] = useState("");
  const [initialGaId, setInitialGaId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ga4_measurement_id")
        .maybeSingle();
      const v = data?.value ?? "";
      setGaId(v);
      setInitialGaId(v);
      setLoading(false);
    })();
  }, []);

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
    <section aria-labelledby="settings-heading" className="max-w-2xl">
      <h1 id="settings-heading" className="text-2xl font-heading font-bold text-foreground mb-6">Nastavení</h1>

      <div className="bg-background border border-border rounded-lg p-6">
        <h2 className="text-lg font-heading font-semibold text-foreground mb-1">Google Analytics 4</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Vložte své GA4 Measurement ID. Po uložení bude skript automaticky načten na celém webu.
        </p>

        <label htmlFor="ga4-id" className="block text-sm font-medium text-foreground mb-2">
          Measurement ID
        </label>
        <Input
          id="ga4-id"
          placeholder="G-XXXXXXXXXX"
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
      </div>
    </section>
  );
};

export default AdminDashboard;

