import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  LogOut,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type View = "overview" | "orders" | "b2b" | "products";

const pendingRegistrations = [
  { id: 1, date: "2026-03-08", company: "CykloPro s.r.o.", ico: "12345678", contact: "Jan Novák", email: "jan@cyklopro.cz" },
  { id: 2, date: "2026-03-09", company: "BikeWorld a.s.", ico: "87654321", contact: "Petra Svobodová", email: "petra@bikeworld.cz" },
  { id: 3, date: "2026-03-10", company: "GravelShop s.r.o.", ico: "11223344", contact: "Martin Dvořák", email: "martin@gravelshop.cz" },
];

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

const navItems = [
  { key: "overview" as View, label: "Přehled", icon: LayoutDashboard },
  { key: "orders" as View, label: "Objednávky", icon: ShoppingCart, count: orders.filter((o) => o.status === "Nová").length },
  { key: "b2b" as View, label: "B2B Partneři", icon: Users, count: pendingRegistrations.length },
  { key: "products" as View, label: "Produkty", icon: Package },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [registrations, setRegistrations] = useState(pendingRegistrations);

  const handleApprove = (id: number) => setRegistrations((r) => r.filter((x) => x.id !== id));
  const handleReject = (id: number) => setRegistrations((r) => r.filter((x) => x.id !== id));

  return (
    <div className="min-h-screen bg-secondary flex">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? "w-16" : "w-64"} bg-background border-r border-border flex flex-col transition-all duration-200 shrink-0`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <span className="font-heading font-bold text-foreground text-sm tracking-tight">
              Vapesport Admin
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label={collapsed ? "Rozbalit menu" : "Sbalit menu"}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                view === item.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count && item.count > 0 && (
                    <Badge
                      variant="destructive"
                      className="text-xs px-1.5 py-0.5 min-w-[20px] justify-center"
                    >
                      {item.count}
                    </Badge>
                  )}
                </>
              )}
              {collapsed && item.count && item.count > 0 && (
                <span className="absolute ml-6 -mt-4 w-2 h-2 bg-destructive rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-border">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title={collapsed ? "Odhlásit se" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Odhlásit se</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {/* Overview */}
        {view === "overview" && (
          <section aria-labelledby="overview-heading">
            <h1 id="overview-heading" className="text-2xl font-heading font-bold text-foreground mb-6">
              Přehled
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <article className="bg-background border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Nové objednávky</p>
                <p className="text-3xl font-heading font-bold text-foreground">
                  {orders.filter((o) => o.status === "Nová").length}
                </p>
              </article>
              <article className="bg-background border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Čekající B2B registrace</p>
                <p className="text-3xl font-heading font-bold text-primary">
                  {registrations.length}
                </p>
              </article>
              <article className="bg-background border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Celkem produktů</p>
                <p className="text-3xl font-heading font-bold text-foreground">6</p>
              </article>
            </div>

            {/* Quick: latest orders */}
            <h2 className="text-lg font-heading font-bold text-foreground mb-3">Poslední objednávky</h2>
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-semibold text-foreground">ID</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Datum</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Zákazník</th>
                      <th className="text-right px-4 py-3 font-semibold text-foreground">Částka</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Stav</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 3).map((o) => (
                      <tr key={o.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.id}</td>
                        <td className="px-4 py-3 text-foreground">{o.date}</td>
                        <td className="px-4 py-3 text-foreground font-medium">{o.customer}</td>
                        <td className="px-4 py-3 text-right text-foreground font-semibold">{o.amount}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColor[o.status]}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Orders */}
        {view === "orders" && (
          <section aria-labelledby="orders-heading">
            <h1 id="orders-heading" className="text-2xl font-heading font-bold text-foreground mb-6">
              Objednávky
            </h1>
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-semibold text-foreground">ID Objednávky</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Datum</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Zákazník</th>
                      <th className="text-right px-4 py-3 font-semibold text-foreground">Částka</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Stav</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.id}</td>
                        <td className="px-4 py-3 text-foreground">{o.date}</td>
                        <td className="px-4 py-3 text-foreground font-medium">{o.customer}</td>
                        <td className="px-4 py-3 text-right text-foreground font-semibold">{o.amount}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColor[o.status]}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* B2B Partners */}
        {view === "b2b" && (
          <section aria-labelledby="b2b-heading">
            <h1 id="b2b-heading" className="text-2xl font-heading font-bold text-foreground mb-6">
              Nové B2B Registrace
            </h1>
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
                        <th className="text-left px-4 py-3 font-semibold text-foreground">Email</th>
                        <th className="text-right px-4 py-3 font-semibold text-foreground">Akce</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((r) => (
                        <tr key={r.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 text-foreground">{r.date}</td>
                          <td className="px-4 py-3">
                            <span className="text-foreground font-medium block">{r.company}</span>
                            <span className="text-xs text-muted-foreground">IČO: {r.ico}</span>
                          </td>
                          <td className="px-4 py-3 text-foreground">{r.contact}</td>
                          <td className="px-4 py-3 text-foreground">{r.email}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                className="gap-1.5 text-xs font-bold"
                                onClick={() => handleApprove(r.id)}
                              >
                                <Check className="w-4 h-4" />
                                SCHVÁLIT
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-xs font-bold"
                                onClick={() => handleReject(r.id)}
                              >
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
          </section>
        )}

        {/* Products */}
        {view === "products" && (
          <section aria-labelledby="products-heading">
            <h1 id="products-heading" className="text-2xl font-heading font-bold text-foreground mb-6">
              Produkty
            </h1>
            <div className="bg-background border border-border rounded-lg p-8 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-lg">Správa produktů bude dostupná v další verzi.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
