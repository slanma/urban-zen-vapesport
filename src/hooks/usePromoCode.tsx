import { useCallback, useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  computeDiscount,
  type DiscountLine,
  type DiscountResult,
  type DiscountRule,
} from "@/lib/discounts";

/**
 * Akce a slevy – sdílený stav pro Košík, Pokladnu a B2B pokladnu.
 *
 * Server (RPC `get_applicable_discounts`) vrací jen akce, na které má
 * aktuální zákazník nárok: aktivní, v termínu, pro jeho skupinu (B2C / B2B
 * podle partnerské slevy) a – u akcí s kódem – jen když zadal ten kód.
 * Výběr nejvyšší slevy dělá `computeDiscount` v `src/lib/discounts.ts`.
 *
 * Stav je jeden pro celou stránku (všechny komponenty vidí stejný kód),
 * zadaný kód se pamatuje v localStorage.
 */

const CODE_KEY = "vapesport_discount_code";
const LEGACY_KEY = "vapesport_promo";

interface State {
  code: string | null;
  rules: DiscountRule[];
  loading: boolean;
}

const readStoredCode = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const current = window.localStorage.getItem(CODE_KEY);
    if (current) return current;
    // Převzít kód uložený starou verzí webu.
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    window.localStorage.removeItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as { code?: string };
      return parsed.code?.toUpperCase() ?? null;
    }
  } catch {
    /* ignore */
  }
  return null;
};

let state: State = { code: null, rules: [], loading: false };
let initialized = false;
let requestId = 0;
const listeners = new Set<() => void>();

const setState = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

const persistCode = (code: string | null) => {
  if (typeof window === "undefined") return;
  try {
    if (code) window.localStorage.setItem(CODE_KEY, code);
    else window.localStorage.removeItem(CODE_KEY);
  } catch {
    /* ignore */
  }
};

const fetchRules = async () => {
  const id = ++requestId;
  setState({ loading: true });
  try {
    const { data, error } = await (supabase as any).rpc("get_applicable_discounts", {
      p_code: state.code,
    });
    if (error) throw error;
    if (id !== requestId) return;
    const rules: DiscountRule[] = ((data as any[]) ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code ?? null,
      percent: Number(r.percent),
      min_net: r.min_net == null ? null : Number(r.min_net),
      collections: r.collections ?? [],
    }));
    setState({ rules, loading: false });
  } catch (err) {
    console.error("[useDiscounts] načtení akcí selhalo:", err);
    if (id === requestId) setState({ rules: [], loading: false });
  }
};

const ensureInit = () => {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  state = { ...state, code: readStoredCode() };
  void fetchRules();
  // Přihlášení / odhlášení mění, na jaké akce má zákazník nárok.
  supabase.auth.onAuthStateChange(() => void fetchRules());
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const getSnapshot = () => state;
const SERVER_STATE: State = { code: null, rules: [], loading: false };
const getServerSnapshot = () => SERVER_STATE;

const CODE_STATUS_TEXT: Record<string, string> = {
  not_found: "Tento kód neexistuje.",
  inactive: "Tento kód není aktivní.",
  not_started: "Kód ještě neplatí.",
  expired: "Platnost kódu skončila.",
  wrong_audience: "Kód není určen pro váš účet.",
};

export const useDiscounts = () => {
  useEffect(ensureInit, []);
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const applyCode = useCallback(async (raw: string): Promise<boolean> => {
    const code = raw.trim().toUpperCase();
    if (!code) return false;
    setState({ loading: true });
    try {
      const { data, error } = await (supabase as any).rpc("check_discount_code", { p_code: code });
      if (error) throw error;
      const status = String(data ?? "not_found");
      if (status !== "ok") {
        setState({ loading: false });
        toast.error(CODE_STATUS_TEXT[status] ?? "Kód nelze použít.");
        return false;
      }
      setState({ code });
      persistCode(code);
      await fetchRules();
      toast.success(`Slevový kód „${code}“ je zadaný.`);
      return true;
    } catch (err) {
      console.error("[useDiscounts] ověření kódu selhalo:", err);
      setState({ loading: false });
      toast.error("Kód se nepodařilo ověřit.");
      return false;
    }
  }, []);

  const removeCode = useCallback(() => {
    setState({ code: null });
    persistCode(null);
    void fetchRules();
  }, []);

  /** Spočítá slevu pro dané řádky košíku. */
  const evaluate = useCallback(
    (lines: DiscountLine[], partnerPercent = 0): DiscountResult =>
      computeDiscount(lines, snap.rules, partnerPercent, snap.code),
    [snap.rules, snap.code],
  );

  return {
    code: snap.code,
    rules: snap.rules,
    loading: snap.loading,
    applyCode,
    removeCode,
    evaluate,
  };
};

/** Zpětná kompatibilita se starým názvem. */
export const usePromoCode = useDiscounts;
