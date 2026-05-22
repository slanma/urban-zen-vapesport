import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProductOverride {
  product_id: string;
  visible: boolean;
  in_stock: boolean;
  price_override: number | null;
  b2b_price: number | null;
  vat_percent: number;
  description_html: string | null;
  youtube_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  ai_keywords: string | null;
}

export const DEFAULT_OVERRIDE: Omit<ProductOverride, "product_id"> = {
  visible: true,
  in_stock: true,
  price_override: null,
  b2b_price: null,
  vat_percent: 21,
  description_html: null,
  youtube_url: null,
  meta_title: null,
  meta_description: null,
  ai_keywords: null,
};

type Listener = (map: Map<string, ProductOverride>) => void;
const listeners = new Set<Listener>();
let cache: Map<string, ProductOverride> | null = null;
let inflight: Promise<Map<string, ProductOverride>> | null = null;

const fetchAll = async (): Promise<Map<string, ProductOverride>> => {
  if (inflight) return inflight;
  inflight = (async () => {
    const { data, error } = await supabase
      .from("product_overrides")
      .select("*");
    if (error) {
      console.error("Failed to load product overrides", error);
      return new Map();
    }
    const map = new Map<string, ProductOverride>();
    for (const row of data ?? []) map.set(row.product_id, row as ProductOverride);
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

export const useProductOverrides = () => {
  const [map, setMap] = useState<Map<string, ProductOverride>>(
    () => cache ?? new Map(),
  );
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    const listener: Listener = (m) => setMap(new Map(m));
    listeners.add(listener);
    if (!cache) {
      fetchAll().then(() => setLoading(false));
    } else {
      setLoading(false);
    }
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
      const { error } = await supabase
        .from("product_overrides")
        .upsert(next, { onConflict: "product_id" });
      if (error) {
        console.error("Failed to save override", error);
        throw error;
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
