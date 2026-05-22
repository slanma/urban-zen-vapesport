import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { products } from "@/data/products";
import { isServiceCategory } from "@/lib/serviceCategories";

const orders = [
  { id: "OBJ-2026-001", date: "2026-03-10", customer: "CykloPro s.r.o.", amount: "12 450 Kč", status: "Nová" },
  { id: "OBJ-2026-002", date: "2026-03-09", customer: "Jan Malý", amount: "2 890 Kč", status: "Zpracovává se" },
  { id: "OBJ-2026-003", date: "2026-03-08", customer: "BikeWorld a.s.", amount: "34 200 Kč", status: "Odesláno" },
];

const statusColor: Record<string, string> = {
  "Nová": "bg-primary/15 text-primary",
  "Zpracovává se": "bg-amber-100 text-amber-800",
  "Odesláno": "bg-emerald-100 text-emerald-800",
};

const AdminOverview = () => {
  const [pendingB2B, setPendingB2B] = useState<Tables<"b2b_profiles">[]>([]);

  useEffect(() => {
    supabase
      .from("b2b_profiles")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPendingB2B(data ?? []));
  }, []);

  const physicalCount = products.filter((p) => !isServiceCategory(p.categoryLabel)).length;
  const serviceCount = products.filter((p) => isServiceCategory(p.categoryLabel)).length;
  const newOrders = orders.filter((o) => o.status === "Nová").length;

  return (
    <section className="p-8 max-w-[1200px]" aria-labelledby="overview-heading">
      <h1 id="overview-heading" className="text-2xl font-heading font-bold text-foreground mb-6">
        Přehled
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <article className="bg-background border border-border rounded-lg p-5">
          <p className="text-sm text-muted-foreground mb-1">Nové objednávky</p>
          <p className="text-3xl font-heading font-bold text-foreground">{newOrders}</p>
        </article>
        <article className="bg-background border border-border rounded-lg p-5">
          <p className="text-sm text-muted-foreground mb-1">Čekající B2B</p>
          <p className="text-3xl font-heading font-bold text-primary">{pendingB2B.length}</p>
        </article>
        <article className="bg-background border border-border rounded-lg p-5">
          <p className="text-sm text-muted-foreground mb-1">Produktů (brašny)</p>
          <p className="text-3xl font-heading font-bold text-foreground">{physicalCount}</p>
        </article>
        <article className="bg-background border border-border rounded-lg p-5">
          <p className="text-sm text-muted-foreground mb-1">Služby (AI & Golf)</p>
          <p className="text-3xl font-heading font-bold text-foreground">{serviceCount}</p>
        </article>
      </div>

      <h2 className="text-lg font-heading font-bold text-foreground mb-3">Poslední objednávky</h2>
      <div className="bg-background border border-border rounded-lg overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Datum</th>
              <th className="px-4 py-3 font-semibold">Zákazník</th>
              <th className="px-4 py-3 font-semibold text-right">Částka</th>
              <th className="px-4 py-3 font-semibold">Stav</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.id}</td>
                <td className="px-4 py-3">{o.date}</td>
                <td className="px-4 py-3 font-medium">{o.customer}</td>
                <td className="px-4 py-3 text-right font-semibold">{o.amount}</td>
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

      {pendingB2B.length > 0 && (
        <div className="bg-background border border-border rounded-lg p-5">
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
    </section>
  );
};

export default AdminOverview;
