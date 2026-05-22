export const SERVICE_CATEGORIES = new Set<string>([
  "BALÍČKY SLUŽEB",
  "GOLF",
  "GOLFOVÉ DOPLŇKY",
  "GOLFOVÉ MÍČKY",
  "PING GOLFOVÉ VYBAVENÍ",
]);

export const isServiceCategory = (label: string) =>
  SERVICE_CATEGORIES.has(label.toUpperCase());
