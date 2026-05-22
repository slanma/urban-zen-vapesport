import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import OrderSummaryTable from "@/components/OrderSummaryTable";
import { fmtCZK } from "@/lib/vat";

type Order = {
  id: string;
  date: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  status: "Nová" | "Zpracovává se" | "Odesláno";
  /** Unit prices are WITH VAT (gross), in CZK. */
  items: { name: string; qty: number; unitGross: number }[];
  payment: string;
  paymentGross: number;
  shipping: string;
  shippingGross: number;
  note?: string;
};

const orders: Order[] = [
  {
    id: "OBJ-2026-001",
    date: "2026-03-10",
    customer: "CykloPro s.r.o.",
    email: "objednavky@cyklopro.cz",
    phone: "+420 777 123 456",
    address: "Vinohradská 12, 120 00 Praha 2",
    status: "Nová",
    payment: "Bankovní převod",
    paymentGross: 0,
    shipping: "PPL – Doručení na adresu",
    shippingGross: 200,
    items: [
      { name: "MORSEO Transformer 5,5\" – Neon zelená", qty: 10, unitGross: 531 },
      { name: "MORSEO Transformer 5,5\" – Černá", qty: 15, unitGross: 476 },
    ],
    note: "Prosíme o doručení do 5 pracovních dnů.",
  },
  {
    id: "OBJ-2026-002",
    date: "2026-03-09",
    customer: "Jan Malý",
    email: "jan.maly@email.cz",
    phone: "+420 605 987 321",
    address: "Náměstí Míru 5, 250 01 Brandýs nad Labem",
    status: "Zpracovává se",
    payment: "Dobírka",
    paymentGross: 50,
    shipping: "Zásilkovna – výdejní místa",
    shippingGross: 150,
    items: [{ name: "MORSEO Transformer 5,5\" – Stříbrná", qty: 1, unitGross: 531 }],
  },
  {
    id: "OBJ-2026-003",
    date: "2026-03-08",
    customer: "BikeWorld a.s.",
    email: "nakup@bikeworld.cz",
    phone: "+420 602 555 111",
    address: "Průmyslová 1234, 102 00 Praha 10",
    status: "Odesláno",
    payment: "Platba na fakturu",
    paymentGross: 0,
    shipping: "PPL – Doručení na adresu",
    shippingGross: 200,
    items: [{ name: "MORSEO Transformer 5,5\" – mix variant", qty: 80, unitGross: 293 }],
  },
  {
    id: "OBJ-2026-004",
    date: "2026-03-08",
    customer: "Eva Krátká",
    email: "eva.kratka@gmail.com",
    phone: "+420 720 444 222",
    address: "Lidická 88, 602 00 Brno",
    status: "Nová",
    payment: "Dobírka",
    paymentGross: 50,
    shipping: "Zásilkovna – výdejní místa",
    shippingGross: 150,
    items: [{ name: "MORSEO Transformer 5,5\" – Černá", qty: 1, unitGross: 531 }],
  },
  {
    id: "OBJ-2026-005",
    date: "2026-03-07",
    customer: "GravelShop s.r.o.",
    email: "info@gravelshop.cz",
    phone: "+420 733 666 999",
    address: "Sokolská 22, 301 00 Plzeň",
    status: "Zpracovává se",
    payment: "Bankovní převod",
    paymentGross: 0,
    shipping: "PPL – Doručení na adresu",
    shippingGross: 200,
    items: [{ name: "MORSEO Transformer 5,5\" – Neon zelená", qty: 20, unitGross: 293 }],
  },
];

const grandTotal = (o: Order) =>
  o.items.reduce((s, it) => s + it.unitGross * it.qty, 0) + o.shippingGross + o.paymentGross;

const statusColor: Record<string, string> = {
  "Nová": "bg-primary/15 text-primary",
  "Zpracovává se": "bg-amber-100 text-amber-800",
  "Odesláno": "bg-emerald-100 text-emerald-800",
};

const AdminOrders = () => {
  const [selected, setSelected] = useState<Order | null>(null);

  return (
    <section className="p-8 max-w-[1200px]">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Objednávky</h1>
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Datum</th>
              <th className="px-4 py-3 font-semibold">Zákazník</th>
              <th className="px-4 py-3 font-semibold text-right">Částka (s DPH)</th>
              <th className="px-4 py-3 font-semibold">Stav</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                onClick={() => setSelected(o)}
                className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.id}</td>
                <td className="px-4 py-3">{o.date}</td>
                <td className="px-4 py-3 font-medium">{o.customer}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">{fmtCZK(grandTotal(o))}</td>
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

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="font-mono text-sm text-muted-foreground">{selected.id}</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColor[selected.status]}`}>
                    {selected.status}
                  </span>
                </DialogTitle>
                <DialogDescription>Detail objednávky ze dne {selected.date}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6 text-sm mt-2">
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Zákazník</h3>
                  <p className="font-medium">{selected.customer}</p>
                  <p className="text-muted-foreground">{selected.email}</p>
                  <p className="text-muted-foreground">{selected.phone}</p>
                  <p className="text-muted-foreground mt-2">{selected.address}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Doprava a platba</h3>
                  <p><span className="text-muted-foreground">Doprava:</span> {selected.shipping} ({fmtCZK(selected.shippingGross)})</p>
                  <p><span className="text-muted-foreground">Platba:</span> {selected.payment}{selected.paymentGross > 0 ? ` (+${fmtCZK(selected.paymentGross)})` : ""}</p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-foreground text-sm">Fakturační rozpis</h3>
                <OrderSummaryTable
                  items={selected.items}
                  shippingGross={selected.shippingGross}
                  paymentGross={selected.paymentGross}
                  shippingLabel={selected.shipping}
                  paymentLabel={selected.payment}
                />
              </div>

              {selected.note && (
                <div className="mt-4 text-sm">
                  <h3 className="font-semibold mb-1 text-foreground">Poznámka</h3>
                  <p className="text-muted-foreground">{selected.note}</p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AdminOrders;
