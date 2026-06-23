import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { matchFeatureBadges } from "@/lib/productFeatures";

/**
 * Row of coin-style icon chips for matched product technologies.
 * Click/tap opens a popover with the feature name + plain-Czech explanation.
 */
const FeatureBadges = ({
  features,
  className = "",
  size = "md",
}: {
  features: ReadonlyArray<string> | undefined;
  className?: string;
  size?: "sm" | "md" | "lg";
}) => {
  const matched = matchFeatureBadges(features ?? []);
  if (matched.length === 0) return null;
  const box =
    size === "sm" ? "w-9 h-9" : size === "lg" ? "w-14 h-14" : "w-11 h-11";
  return (
    <ul
      className={`flex flex-wrap items-center gap-2 ${className}`}
      aria-label="Vlastnosti produktu"
    >
      {matched.map(({ label, image, tooltip }) => (
        <li key={label}>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={label}
                onClick={(e) => {
                  // Inside a product <Link>: don't navigate when tapping a badge.
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`${box} rounded-full overflow-hidden border border-border bg-muted hover:border-primary hover:ring-2 hover:ring-primary/30 transition`}
              >
                <img src={image} alt={label} className="w-full h-full object-cover" />
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-64 text-sm">
              <p className="font-heading font-bold text-foreground mb-1">{label}</p>
              <p className="text-muted-foreground leading-snug">{tooltip}</p>
            </PopoverContent>
          </Popover>
        </li>
      ))}
    </ul>
  );
};

export default FeatureBadges;
