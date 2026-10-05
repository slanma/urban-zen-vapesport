import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tag, X, Loader2 } from "lucide-react";
import { useDiscounts } from "@/hooks/usePromoCode";
import { CODE_NOTE_TEXT, type CodeNote } from "@/lib/discounts";

interface Props {
  className?: string;
  compact?: boolean;
  /** Proč se zadaný kód v tomto košíku neuplatnil (z `evaluate`). */
  codeNote?: CodeNote;
}

/**
 * Pole pro slevový kód + štítek zadaného kódu. Stav je sdílený přes
 * `useDiscounts` (Košík, Pokladna, B2B pokladna).
 */
const PromoCodeBox = ({ className, compact = false, codeNote = null }: Props) => {
  const { code, loading, applyCode, removeCode } = useDiscounts();
  const [value, setValue] = useState("");

  if (code) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30 text-sm font-body">
          <span className="inline-flex items-center gap-2 text-primary font-semibold">
            <Tag className="w-4 h-4" />
            Kód „{code}“ zadaný
          </span>
          <button
            type="button"
            onClick={removeCode}
            className="text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Odstranit slevový kód"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {codeNote && (
          <p className="mt-2 text-xs text-muted-foreground font-body">{CODE_NOTE_TEXT[codeNote]}</p>
        )}
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
          onKeyDown={async (e) => {
            if (e.key === "Enter" && value.trim()) {
              e.preventDefault();
              if (await applyCode(value)) setValue("");
            }
          }}
          placeholder="Zadejte kód"
          className={`flex-1 ${compact ? "h-11" : "h-12"} px-3 text-base font-body bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary uppercase`}
          autoComplete="off"
        />
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            if (await applyCode(value)) setValue("");
          }}
          disabled={loading || !value.trim()}
          className={compact ? "h-11" : "h-12"}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Uplatnit"}
        </Button>
      </div>
    </div>
  );
};

export default PromoCodeBox;
