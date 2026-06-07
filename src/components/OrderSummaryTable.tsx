import { fmtCZK, netFromGross, vatOfGross, VAT_RATE } from "@/lib/vat";

export interface OrderLine {
  /** Display label, e.g. "MORSEO Transformer 5,5\" – Neon zelená". */
  name: string;
  qty: number;
  /** Unit price WITH VAT (gross), in CZK. */
  unitGross: number;
}

interface OrderSummaryTableProps {
  items: OrderLine[];
  /** Shipping price WITH VAT (gross). */
  shippingGross: number;
  /** Payment surcharge WITH VAT (gross). */
  paymentGross: number;
  shippingLabel?: string;
  paymentLabel?: string;
  /** Optional promo-code discount applied on the gross total. */
  discountGross?: number;
  /** Label for the discount row, e.g. "Sleva (Kód: VAPE10)". */
  discountLabel?: string;
}

const OrderSummaryTable = ({
  items,
  shippingGross,
  paymentGross,
  shippingLabel = "Doprava",
  paymentLabel = "Platba",
  discountGross = 0,
  discountLabel = "Sleva",
}: OrderSummaryTableProps) => {
  const subtotalGross = items.reduce((s, it) => s + it.unitGross * it.qty, 0);
  const subtotalNet = netFromGross(subtotalGross);

  const feesGross = shippingGross + paymentGross;
  const feesNet = netFromGross(feesGross);

  const safeDiscountGross = Math.max(0, Math.min(discountGross, subtotalGross + feesGross));
  const discountNet = netFromGross(safeDiscountGross);

  const grandGross = Math.max(0, subtotalGross + feesGross - safeDiscountGross);
  const vatTotal = vatOfGross(subtotalGross) + vatOfGross(feesGross) - vatOfGross(safeDiscountGross);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left">
          <tr>
            <th className="px-3 py-2.5 font-semibold text-foreground">Produkt</th>
            <th className="px-3 py-2.5 font-semibold text-foreground text-center w-16">Ks</th>
            <th className="px-3 py-2.5 font-semibold text-foreground text-right">
              Cena za ks
              <div className="text-[10px] font-normal text-muted-foreground">bez DPH</div>
            </th>
            <th className="px-3 py-2.5 font-semibold text-foreground text-right">
              DPH
              <div className="text-[10px] font-normal text-muted-foreground">{Math.round(VAT_RATE * 100)}%</div>
            </th>
            <th className="px-3 py-2.5 font-semibold text-foreground text-right">
              Celkem
              <div className="text-[10px] font-normal text-muted-foreground">bez DPH</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => {
            const unitNet = netFromGross(it.unitGross);
            const lineVat = vatOfGross(it.unitGross) * it.qty;
            const lineNet = unitNet * it.qty;
            return (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-2.5 text-foreground">{it.name}</td>
                <td className="px-3 py-2.5 text-center">{it.qty}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{fmtCZK(unitNet)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                  {fmtCZK(lineVat)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums font-medium">
                  {fmtCZK(lineNet)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-muted/20">
          <tr className="border-t border-border">
            <td className="px-3 py-2 text-foreground font-medium" colSpan={4}>
              Mezisoučet bez DPH
            </td>
            <td className="px-3 py-2 text-right tabular-nums font-medium">
              {fmtCZK(subtotalNet)}
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 text-muted-foreground" colSpan={4}>
              {shippingLabel} + {paymentLabel} (bez DPH)
            </td>
            <td className="px-3 py-2 text-right tabular-nums">{fmtCZK(feesNet)}</td>
          </tr>
          {safeDiscountGross > 0 && (
            <tr className="text-primary">
              <td className="px-3 py-2 font-medium" colSpan={4}>
                {discountLabel} (bez DPH)
              </td>
              <td className="px-3 py-2 text-right tabular-nums font-medium">
                −{fmtCZK(discountNet)}
              </td>
            </tr>
          )}
          <tr>
            <td className="px-3 py-2 text-muted-foreground" colSpan={4}>
              Hodnota DPH {Math.round(VAT_RATE * 100)} %
            </td>
            <td className="px-3 py-2 text-right tabular-nums">{fmtCZK(vatTotal)}</td>
          </tr>
          <tr className="border-t-2 border-foreground/20 bg-primary/5">
            <td className="px-3 py-3 font-heading font-bold text-foreground text-base" colSpan={4}>
              CELKEM K ÚHRADĚ
            </td>
            <td className="px-3 py-3 text-right tabular-nums font-heading font-bold text-foreground text-lg">
              {fmtCZK(grandGross)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default OrderSummaryTable;
