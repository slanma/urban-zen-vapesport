import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { matchFeatureBadges } from "@/lib/productFeatures";

/**
 * Renders a row of small icon chips for every matched product feature.
 * Hovering / focusing an icon reveals a tooltip explaining the feature
 * in plain Czech for shoppers (60+ friendly).
 */
const FeatureBadges = ({
  features,
  className = "",
  size = "md",
}: {
  features: ReadonlyArray<string> | undefined;
  className?: string;
  size?: "sm" | "md";
}) => {
  const matched = matchFeatureBadges(features ?? []);
  if (matched.length === 0) return null;
  const box = size === "sm" ? "w-7 h-7" : "w-8 h-8";
  const icon = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <ul
      className={`flex flex-wrap items-center gap-1.5 ${className}`}
      aria-label="Vlastnosti produktu"
    >
      {matched.map(({ label, icon: Icon, tooltip }) => (
        <li key={label}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={label}
                onClick={(e) => {
                  // Inside a product <Link>: don't navigate when tapping a badge.
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`${box} flex items-center justify-center rounded-full border border-border bg-muted/60 text-foreground/80 hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors`}
              >
                <Icon className={icon} aria-hidden />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-xs leading-snug">
              <p className="font-semibold mb-0.5">{label}</p>
              <p className="text-muted-foreground">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </li>
      ))}
    </ul>
  );
};

export default FeatureBadges;
