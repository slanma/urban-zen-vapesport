import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AppliedPromo {
  code: string;
  type: "percentage" | "fixed_amount";
  value: number;
}

const STORAGE_KEY = "vapesport_promo";

const readStored = (): AppliedPromo | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppliedPromo;
  } catch {
    return null;
  }
};

/**
 * Shared promo-code state. Persists the applied promo in localStorage so the
 * Cart, B2C Checkout and B2B Checkout stay in sync. Validation runs against
 * the `validate_promo_code` SECURITY DEFINER RPC.
 */
export const usePromoCode = () => {
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(readStored);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (appliedPromo) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appliedPromo));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [appliedPromo]);

  const applyPromo = useCallback(async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return false;
    setApplying(true);
    try {
      const { data, error } = await supabase.rpc("validate_promo_code", { _code: code });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) {
        toast.error("Neplatný nebo neaktivní kód.");
        return false;
      }
      const promo: AppliedPromo = {
        code: row.code,
        type: row.type as "percentage" | "fixed_amount",
        value: Number(row.value),
      };
      setAppliedPromo(promo);
      toast.success(`Slevový kód „${promo.code}" byl uplatněn.`);
      return true;
    } catch (err) {
      console.error("[usePromoCode] validate failed:", err);
      toast.error("Kód se nepodařilo ověřit.");
      return false;
    } finally {
      setApplying(false);
    }
  }, []);

  const removePromo = useCallback(() => setAppliedPromo(null), []);

  const computeDiscountGross = useCallback(
    (preDiscountGross: number): number => {
      if (!appliedPromo) return 0;
      const raw =
        appliedPromo.type === "percentage"
          ? Math.round(preDiscountGross * (Number(appliedPromo.value) / 100))
          : Math.round(Number(appliedPromo.value));
      return Math.max(0, Math.min(raw, preDiscountGross));
    },
    [appliedPromo],
  );

  return { appliedPromo, applying, applyPromo, removePromo, computeDiscountGross };
};
