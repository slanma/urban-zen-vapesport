import type { Product } from "@/data/products";
import { ALL_COLOR_NAMES } from "@/data/products";




// Czech synonym / concept map. Key = canonical token; values = aliases user might type.
const SYNONYMS: Record<string, string[]> = {
  brasna: ["brašna", "brasna", "taška", "taska", "kapsa", "pouzdro", "obal", "vak", "bag"],
  ram: ["rám", "ram", "do ramu", "do rámu", "trojúhelník", "trojuhelnik", "rámová", "ramova", "framebag"],
  riditka: ["řídítka", "riditka", "řidítka", "na riditka", "na řídítka", "handlebar", "kokpit"],
  predstavec: ["představec", "predstavec", "na predstavec", "na představec", "stem"],
  sedlo: ["sedlo", "pod sedlo", "podsedlovka", "podsedlová", "podsedlova", "saddle"],
  horni_trubka: ["horní trubka", "horni trubka", "toptube", "top tube", "smb", "na mobil", "telefon", "na telefon", "mobil", "smartphone"],
  navigace: ["navigace", "na navigaci", "gps", "garmin", "mapa"],
  folie: ["dotyková fólie", "dotykova folie", "s fólií", "s folii", "folie", "touch"],
  nabijecka: ["nabíječka", "nabijecka", "na nabíječku", "na nabijecku", "charger", "ebike charger", "e-bike nabíječka"],
  plastenka: ["pláštěnka", "plastenka", "na pláštěnku", "na plastenku", "raincoat"],
  nosic: ["nosič", "nosic", "na nosič", "na nosic", "carrier", "rack"],
  baterie: ["baterie", "battery", "akumulátor", "akumulator", "neopren"],
  elektrokolo: [
    "elektrokolo", "elektrokola", "e-bike", "ebike", "e bike",
    "integrovaná baterie", "integrovana baterie", "středový motor", "stredovy motor",
    "tlustý rám", "tlusty ram", "horské elektrokolo", "horske elektrokolo",
    "cube", "ktm", "specialized", "bosch", "shimano steps", "yamaha",
  ],
  nepromokava: ["nepromokavá", "nepromokava", "voděodolná", "vodeodolna", "waterproof", "do deště", "do deste"],
  gravel: ["gravel", "bikepacking", "dálkové", "dalkove", "endurance"],
  mtb: ["mtb", "horské", "horske", "trail", "enduro", "cross country", "xc"],
  silnicni: ["silniční", "silnicni", "road", "závodní", "zavodni"],
  golf: ["golf", "ping", "míček", "micek", "tee", "green"],
  zdravotni: ["zdravotní", "zdravotni", "medical", "rehabilitace"],
  reflexni: ["reflexní", "reflexni", "viditelnost", "bezpečnost", "bezpecnost"],
};


// Build per-category compatibility tags so users can search by bike type / scenario.
const CATEGORY_COMPAT: Record<string, string[]> = {
  "BRAŠNY PRO ELEKTROKOLO": [
    "elektrokolo", "e-bike", "ebike", "integrovaná baterie", "středový motor",
    "tlustý rám", "horské elektrokolo", "cube", "ktm", "specialized", "bosch",
  ],
  "RÁMOVÉ BRAŠNY": ["rám", "trojúhelník", "framebag", "do rámu", "gravel", "bikepacking"],
  "BRAŠNY POD SEDLO": ["sedlo", "podsedlovka", "saddle", "twist"],
  "BRAŠNY NA NOSIČ": ["nosič", "rack", "zadní nosič"],
  "BRAŠNY NA MOBILNÍ TELEFONY": ["mobil", "telefon", "smartphone", "horní trubka", "smb"],
  "NEOPRENOVÉ OBALY ELEKTROKOLA": ["baterie", "neopren", "ochrana", "elektrokolo"],
  "BATOHY": ["batoh", "backpack", "outdoor", "turistika"],
  "BRAŠNY NA KOLO": ["kolo", "cyklistika", "univerzální"],
  "VAPESPORT BRAŠNY": ["vapesport", "univerzální"],
  "DOPLŇKY K BRAŠNÁM": ["doplněk", "příslušenství"],
  "REFLEXNÍ PÁSKY A KLIPY": ["reflexní", "viditelnost", "bezpečnost", "noc"],
  "ELEKTROKOLA": ["elektrokolo", "e-bike", "kolo"],
  "GOLF": ["golf", "ping"],
  "GOLFOVÉ DOPLŇKY": ["golf", "doplněk"],
  "GOLFOVÉ MÍČKY": ["golf", "míček", "ball"],
  "PING GOLFOVÉ VYBAVENÍ": ["golf", "ping"],
  "BALÍČKY SLUŽEB": ["služba", "balíček", "konzultace"],
  "ZDRAVOTNICKÁ TECHNIKA": ["zdravotní", "medical"],
  "ZDRAVOTNÍ POMŮCKY": ["zdravotní", "rehabilitace"],
  "TRUST CONTROL RUKAVICE": ["rukavice", "trust control"],
  "NÁVLEKY NA BOTY": ["návlek", "boty", "déšť"],
  "NÁVLEKY": ["návlek"],
  "KLOBOUKY": ["klobouk", "pokrývka hlavy"],
  "ROUŠKY": ["rouška", "ochrana"],
  "TAŽNÁ LANA": ["tažné lano", "vlek"],
};

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (s: string) => normalize(s).split(" ").filter((t) => t.length >= 2);

