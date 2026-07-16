import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface B2BProfile {
  user_id: string;
  company_name: string;
  ico: string;
  dic: string | null;
  contact_person: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  discount_percent: number;
  free_shipping: boolean;
  obrat_2025: number;
  obrat_2026: number;
  invoice_email: string | null;
  delivery_same: boolean;
  delivery_company: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_zip: string | null;
  delivery_contact: string | null;
  delivery_phone: string | null;
}

/**
 * Returns true only for authenticated users that have an APPROVED
 * b2b_profile (i.e. the "B2B_PARTNER" role). Wholesale (VOC) prices
 * MUST be gated behind this flag. Also exposes the profile for
 * pre-filling the B2B checkout.
 */
export const useB2BPartner = () => {
  const [isPartner, setIsPartner] = useState(false);
  const [profile, setProfile] = useState<B2BProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) {
          setIsPartner(false);
          setProfile(null);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase
        .from("b2b_profiles")
        .select("user_id,company_name,ico,dic,contact_person,phone,address,city,zip,discount_percent,free_shipping,obrat_2025,obrat_2026,invoice_email,delivery_same,delivery_company,delivery_address,delivery_city,delivery_zip,delivery_contact,delivery_phone,status")
        .eq("user_id", user.id)
        .maybeSingle();
      const approved = data?.status === "approved";
      const prof = approved ? data as B2BProfile : null;
      if (!cancelled) {
        setIsPartner(approved);
        setProfile(prof);
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

  return { isPartner, profile, loading };
};
