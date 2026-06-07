import { Search, X } from "lucide-react";

export interface ChipFilter<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface Props<T extends string> {
  query: string;
  onQueryChange: (v: string) => void;
  placeholder?: string;
  filters?: ChipFilter<T>[];
  active?: T;
  onFilterChange?: (v: T) => void;
  right?: React.ReactNode;
}

export function DataTableToolbar<T extends string>({
  query,
  onQueryChange,
  placeholder = "Hledat…",
  filters,
  active,
  onFilterChange,
  right,
}: Props<T>) {
  return (
    <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        {query && (
          <button
            onClick={() => onQueryChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            aria-label="Vymazat hledání"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {filters && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange?.(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                active === f.value
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {f.label}
              {typeof f.count === "number" && (
                <span className={`ml-1.5 ${active === f.value ? "opacity-70" : "text-muted-foreground"}`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      {right}
    </div>
  );
}
