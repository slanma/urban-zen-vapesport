import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import OrderSummaryTable, { type OrderLine } from "@/components/OrderSummaryTable";
import { fmtCZK } from "@/lib/vat";
import { resolveColor } from "@/lib/colorPalette";
import { feedProducts } from "@/data/feedProducts";
import { getEffectiveUnitPricing } from "@/lib/pricing";
import { DataTableToolbar, type ChipFilter } from "@/components/admin/DataTableToolbar";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import PaymentQrPanel from "@/components/admin/PaymentQrPanel";

/** Normalizace názvu produktu pro spárování (sjednotí uvozovky a mezery). */
const normName = (s: string): string =>
  (s ?? "")
    .toLowerCase()
    .replace(/[""„"”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();

/** Mapa feed produktů podle názvu — pro dopočet ceny u starých objednávek s 0. */
const productByName = new Map(feedProducts.map((p) => [normName(p.name), p]));

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
/** Stavy, u kterých se zákazníkovi posílá informační e-mail. */
const STATUS_EMAIL: Record<string, string> = {
  zpracovava_se: "Objednávka byla přijata",
  odeslano: "Objednávka byla odeslána",
};

/** Barvu z klíče („flamingo-luxe") přepíše na čitelný text („Flamingo Luxe"). */
const prettyColor = (c: unknown): string =>
  typeof c === "string" && c
    ? c
        .split(/[-_]/)
        .map((w) => (w.length <= 1 ? w.toUpperCase() + "." : w.charAt(0).toUpperCase() + w.slice(1)))
        .join(" ")
    : "";

/** Položky objednávky převede na tvar, který čeká /api/send-email. */
const emailItems = (raw: unknown) => {
  if (!Array.isArray(raw)) return [];
  return raw.map((it: any) => {
    const barva = prettyColor(it?.color);
    return {
      name: barva ? `${it?.name ?? ""} – ${barva}` : String(it?.name ?? ""),
      qty: Number(it?.qty) || 1,
      // B2C ukládá unit_gross, B2B unit_price — bereme, co je k dispozici.
      price: Number(it?.unit_gross ?? it?.unit_price ?? 0),
    };
  });
};

const STATUS_FLOW: OrderStatus[] = ["nova", "zpracovava_se", "odeslano", "dorucena", "zrusena"];

interface OrderItem { name: string; qty: number; unitGross: number }

/** Tvar položky tak, jak je uložená v objednávce (Checkout ji ukládá snake_case). */
interface StoredOrderItem {
  name: string;
  qty: number | string;
  unit_gross?: number | string;
  unitGross?: number | string;
  color?: string | null;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOrders(data ?? []);
    } catch {
      setLoadError(true);
      setOrders([]);
    } finally {
      setLoading(false);
    }
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

  const updateStatus = async (order: Order, newStatus: Order["status"]) => {
    const id = order.id;
    setUpdatingId(id);

    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast.error("Změna stavu se nezdařila");
      setUpdatingId(null);
      return;
    }

    toast.success(`Stav změněn: ${statusLabel[newStatus]}`);
    if (selected?.id === id) setSelected({ ...selected, status: newStatus });

    // U vybraných stavů nabídneme odeslání informace zákazníkovi.
    const emailSubject = STATUS_EMAIL[newStatus as string];
    if (emailSubject) {
      const komu = order.email || "(e-mail v objednávce chybí)";
      const potvrdit = window.confirm(
        `Odeslat zákazníkovi e-mail „${emailSubject}"?\n\n` +
          `Objednávka: ${order.order_number}\nNa adresu: ${komu}`
      );

      if (potvrdit) {
        // U odeslané zásilky se dá připojit číslo pro sledování (nepovinné).
        let trackingNumber: string | null = null;
        if (newStatus === "odeslano") {
          trackingNumber =
            window.prompt("Číslo zásilky pro sledování (nepovinné — nechte prázdné a potvrďte):", "") || null;
        }

        try {
          const { data: sess } = await supabase.auth.getSession();
          const token = sess.session?.access_token;
          if (!token) throw new Error("Vypršelo přihlášení, přihlaste se prosím znovu.");

          const res = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "status",
              token,
              status: newStatus,
              order: {
                orderNumber: order.order_number,
                customerEmail: order.email || null,
                customerName: `${order.first_name ?? ""} ${order.last_name ?? ""}`.trim(),
                total: order.total_gross,
                items: emailItems(order.items),
                trackingNumber,
              },
            }),
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data?.error || "Odeslání se nezdařilo.");
          toast.success(`E-mail odeslán na ${data?.sentTo || komu}`);
        } catch (e: any) {
          toast.error("E-mail se nepodařilo odeslat", { description: String(e?.message || e) });
        }
      }
    }

    setUpdatingId(null);
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm("Opravdu smazat tuto objednávku? Akci nelze vrátit zpět.")) return;
    setUpdatingId(id);
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      toast.error("Objednávku se nepodařilo smazat", { description: error.message });
    } else {
      toast.success("Objednávka smazána");
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setSelected(null);
    }
    setUpdatingId(null);
  };

  const selectedItems: OrderLine[] = useMemo(() => {
    if (!selected) return [];
    const raw = (selected.items as unknown as StoredOrderItem[]) ?? [];
    const isB2B = selected.is_b2b === true;
    return raw.map((it) => {
      const colorLabel = it.color ? resolveColor(it.color)?.label ?? it.color : "";
      // Odstraň barvu z názvu, pokud už tam je (ať se název nezdvojuje).
      let baseName = it.name ?? "";
      if (colorLabel) {
        baseName = baseName
          .replace(new RegExp(`\\s*[–—-]\\s*${escapeRegExp(colorLabel)}\\s*$`, "i"), "")
          .trim();
      }
      // Cena: použij uloženou; když je 0 (staré testovací objednávky), dopočítej z produktu.
      let unitGross = Number(it.unit_gross ?? it.unitGross ?? 0);
      if (!unitGross) {
        const prod = productByName.get(normName(baseName));
        if (prod) unitGross = getEffectiveUnitPricing(prod, null, isB2B, 0).unitGross;
      }
      return {
        name: baseName,
        qty: Number(it.qty) || 0,
        unitGross,
        color: it.color ?? undefined,
        colorLabel: colorLabel || undefined,
      };
    });
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
        ) : loadError ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-muted-foreground">Načtení se nepodařilo.</p>
            <button
              onClick={load}
              className="inline-flex items-center px-3 py-1.5 rounded-md border border-border text-xs font-semibold hover:bg-muted transition-colors"
            >
              Zkusit znovu
            </button>
          </div>
        ) : paged.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {orders.length === 0 ? "Zatím žádné objednávky." : "Žádné objednávky neodpovídají filtru."}
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

              {(() => {
                const raw =
                  (selected.items as unknown as Array<{ image_url?: string | null }>) ?? [];
                const itemImgs = raw
                  .map((it) => it.image_url)
                  .filter((u): u is string => !!u);
                const imgs = [selected.attachment_url, ...itemImgs].filter(
                  (u): u is string => !!u,
                );
                if (imgs.length === 0) return null;
                return (
                  <div className="mt-4 text-sm">
                    <h3 className="font-semibold mb-2 text-foreground">Přílohy (obrázky)</h3>
                    <div className="flex flex-wrap gap-3">
                      {imgs.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={url}
                            alt={`Příloha ${i + 1}`}
                            className="w-24 h-24 rounded-lg object-cover border border-border hover:opacity-90 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {selected.is_b2b ? (
                <div className="mt-6 border-t border-border pt-4 text-sm">
                  <h3 className="font-semibold mb-1 text-foreground">Platba (B2B)</h3>
                  <p className="text-muted-foreground">
                    Faktura se splatností — daňový doklad se vystavuje v systému Premier.
                    QR platba se u B2B objednávek nepoužívá.
                  </p>
                </div>
              ) : (
                <PaymentQrPanel
                  orderId={selected.id}
                  orderNumber={selected.order_number}
                  totalGross={selected.total_gross}
                  customerEmail={selected.email}
                />
              )}

              <div className="mt-6 border-t border-border pt-4">
                <h3 className="font-semibold mb-2 text-foreground text-sm">Změnit stav</h3>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FLOW.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected, s)}
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

              <div className="mt-6 border-t border-border pt-4">
                <button
                  onClick={() => deleteOrder(selected.id)}
                  disabled={updatingId === selected.id}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-destructive border border-destructive/40 hover:bg-destructive/10 transition-colors disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" /> Smazat objednávku
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AdminOrders;
