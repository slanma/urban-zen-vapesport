import { Lock, Sparkles } from "lucide-react";
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
 *  - Guest / B2C  → retail WITH VAT + bez DPH.
 *  - B2B partner  → VOC discounted by `profile.discount_percent`, original
 *    crossed-out + "Vaše věrnostní sleva X %" label. Falls back to discounted
 *    retail when the product has no VOC price.
 */
const PriceTag = ({ retailGross, b2bNet, size = "md", className = "" }: PriceTagProps) => {
  const { isPartner, profile } = useB2BPartner();
  const s = sizeMap[size];
  const discount = isPartner ? Math.max(0, Math.min(100, profile?.discount_percent ?? 0)) : 0;
  const factor = 1 - discount / 100;

  // --- B2B with explicit wholesale price ---
  if (isPartner && b2bNet != null && b2bNet > 0) {
    const discountedNet = Math.round(b2bNet * factor);
    const discountedGross = grossFromNet(discountedNet);
    return (
      <div className={`flex flex-col leading-tight ${className}`}>
        <span className={`font-heading font-bold text-primary inline-flex items-center gap-1.5 flex-wrap ${s.primary}`}>
          <Lock className="w-4 h-4" />
          Vaše VOC: {fmtCZK(discountedNet)}
          {discount > 0 && (
            <span className="font-body text-muted-foreground text-sm line-through font-normal">
              {fmtCZK(b2bNet)}
            </span>
          )}
        </span>
        <span className={`font-body text-muted-foreground ${s.secondary}`}>
          s DPH: {fmtCZK(discountedGross)}
        </span>
        {discount > 0 && (
          <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-primary">
            <Sparkles className="w-3 h-3" />
            Vaše věrnostní sleva {discount} %
          </span>
        )}
      </div>
    );
  }

  // --- B2B fallback (no VOC price): discount applied to retail gross ---
  if (isPartner && discount > 0) {
    const discountedGross = Math.round(retailGross * factor);
    return (
      <div className={`flex flex-col leading-tight ${className}`}>
        <span className={`font-heading font-bold text-primary inline-flex items-center gap-1.5 flex-wrap ${s.primary}`}>
          <Lock className="w-4 h-4" />
          {fmtCZK(discountedGross)}
          <span className="font-body text-muted-foreground text-sm line-through font-normal">
            {fmtCZK(retailGross)}
          </span>
        </span>
        <span className={`font-body text-muted-foreground ${s.secondary}`}>
          bez DPH: {fmtCZK(netFromGross(discountedGross))}
        </span>
        <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-primary">
          <Sparkles className="w-3 h-3" />
          Vaše věrnostní sleva {discount} %
        </span>
      </div>
    );
  }

  // --- Retail / guest ---
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
