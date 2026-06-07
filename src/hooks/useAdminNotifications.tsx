import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminCounts {
  newOrders: number;
  pendingB2B: number;
  pendingWithdrawals: number;
}

/**
 * Subscribes to realtime inserts on orders, b2b_profiles and
 * withdrawal_requests. Returns live badge counts and triggers a toast
 * whenever a brand-new event appears.
 */
export const useAdminNotifications = (enabled: boolean) => {
  const [counts, setCounts] = useState<AdminCounts>({
    newOrders: 0,
    pendingB2B: 0,
    pendingWithdrawals: 0,
  });

  // initial load
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      const [orders, b2b, withdraw] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "nova"),
        supabase.from("b2b_profiles").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("withdrawal_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      if (cancelled) return;
      setCounts({
        newOrders: orders.count ?? 0,
        pendingB2B: b2b.count ?? 0,
        pendingWithdrawals: withdraw.count ?? 0,
      });
    })();
    return () => { cancelled = true; };
  }, [enabled]);

  // realtime
  useEffect(() => {
    if (!enabled) return;
    const channel = supabase
      .channel("admin-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        const row = payload.new as { order_number?: string; total_gross?: number };
        setCounts((c) => ({ ...c, newOrders: c.newOrders + 1 }));
        toast.success("Nová objednávka", {
          description: `${row.order_number ?? ""} · ${((row.total_gross ?? 0)).toLocaleString("cs-CZ")} Kč`,
        });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "b2b_profiles" }, (payload) => {
        const row = payload.new as { company_name?: string };
        setCounts((c) => ({ ...c, pendingB2B: c.pendingB2B + 1 }));
        toast("Nová B2B registrace", { description: row.company_name ?? "" });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "withdrawal_requests" }, (payload) => {
        const row = payload.new as { order_number?: string };
        setCounts((c) => ({ ...c, pendingWithdrawals: c.pendingWithdrawals + 1 }));
        toast("Žádost o odstoupení", { description: row.order_number ?? "" });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled]);

  return counts;
};
