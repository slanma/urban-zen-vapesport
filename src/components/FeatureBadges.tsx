import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { matchFeatureBadges, type ProductFeature } from "@/lib/productFeatures";

/**
 * Single coin chip. Uses controlled `open` state so the popover still opens
 * even though we preventDefault/stopPropagation to avoid navigating when the
 * chip lives inside a product <Link> (Radix would otherwise skip its own
 * toggle handler once the click event is defaultPrevented).
 */
const Badge = ({ feature, box }: { feature: ProductFeature; box: string }) => {
  const [open, setOpen] = useState(false);
  const { label, image, tooltip } = feature;
  return (
    <li>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={label}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen((o) => !o);
            }}
            className={`${box} rounded-full overflow-hidden border border-border bg-muted hover:border-primary hover:ring-2 hover:ring-primary/30 transition`}
          >
            <img src={image} alt={label} className="w-full h-full object-cover" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-64 text-sm z-50">
          <p className="font-heading font-bold text-foreground mb-1">{label}</p>
          <p className="text-muted-foreground leading-snug">{tooltip}</p>
        </PopoverContent>
      </Popover>
    </li>
  );
};

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
      {matched.map((feature) => (
        <Badge key={feature.label} feature={feature} box={box} />
      ))}
    </ul>
  );
};

export default FeatureBadges;
