import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type Order = {
  id: string;
  date: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  amount: string;
  status: "Nová" | "Zpracovává se" | "Odesláno";
  items: { name: string; qty: number; price: string }[];
  payment: string;
  shipping: string;
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
    amount: "12 450 Kč",
    status: "Nová",
    payment: "Bankovní převod",
    shipping: "PPL - na adresu",
    items: [
      { name: "MORSEO Transformer 5,5\" - Neon zelená", qty: 10, price: "5 310 Kč" },
      { name: "MORSEO Transformer 5,5\" - Černá", qty: 15, price: "7 140 Kč" },
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
    amount: "2 890 Kč",
    status: "Zpracovává se",
    payment: "Platební karta",
    shipping: "Zásilkovna",
    items: [{ name: "MORSEO Transformer 5,5\" - Stříbrná", qty: 1, price: "531 Kč" }],
  },
  {
    id: "OBJ-2026-003",
    date: "2026-03-08",
    customer: "BikeWorld a.s.",
    email: "nakup@bikeworld.cz",
    phone: "+420 602 555 111",
    address: "Průmyslová 1234, 102 00 Praha 10",
    amount: "34 200 Kč",
    status: "Odesláno",
    payment: "Faktura 14 dní",
    shipping: "Vlastní doprava",
    items: [{ name: "MORSEO Transformer 5,5\" - mix variant", qty: 80, price: "23 440 Kč" }],
  },
  {
    id: "OBJ-2026-004",
    date: "2026-03-08",
    customer: "Eva Krátká",
    email: "eva.kratka@gmail.com",
    phone: "+420 720 444 222",
    address: "Lidická 88, 602 00 Brno",
    amount: "1 490 Kč",
    status: "Nová",
    payment: "Dobírka",
    shipping: "Česká pošta",
    items: [{ name: "MORSEO Transformer 5,5\" - Černá", qty: 1, price: "531 Kč" }],
  },
  {
    id: "OBJ-2026-005",
    date: "2026-03-07",
    customer: "GravelShop s.r.o.",
    email: "info@gravelshop.cz",
    phone: "+420 733 666 999",
    address: "Sokolská 22, 301 00 Plzeň",
    amount: "8 760 Kč",
    status: "Zpracovává se",
    payment: "Bankovní převod",
    shipping: "PPL - na adresu",
    items: [{ name: "MORSEO Transformer 5,5\" - Neon zelená", qty: 20, price: "5 860 Kč" }],
  },
];

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
              <th className="px-4 py-3 font-semibold text-right">Částka</th>
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

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
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
                  <p><span className="text-muted-foreground">Doprava:</span> {selected.shipping}</p>
                  <p><span className="text-muted-foreground">Platba:</span> {selected.payment}</p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-foreground text-sm">Položky</h3>
                <div className="border border-border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-left">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Produkt</th>
                        <th className="px-3 py-2 font-semibold text-center">Ks</th>
                        <th className="px-3 py-2 font-semibold text-right">Cena</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.items.map((it, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="px-3 py-2">{it.name}</td>
                          <td className="px-3 py-2 text-center">{it.qty}</td>
                          <td className="px-3 py-2 text-right font-medium">{it.price}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-border bg-muted/30">
                        <td className="px-3 py-2 font-semibold" colSpan={2}>Celkem</td>
                        <td className="px-3 py-2 text-right font-bold">{selected.amount}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
