interface Props {
  colors: string[];
  stock: Record<string, number> | null;
  selected: string | null;
  onSelect: (color: string) => void;
}

/** A color slug or label is considered out-of-stock only if explicitly set to 0. */
const isOut = (stock: Record<string, number> | null, c: string) =>
  !!stock && (stock[c] === 0 || stock[c.toLowerCase()] === 0);

const ColorCells = ({ colors, stock, selected, onSelect }: Props) => {
  if (!colors || colors.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c) => {
        const out = isOut(stock, c);
        const active = selected === c;
        return (
          <button
            key={c}
            type="button"
            onClick={() => !out && onSelect(c)}
            disabled={out}
            aria-pressed={active}
            aria-disabled={out}
            title={out ? `${c} – vyprodáno` : c}
            className={`relative px-4 py-2 rounded-full border text-sm font-body transition-colors ${
              out
                ? "border-border bg-muted text-muted-foreground line-through opacity-40 cursor-not-allowed"
                : active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:border-primary"
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
};

export default ColorCells;
