import { Sparkles } from "lucide-react";
import { fmtCZK } from "@/lib/vat";
import type { DiscountHint } from "@/lib/discounts";

/** „Do slevy 10 % chybí 1 200 Kč bez DPH.“ */
const DiscountHintNote = ({ hint, className }: { hint: DiscountHint | null; className?: string }) => {
  if (!hint) return null;
  return (
    <p className={`flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm font-body text-foreground ${className ?? ""}`}>
      <Sparkles className="w-4 h-4 mt-0.5 text-primary shrink-0" aria-hidden />
      <span>
        Do slevy {hint.rule.percent} % vám chybí <strong>{fmtCZK(hint.missingNet)}</strong> bez DPH.
      </span>
    </p>
  );
};

export default DiscountHintNote;
