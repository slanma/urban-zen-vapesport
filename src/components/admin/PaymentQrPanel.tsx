import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Mail, Loader2 } from "lucide-react";

type BankAccount = {
  id: string;
  bank_name: string;
  iban: string;
};

type Props = {
  orderId: string;
  orderNumber: string;
  totalGross: number; // in CZK (integer)
  customerEmail: string;
};

/** Build a SPAYD (Short Payment Descriptor) string per CNB spec. */
export const buildSpayd = (opts: { iban: string; amount: number; orderNumber: string }) => {
  const iban = opts.iban.replace(/\s+/g, "").toUpperCase();
  const amount = opts.amount.toFixed(2);
  const vs = opts.orderNumber.replace(/\D/g, "").slice(0, 10) || opts.orderNumber;
  const msg = `Objednavka ${opts.orderNumber}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 \-_.]/g, "");
  return `SPD*1.0*ACC:${iban}*AM:${amount}*CC:CZK*X-VS:${vs}*MSG:${msg}`;
};

const PaymentQrPanel = ({ orderId, orderNumber, totalGross, customerEmail }: Props) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");
  const [sending, setSending] = useState(false);
  const qrWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await (supabase as any)
        .from("bank_accounts")
        .select("id, bank_name, iban")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) toast.error("Nelze načíst bankovní účty");
      const rows = (data ?? []) as BankAccount[];
      setAccounts(rows);
      if (rows.length > 0) setSelectedId(rows[0].id);
      setLoading(false);
    })();
  }, []);

  const selected = useMemo(
    () => accounts.find((a) => a.id === selectedId) ?? null,
    [accounts, selectedId],
  );

  const spayd = useMemo(() => {
    if (!selected) return "";
    return buildSpayd({ iban: selected.iban, amount: totalGross, orderNumber });
  }, [selected, totalGross, orderNumber]);

  const handleDownload = () => {
    const canvas = qrWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR-platba-${orderNumber}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSendEmail = () => {
    if (!selected) return;
    setSending(true);
    try {
      const subject = `Výzva k platbě – objednávka ${orderNumber}`;
      const body = [
        `Dobrý den,`,
        ``,
        `zasíláme podklady k platbě objednávky ${orderNumber}.`,
        ``,
        `Banka: ${selected.bank_name}`,
        `IBAN: ${selected.iban}`,
        `Částka: ${totalGross.toLocaleString("cs-CZ")} CZK`,
        `Variabilní symbol: ${orderNumber.replace(/\D/g, "") || orderNumber}`,
        ``,
        `QR platba (SPAYD):`,
        spayd,
        ``,
        `Děkujeme.`,
      ].join("\n");
      const href = `mailto:${encodeURIComponent(customerEmail)}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
      toast.success("Otevírám e-mailového klienta…");
    } catch {
      toast.error("Odeslání selhalo");
    } finally {
      setTimeout(() => setSending(false), 600);
    }
  };

  return (
    <div className="mt-6 border-t border-border pt-4">
      <h3 className="font-semibold mb-2 text-foreground text-sm">Podklady k platbě</h3>

      {loading ? (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Načítám bankovní účty…
        </div>
      ) : accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Žádné bankovní účty. Přidejte je v Nastavení → Bankovní účty.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Bankovní účet
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.bank_name} — {a.iban}
                </option>
              ))}
            </select>

            {selected && (
              <div className="mt-3 text-xs text-muted-foreground space-y-0.5 font-mono">
                <div>IBAN: <span className="text-foreground">{selected.iban}</span></div>
                <div>Částka: <span className="text-foreground">{totalGross.toLocaleString("cs-CZ")} CZK</span></div>
                <div>VS: <span className="text-foreground">{orderNumber.replace(/\D/g, "") || orderNumber}</span></div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={handleDownload} disabled={!spayd}>
                <Download className="w-4 h-4 mr-2" /> Stáhnout QR kód
              </Button>
              <Button size="sm" onClick={handleSendEmail} disabled={!spayd || sending}>
                <Mail className="w-4 h-4 mr-2" /> Odeslat výzvu k platbě
              </Button>
            </div>
          </div>

          <div
            ref={qrWrapperRef}
            className="bg-white p-3 rounded-md border border-border self-start"
          >
            {spayd ? (
              <QRCodeCanvas value={spayd} size={180} level="M" includeMargin={false} />
            ) : (
              <div className="w-[180px] h-[180px] flex items-center justify-center text-xs text-muted-foreground">
                —
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentQrPanel;
