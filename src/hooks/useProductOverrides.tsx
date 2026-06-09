import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SpecRow {
  label: string;
  value: string;
}

export interface ProductOverride {
  product_id: string;
  visible: boolean;
  in_stock: boolean;
  stock_qty: number | null;
  price_override: number | null;
  b2b_price: number | null;
  vat_percent: number;
  description_html: string | null;
  youtube_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  ai_keywords: string | null;
  name_override: string | null;
  category_override: string | null;
  short_description_override: string | null;
  features_override: string[] | null;
  specs_override: SpecRow[] | null;
  colors_override: string[] | null;
  images_override: string[] | null;
  tech_params_html: string | null;
}

export const DEFAULT_OVERRIDE: Omit<ProductOverride, "product_id"> = {
  visible: true,
  in_stock: true,
  stock_qty: null,
  price_override: null,
  b2b_price: null,
  vat_percent: 21,
  description_html: null,
  youtube_url: null,
  meta_title: null,
  meta_description: null,
  ai_keywords: null,
  name_override: null,
  category_override: null,
  short_description_override: null,
  features_override: null,
  specs_override: null,
  colors_override: null,
  images_override: null,
  tech_params_html: null,
};

type Listener = (map: Map<string, ProductOverride>) => void;
const listeners = new Set<Listener>();
let cache: Map<string, ProductOverride> | null = null;
let inflight: Promise<Map<string, ProductOverride>> | null = null;

const PUBLIC_COLUMNS =
  "product_id,visible,in_stock,stock_qty,price_override,vat_percent,description_html,youtube_url,meta_title,meta_description,ai_keywords,name_override,category_override,short_description_override,features_override,specs_override,colors_override,images_override,tech_params_html,created_at,updated_at";

const fetchAll = async (): Promise<Map<string, ProductOverride>> => {
  if (inflight) return inflight;
  inflight = (async () => {
    const [overridesRes, b2bRes] = await Promise.all([
      supabase.from("product_overrides").select(PUBLIC_COLUMNS),
      // RPC is gated server-side: returns rows only for admins/approved B2B partners.
      supabase.rpc("get_product_b2b_prices"),
    ]);
    if (overridesRes.error) {
      console.error("Failed to load product overrides", overridesRes.error);
      return new Map();
    }
    const b2bMap = new Map<string, number>();
    if (!b2bRes.error && Array.isArray(b2bRes.data)) {
      for (const row of b2bRes.data as Array<{ product_id: string; b2b_price: number | null }>) {
        if (row.b2b_price != null) b2bMap.set(row.product_id, row.b2b_price);
      }
    }
    const map = new Map<string, ProductOverride>();
    for (const row of overridesRes.data ?? []) {
      const r = row as unknown as Omit<ProductOverride, "b2b_price">;
      map.set(r.product_id, { ...r, b2b_price: b2bMap.get(r.product_id) ?? null } as ProductOverride);
    }
    cache = map;
    listeners.forEach((l) => l(map));
    inflight = null;
    return map;
  })();
  return inflight;
};

const broadcast = () => {
  if (cache) listeners.forEach((l) => l(new Map(cache!)));
};

const SAVE_TIMEOUT_MS = 12000;

export const useProductOverrides = () => {
  const [map, setMap] = useState<Map<string, ProductOverride>>(
    () => cache ?? new Map(),
  );
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    const listener: Listener = (m) => setMap(new Map(m));
    listeners.add(listener);
    // Always refetch on mount to keep data in sync with Supabase
    // (cache is used for instant paint, but we revalidate immediately).
    cache = null;
    inflight = null;
    setLoading(true);
    fetchAll()
      .then((m) => setMap(new Map(m)))
      .finally(() => setLoading(false));
    return () => {
      listeners.delete(listener);
    };
  }, []);


  const get = useCallback(
    (productId: string): ProductOverride => {
      return (
        map.get(productId) ?? { product_id: productId, ...DEFAULT_OVERRIDE }
      );
    },
    [map],
  );

  const upsert = useCallback(
    async (productId: string, patch: Partial<ProductOverride>) => {
      const current = cache?.get(productId) ?? {
        product_id: productId,
        ...DEFAULT_OVERRIDE,
      };
      const next: ProductOverride = { ...current, ...patch, product_id: productId };
      // Optimistic
      if (!cache) cache = new Map();
      cache.set(productId, next);
      broadcast();
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), SAVE_TIMEOUT_MS);
      try {
        const { error } = await supabase
          .from("product_overrides")
          .upsert(next as never, { onConflict: "product_id" })
          .abortSignal(controller.signal);
        if (error) {
          console.error("Failed to save override", error);
          throw error;
        }
      } catch (error) {
        if (cache) {
          cache.set(productId, current);
          broadcast();
        }
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new Error("Ukládání trvalo příliš dlouho. Zkuste to prosím znovu.");
        }
        throw error;
      } finally {
        window.clearTimeout(timeoutId);
      }
      return next;
    },
    [],
  );

  return { overrides: map, get, upsert, loading };
};

export const refreshOverrides = () => {
  cache = null;
  inflight = null;
  return fetchAll();
};
