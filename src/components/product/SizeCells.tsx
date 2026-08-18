interface Props {
  /** Velikostní řada produktu, např. ["M", "L", "XL"]. */
  sizes: readonly string[];
  /** Zásoba podle velikosti; jen 0 znamená vyprodáno. */
  stock: Record<string, number> | null;
  selected: string | null;
  onSelect: (size: string) => void;
}

const isOut = (stock: Record<string, number> | null, size: string) =>
  !!stock && (stock[size] === 0 || stock[size.toLowerCase()] === 0);

/**
 * Výběr velikosti na detailu produktu — vizuálně shodný s ColorCells
 * (barvy u brašen), jen bez barevného kolečka. Zásoba se čte ze stejného
 * pole `color_stock`, protože varianta má v celé aplikaci jediný klíč.
 */
const SizeCells = ({ sizes, stock, selected, onSelect }: Props) => {
  if (!sizes || sizes.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => {
        const out = isOut(stock, size);
        const active = selected === size;
        return (
          <button
            key={size}
            type="button"
            onClick={() => !out && onSelect(size)}
            disabled={out}
            aria-pressed={active}
            aria-disabled={out}
            title={out ? `Velikost ${size} – vyprodáno` : `Velikost ${size}`}
            className={`relative inline-flex items-center justify-center min-w-[3.25rem] px-4 py-2 rounded-full border text-sm font-body font-semibold transition-colors ${
              out
                ? "border-border bg-muted text-muted-foreground line-through opacity-40 cursor-not-allowed"
                : active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary"
            }`}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
};

export default SizeCells;