// Expand a query token via the synonym map (bi-directional).
const expandToken = (token: string): string[] => {
  const out = new Set<string>([token]);
  for (const [key, aliases] of Object.entries(SYNONYMS)) {
    const allForms = [key, ...aliases].map(normalize);
    if (allForms.some((f) => f === token || f.includes(token) || token.includes(f))) {
      allForms.forEach((f) => f && out.add(f));
    }
  }
  return Array.from(out);
};

// Compute compatibility tags for a product (derived, not stored).
export const getCompatibilityTags = (product: Product): string[] => {
  const tags = new Set<string>();
  (CATEGORY_COMPAT[product.categoryLabel] ?? []).forEach((t) => tags.add(t));
  // Tag inference from name/features
  const haystack = normalize(
    [product.name, product.shortDescription, ...(product.features ?? [])].join(" ")
  );
  if (/elektr|e bike|ebike/.test(haystack)) tags.add("elektrokolo");
  if (/nepromok|waterproof|vodeodoln/.test(haystack)) tags.add("nepromokavá");
  if (/ram|trojuheln/.test(haystack)) tags.add("rám");
  if (/riditk|handlebar/.test(haystack)) tags.add("řídítka");
  if (/sedl/.test(haystack)) tags.add("sedlo");
  if (/mobil|telefon|smb/.test(haystack)) tags.add("mobil");
  if (/nosic/.test(haystack)) tags.add("nosič");
  if (/neopren|bateri/.test(haystack)) tags.add("baterie");
  if (/gravel|bikepack/.test(haystack)) tags.add("gravel");
  if (/mtb|horsk/.test(haystack)) tags.add("mtb");
  return Array.from(tags);
};

// Levenshtein for fuzzy single-token matching (small strings only).
const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => i);
  for (let j = 1; j <= b.length; j++) {
    let prev = dp[0];
    dp[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const tmp = dp[i];
      dp[i] = Math.min(
        dp[i] + 1,
        dp[i - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return dp[a.length];
};

const tokenMatches = (qTok: string, pTok: string) => {
  if (pTok.includes(qTok) || qTok.includes(pTok)) return 1;
  const dist = levenshtein(qTok, pTok);
  const len = Math.max(qTok.length, pTok.length);
  // Allow ~25% typo tolerance
  if (dist / len <= 0.25) return 0.7;
  return 0;
};

export interface SearchableProduct extends Product {
  __searchHaystack: string;
  __compatTags: string[];
}

export const buildSearchIndex = (products: Product[]): SearchableProduct[] =>
  products.map((p) => {
    const compat = getCompatibilityTags(p);
    const haystack = normalize(
      [
        p.name,
        p.categoryLabel,
        p.shortDescription,
        p.color ?? "",
        ...(p.features ?? []),
        ...compat,
      ].join(" ")
    );
    return { ...p, __searchHaystack: haystack, __compatTags: compat };
  });

// Color detection: if the query contains one of the recognized color names
// (MORSEO + Vape Legends), only variants of that color are returned.
const COLOR_NORMALIZED = ALL_COLOR_NAMES.map((c) => ({
  color: c,
  normalized: normalize(c),
  // Match full normalized form first; single-word forms also count if ≥4 chars
  // to avoid false positives on common short words.
  forms: Array.from(
    new Set(
      [normalize(c), ...normalize(c).split(" ")].filter((s) => s.length >= 4),
    ),
  ),
}));

const detectColor = (normalizedQuery: string): string | null => {
  // Prefer longer/multi-word color names first (e.g. "Tyrkysová světlá" before "Modrá").
  const sorted = [...COLOR_NORMALIZED].sort(
    (a, b) => b.normalized.length - a.normalized.length,
  );
  for (const { color, normalized } of sorted) {
    if (normalizedQuery.includes(normalized)) return color;
  }
  for (const { color, forms } of sorted) {
    if (forms.some((f) => normalizedQuery.includes(f))) return color;
  }
  return null;
};

export const smartSearch = (
  index: SearchableProduct[],
  query: string,
): SearchableProduct[] => {
  const q = query.trim();
  if (!q) return index;

  const normalizedQuery = normalize(q);
  const colorMatch = detectColor(normalizedQuery);

  // If a color is named, hard-filter to that color first (priority rule).
  const colorFiltered = colorMatch
    ? index.filter((p) => p.color === colorMatch)
    : index;

  const rawTokens = tokenize(q);
  if (!rawTokens.length) return colorFiltered;

  const expandedGroups = rawTokens.map(expandToken);

  const scored = colorFiltered
    .map((p) => {
      const pTokens = p.__searchHaystack.split(" ");
      let score = 0;
      let matchedGroups = 0;
      for (const group of expandedGroups) {
        let best = 0;
        for (const qTok of group) {
          for (const pTok of pTokens) {
            const m = tokenMatches(qTok, pTok);
            if (m > best) best = m;
            if (best === 1) break;
          }
          if (best === 1) break;
        }
        if (best > 0) {
          matchedGroups += 1;
          score += best;
        }
      }
      return { p, score, matchedGroups };
    })
    .filter((r) =>
      // When the user typed a color, allow the color filter alone to qualify.
      colorMatch
        ? true
        : r.matchedGroups >= Math.ceil(expandedGroups.length * 0.5),
    )
    .sort((a, b) => b.score - a.score);

  return scored.map((r) => r.p);
};

