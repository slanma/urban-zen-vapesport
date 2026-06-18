import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tag, X, Loader2 } from "lucide-react";
import { usePromoCode } from "@/hooks/usePromoCode";

interface Props {
  className?: string;
  compact?: boolean;
}

/**
 * Reusable promo-code input + chip. State is shared across Cart / Checkout /
 * B2B Checkout via `usePromoCode` (localStorage-backed).
 */
const PromoCodeBox = ({ className, compact = false }: Props) => {
  const { appliedPromo, applying, applyPromo, removePromo } = usePromoCode();
  const [value, setValue] = useState("");

  if (appliedPromo) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30 text-sm font-body">
          <span className="inline-flex items-center gap-2 text-primary font-semibold">
            <Tag className="w-4 h-4" />
            Kód „{appliedPromo.code}" aktivní
            <span className="text-muted-foreground font-normal">
              ({appliedPromo.type === "percentage"
                ? `–${appliedPromo.value} %`
                : `–${appliedPromo.value} Kč`})
            </span>
          </span>
          <button
            type="button"
            onClick={removePromo}
            className="text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Odstranit slevový kód"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-body font-semibold text-foreground mb-1.5">
        Slevový kód
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Zadejte kód"
          className={`flex-1 ${compact ? "h-11" : "h-12"} px-3 text-base font-body bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary uppercase`}
          autoComplete="off"
        />
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            const ok = await applyPromo(value);
            if (ok) setValue("");
          }}
          disabled={applying || !value.trim()}
          className={compact ? "h-11" : "h-12"}
        >
          {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Uplatnit"}
        </Button>
      </div>
    </div>
  );
};

export default PromoCodeBox;
