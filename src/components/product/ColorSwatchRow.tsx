import { resolveColor } from "@/lib/colorPalette";

interface Props {
  colors: readonly string[] | null | undefined;
  className?: string;
}

/** Compact, non-interactive row of color swatches for product cards. */
const ColorSwatchRow = ({ colors, className = "" }: Props) => {
  if (!colors || colors.length === 0) return null;
  const visible = colors.slice(0, 6);
  const overflow = colors.length - visible.length;
  return (
    <div className={`flex items-center gap-1.5 ${className}`} aria-label="Dostupné barvy">
      {visible.map((token) => {
        const { label, hex } = resolveColor(token);
        return (
          <span
            key={token}
            title={label}
            aria-label={label}
            className="inline-block w-3.5 h-3.5 rounded-full border border-border"
            style={{ backgroundColor: hex }}
          />
        );
      })}
      {overflow > 0 && (
        <span className="text-[10px] font-body text-muted-foreground ml-0.5">
          +{overflow}
        </span>
      )}
    </div>
  );
};

export default ColorSwatchRow;
