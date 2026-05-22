const orders = [
  { id: "OBJ-2026-001", date: "2026-03-10", customer: "CykloPro s.r.o.", amount: "12 450 Kč", status: "Nová" },
  { id: "OBJ-2026-002", date: "2026-03-09", customer: "Jan Malý", amount: "2 890 Kč", status: "Zpracovává se" },
  { id: "OBJ-2026-003", date: "2026-03-08", customer: "BikeWorld a.s.", amount: "34 200 Kč", status: "Odesláno" },
  { id: "OBJ-2026-004", date: "2026-03-08", customer: "Eva Krátká", amount: "1 490 Kč", status: "Nová" },
  { id: "OBJ-2026-005", date: "2026-03-07", customer: "GravelShop s.r.o.", amount: "8 760 Kč", status: "Zpracovává se" },
];

const statusColor: Record<string, string> = {
  "Nová": "bg-primary/15 text-primary",
  "Zpracovává se": "bg-amber-100 text-amber-800",
  "Odesláno": "bg-emerald-100 text-emerald-800",
};

const AdminOrders = () => (
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
            <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30">
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
  </section>
);

export default AdminOrders;
