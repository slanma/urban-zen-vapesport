import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type SettingsMap = Record<string, string>;
let cache: SettingsMap | null = null;
const listeners = new Set<(s: SettingsMap) => void>();

const load = async (): Promise<SettingsMap> => {
  const { data, error } = await supabase.from("site_settings").select("key,value");
  if (error || !data) return {};
  const map: SettingsMap = {};
  for (const row of data as Array<{ key: string; value: string | null }>) {
    map[row.key] = row.value ?? "";
  }
  cache = map;
  listeners.forEach((l) => l(map));
  return map;
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SettingsMap>(() => cache ?? {});
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    const l = (s: SettingsMap) => setSettings({ ...s });
    listeners.add(l);
    if (!cache) {
      setLoading(true);
      load().finally(() => setLoading(false));
    }
    return () => {
      listeners.delete(l);
    };
  }, []);

  const get = useCallback((key: string, fallback = ""): string => settings[key] ?? fallback, [settings]);

  const set = useCallback(async (key: string, value: string) => {
    const next = { ...(cache ?? {}), [key]: value };
    cache = next;
    listeners.forEach((l) => l(next));
    const { error } = await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
    if (error) throw error;
  }, []);

  return { settings, get, set, loading, reload: load };
};
