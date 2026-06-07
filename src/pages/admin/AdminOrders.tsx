import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import OrderSummaryTable from "@/components/OrderSummaryTable";
import { fmtCZK } from "@/lib/vat";
import { DataTableToolbar, type ChipFilter } from "@/components/admin/DataTableToolbar";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Order = Tables<"orders">;
type StatusFilter = "all" | "nova" | "zpracovava_se" | "odeslano" | "dorucena" | "zrusena";

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
type OrderStatus = Exclude<StatusFilter, "all">;
const STATUS_FLOW: OrderStatus[] = ["nova", "zpracovava_se", "odeslano", "dorucena", "zrusena"];

interface OrderItem { name: string; qty: number; unitGross: number }

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Chyba při načítání objednávek");
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("orders-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (!q) return true;
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        (o.company_name ?? "").toLowerCase().includes(q) ||
        `${o.first_name ?? ""} ${o.last_name ?? ""}`.toLowerCase().includes(q)
      );
    });
  }, [orders, query, status]);

  // Reset to first page when filters change
  useEffect(() => { setPage(1); }, [query, status, pageSize]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const filters: ChipFilter<StatusFilter>[] = [
    { value: "all", label: "Vše", count: orders.length },
    ...STATUS_FLOW.map((s) => ({
      value: s,
      label: statusLabel[s],
      count: orders.filter((o) => o.status === s).length,
    })),
  ];

  const updateStatus = async (id: string, newStatus: Order["status"]) => {
    setUpdatingId(id);
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    if (error) toast.error("Změna stavu se nezdařila");
    else {
      toast.success(`Stav změněn: ${statusLabel[newStatus]}`);
      if (selected?.id === id) setSelected({ ...selected, status: newStatus });
    }
    setUpdatingId(null);
  };

  const selectedItems: OrderItem[] = useMemo(() => {
    if (!selected) return [];
    return (selected.items as unknown as OrderItem[]) ?? [];
  }, [selected]);

  return (
    <section className="p-8 max-w-[1400px]">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Objednávky</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {filtered.length} z {orders.length} objednávek
      </p>

      <DataTableToolbar<StatusFilter>
        query={query}
        onQueryChange={setQuery}
        placeholder="Hledat podle čísla, e-mailu, firmy…"
        filters={filters}
        active={status}
        onFilterChange={setStatus}
      />

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Načítám…
          </div>
        ) : paged.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Žádné objednávky neodpovídají filtru.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <th className="px-4 py-3 font-semibold">Číslo</th>
                <th className="px-4 py-3 font-semibold">Datum</th>
                <th className="px-4 py-3 font-semibold">Zákazník</th>
                <th className="px-4 py-3 font-semibold">Typ</th>
                <th className="px-4 py-3 font-semibold text-right">Částka</th>
                <th className="px-4 py-3 font-semibold">Stav</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.order_number}</td>
                  <td className="px-4 py-3">{new Date(o.created_at).toLocaleDateString("cs-CZ")}</td>
                  <td className="px-4 py-3 font-medium">
                    {o.company_name || `${o.first_name ?? ""} ${o.last_name ?? ""}`.trim() || o.email}
                    <div className="text-xs text-muted-foreground font-normal">{o.email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {o.is_b2b ? (
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">B2B</span>
                    ) : (
                      <span className="text-muted-foreground">B2C</span>
                    )}
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
      </div>

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-sm text-muted-foreground">{selected.order_number}</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColor[selected.status]}`}>
                    {statusLabel[selected.status]}
                  </span>
                  {selected.is_b2b && (
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold">B2B</span>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Vytvořeno {new Date(selected.created_at).toLocaleString("cs-CZ")}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mt-2">
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Zákazník</h3>
                  {selected.company_name && <p className="font-medium">{selected.company_name}</p>}
                  {selected.ico && <p className="text-muted-foreground">IČO: {selected.ico}{selected.dic ? ` · DIČ: ${selected.dic}` : ""}</p>}
                  <p className="font-medium mt-1">
                    {`${selected.first_name ?? ""} ${selected.last_name ?? ""}`.trim() || "—"}
                  </p>
                  <p className="text-muted-foreground">{selected.email}</p>
                  {selected.phone && <p className="text-muted-foreground">{selected.phone}</p>}
                  {(selected.street || selected.city) && (
                    <p className="text-muted-foreground mt-2">
                      {selected.street}{selected.street && (selected.city || selected.zip) ? ", " : ""}
                      {selected.zip} {selected.city}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Doprava a platba</h3>
                  <p><span className="text-muted-foreground">Doprava:</span> {selected.shipping_label} ({fmtCZK(selected.shipping_gross)})</p>
                  <p><span className="text-muted-foreground">Platba:</span> {selected.payment_label}{selected.payment_gross > 0 ? ` (+${fmtCZK(selected.payment_gross)})` : ""}</p>
                  {selected.packeta_point && (
                    <p className="mt-1"><span className="text-muted-foreground">Výdejní místo:</span> {selected.packeta_point}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-foreground text-sm">Fakturační rozpis</h3>
                <OrderSummaryTable
                  items={selectedItems}
                  shippingGross={selected.shipping_gross}
                  paymentGross={selected.payment_gross}
                  shippingLabel={selected.shipping_label ?? "Doprava"}
                  paymentLabel={selected.payment_label ?? "Platba"}
                />
              </div>

              {selected.note && (
                <div className="mt-4 text-sm">
                  <h3 className="font-semibold mb-1 text-foreground">Poznámka zákazníka</h3>
                  <p className="text-muted-foreground">{selected.note}</p>
                </div>
              )}

              <div className="mt-6 border-t border-border pt-4">
                <h3 className="font-semibold mb-2 text-foreground text-sm">Změnit stav</h3>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FLOW.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      disabled={updatingId === selected.id || selected.status === s}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                        selected.status === s
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {statusLabel[s]}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AdminOrders;
