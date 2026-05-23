import { Lock } from "lucide-react";
import { useB2BPartner } from "@/hooks/useB2BPartner";
import { fmtCZK, netFromGross, grossFromNet } from "@/lib/vat";

interface PriceTagProps {
  /** Retail price WITH VAT (MOC s DPH). */
  retailGross: number;
  /**
   * B2B wholesale price WITHOUT VAT (VOC bez DPH) — matches what admin
   * enters in the editor. Pass `null` when the product has no B2B price.
   */
  b2bNet?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { primary: "text-base", secondary: "text-xs" },
  md: { primary: "text-xl", secondary: "text-xs" },
  lg: { primary: "text-3xl md:text-4xl", secondary: "text-sm" },
};

/**
 * Dual price display reacting to the user's role.
 *
 *  - Guest / B2C  → primary = retail WITH VAT, secondary = without VAT.
 *  - B2B partner  → primary = VOC WITHOUT VAT, secondary = WITH VAT.
 *
 * Falls back to the retail-only display when no `b2bNet` is provided,
 * regardless of role, so partner pricing is never invented.
 */
const PriceTag = ({ retailGross, b2bNet, size = "md", className = "" }: PriceTagProps) => {
  const { isPartner } = useB2BPartner();
  const s = sizeMap[size];

  if (isPartner && b2bNet != null && b2bNet > 0) {
    const gross = grossFromNet(b2bNet);
    return (
      <div className={`flex flex-col leading-tight ${className}`}>
        <span className={`font-heading font-bold text-primary inline-flex items-center gap-1.5 ${s.primary}`}>
          <Lock className="w-4 h-4" />
          Vaše VOC: {fmtCZK(b2bNet)}
        </span>
        <span className={`font-body text-muted-foreground ${s.secondary}`}>
          s DPH: {fmtCZK(gross)}
        </span>
      </div>
    );
  }

  const net = netFromGross(retailGross);
  return (
    <div className={`flex flex-col leading-tight ${className}`}>
      <span className={`font-heading font-bold text-foreground ${s.primary}`}>
        Cena: {fmtCZK(retailGross)}
      </span>
      <span className={`font-body text-muted-foreground ${s.secondary}`}>
        bez DPH: {fmtCZK(net)}
      </span>
    </div>
  );
};

export default PriceTag;
// re-export for callers that need raw conversion
export { netFromGross, grossFromNet };
