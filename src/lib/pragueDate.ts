/** Převody kalendářního data (YYYY-MM-DD) na čas v Praze a zpět.
 *  Akce platí od 00:00:00 prvního dne do 23:59:59 posledního dne českého
 *  času, včetně přechodu letní/zimní čas. */

const TZ = "Europe/Prague";

const pragueOffsetMs = (utcMs: number): number => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(utcMs / 1000) * 1000;
};

/** „2026-10-07“ → ISO čas začátku (nebo konce) dne v Praze. */
export const pragueDayToIso = (day: string, endOfDay = false): string => {
  const [y, m, d] = day.split("-").map(Number);
  const wall = endOfDay ? Date.UTC(y, m - 1, d, 23, 59, 59) : Date.UTC(y, m - 1, d, 0, 0, 0);
  // Dvojí výpočet kvůli dnům, kdy se mění letní/zimní čas.
  let utc = wall - pragueOffsetMs(wall);
  utc = wall - pragueOffsetMs(utc);
  return new Date(utc).toISOString();
};

/** ISO čas → „2026-10-07“ podle kalendáře v Praze (pro <input type="date">). */
export const isoToPragueDay = (iso: string): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

/** ISO čas → „7. 10. 2026“. */
export const formatPragueDay = (iso: string): string =>
  new Intl.DateTimeFormat("cs-CZ", { timeZone: TZ, day: "numeric", month: "numeric", year: "numeric" }).format(new Date(iso));
