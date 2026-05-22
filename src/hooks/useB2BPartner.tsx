import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns true only for authenticated users that have an APPROVED
 * b2b_profile (i.e. the "B2B_PARTNER" role). Wholesale (VOC) prices
 * MUST be gated behind this flag.
 */
export const useB2BPartner = () => {
  const [isPartner, setIsPartner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) {
          setIsPartner(false);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase.rpc("get_b2b_status", { _user_id: user.id });
      if (!cancelled) {
        setIsPartner(data === "approved");
        setLoading(false);
      }
    };

    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { isPartner, loading };
};
