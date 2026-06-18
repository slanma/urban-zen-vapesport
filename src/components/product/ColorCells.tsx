import { resolveColor } from "@/lib/colorPalette";

interface Props {
  /** Stored color tokens (slugs) from `colors_override`. */
  colors: string[];
  /** Stock keyed by slug or label; only 0 marks the item out of stock. */
  stock: Record<string, number> | null;
  selected: string | null;
  onSelect: (color: string) => void;
}

const isOut = (stock: Record<string, number> | null, slug: string, label: string) =>
  !!stock &&
  (stock[slug] === 0 ||
    stock[slug.toLowerCase()] === 0 ||
    stock[label] === 0 ||
    stock[label.toLowerCase()] === 0);

const ColorCells = ({ colors, stock, selected, onSelect }: Props) => {
  if (!colors || colors.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((token) => {
        const { slug, label, hex } = resolveColor(token);
        const out = isOut(stock, slug, label);
        const active = selected === token;
        return (
          <button
            key={token}
            type="button"
            onClick={() => !out && onSelect(token)}
            disabled={out}
            aria-pressed={active}
            aria-disabled={out}
            title={out ? `${label} – vyprodáno` : label}
            className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-body transition-colors ${
              out
                ? "border-border bg-muted text-muted-foreground line-through opacity-40 cursor-not-allowed"
                : active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:border-primary"
            }`}
          >
            <span
              aria-hidden="true"
              className="inline-block w-4 h-4 rounded-full border border-border"
              style={{ backgroundColor: hex }}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default ColorCells;
