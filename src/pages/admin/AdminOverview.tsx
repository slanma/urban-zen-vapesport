import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Users, Package, Sparkles as SparklesIcon, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { products } from "@/data/products";
import { isServiceCategory } from "@/lib/serviceCategories";
import { fmtCZK } from "@/lib/vat";
import { StatCard } from "@/components/admin/StatCard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Order = Tables<"orders">;

const statusColor: Record<string, string> = {
  nova: "bg-primary/15 text-primary",
  zpracovava_se: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  odeslano: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  dorucena: "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200",
  zrusena: "bg-destructive/15 text-destructive",
};
const statusLabel: Record<string, string> = {
  nova: "Nová",
  zpracovava_se: "Zpracovává se",
  odeslano: "Odesláno",
  dorucena: "Doručena",
  zrusena: "Zrušena",
};

const AdminOverview = () => {
  const [pendingB2B, setPendingB2B] = useState<Tables<"b2b_profiles">[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    supabase
      .from("b2b_profiles")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPendingB2B(data ?? []));

    const since = new Date();
    since.setDate(since.getDate() - 14);
    supabase
      .from("orders")
      .select("*")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders(data ?? []));
  }, []);

  const physicalCount = products.filter((p) => !isServiceCategory(p.categoryLabel)).length;
  const serviceCount = products.filter((p) => isServiceCategory(p.categoryLabel)).length;

  const newOrders = orders.filter((o) => o.status === "nova").length;
  const revenue14d = orders.reduce((s, o) => s + (o.total_gross ?? 0), 0);

  // Build 14-day series
  const series = useMemo(() => {
    const days: { date: string; label: string; count: number; revenue: number }[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key,
        label: d.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" }),
        count: 0,
        revenue: 0,
      });
    }
    const map = new Map(days.map((d) => [d.date, d]));
    for (const o of orders) {
      const key = o.created_at.slice(0, 10);
      const d = map.get(key);
      if (d) {
        d.count += 1;
        d.revenue += o.total_gross ?? 0;
      }
    }
    return days;
  }, [orders]);

  const trendCounts = series.map((s) => s.count);
  const trendRevenue = series.map((s) => Math.round(s.revenue / 1000));

  return (
    <section className="p-8 max-w-[1400px]" aria-labelledby="overview-heading">
      <h1 id="overview-heading" className="text-2xl font-heading font-bold text-foreground mb-2">
        Přehled
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Posledních 14 dní</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Nové objednávky"
          value={newOrders}
          icon={ShoppingCart}
          accent="primary"
          trend={trendCounts}
        />
        <StatCard
          label="Tržby (14 dní)"
          value={fmtCZK(revenue14d)}
          icon={TrendingUp}
          accent="success"
          trend={trendRevenue}
        />
        <StatCard
          label="Čekající B2B"
          value={pendingB2B.length}
          icon={Users}
          accent="warning"
          hint={pendingB2B.length > 0 ? "Čeká na schválení" : "Vše vyřešeno"}
        />
        <StatCard
          label="Produktů celkem"
          value={physicalCount + serviceCount}
          icon={Package}
          hint={`${physicalCount} brašen · ${serviceCount} služeb`}
        />
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-lg p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-bold text-foreground">Objednávky za posledních 14 dní</h2>
          <span className="text-xs text-muted-foreground">{orders.length} objednávek</span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#ordersFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h2 className="text-lg font-heading font-bold text-foreground mb-3">Poslední objednávky</h2>
      <div className="bg-card border border-border rounded-lg overflow-hidden mb-8">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Zatím žádné objednávky. Objeví se zde, jakmile zákazník dokončí pokladnu.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-4 py-3 font-semibold">Číslo</th>
                <th className="px-4 py-3 font-semibold">Datum</th>
                <th className="px-4 py-3 font-semibold">Zákazník</th>
                <th className="px-4 py-3 font-semibold text-right">Částka</th>
                <th className="px-4 py-3 font-semibold">Stav</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.order_number}</td>
                  <td className="px-4 py-3">{new Date(o.created_at).toLocaleDateString("cs-CZ")}</td>
                  <td className="px-4 py-3 font-medium">
                    {o.company_name || `${o.first_name ?? ""} ${o.last_name ?? ""}`.trim() || o.email}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{fmtCZK(o.total_gross)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColor[o.status]}`}>
                      {statusLabel[o.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {orders.length > 5 && (
          <Link to="/admin/objednavky" className="block px-4 py-3 text-sm text-primary font-semibold hover:bg-muted/40 border-t border-border">
            Zobrazit všechny objednávky →
          </Link>
        )}
      </div>

      {pendingB2B.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-lg font-heading font-bold text-foreground mb-3">
            Čekající B2B registrace ({pendingB2B.length})
          </h2>
          <ul className="space-y-2 text-sm">
            {pendingB2B.slice(0, 5).map((r) => (
              <li key={r.id} className="flex justify-between border-b border-border last:border-0 pb-2">
                <span className="font-medium">{r.company_name}</span>
                <span className="text-muted-foreground">IČO: {r.ico}</span>
              </li>
            ))}
          </ul>
          <Link to="/admin-dashboard" className="text-primary text-sm font-semibold mt-3 inline-block">
            Spravovat B2B partnery →
          </Link>
        </div>
      )}

      <SiteSettingsPanel />
    </section>
  );
};

export default AdminOverview;
