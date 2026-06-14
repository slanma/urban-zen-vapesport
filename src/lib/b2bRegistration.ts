import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const B2B_REGISTRATION_METADATA_KEY = "b2b_registration";

export interface B2BRegistrationPayload {
  companyName: string;
  ico: string;
  dic: string;
  contactName: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
}

export const insertB2BProfile = async (userId: string, payload: B2BRegistrationPayload) => {
  return supabase.from("b2b_profiles").insert({
    user_id: userId,
    company_name: payload.companyName,
    ico: payload.ico,
    dic: payload.dic || null,
    contact_person: payload.contactName,
    phone: payload.phone,
    address: payload.address,
    city: payload.city,
    zip: payload.zip,
  });
};

export const createB2BProfileFromUserMetadata = async (user: User) => {
  const payload = user.user_metadata?.[B2B_REGISTRATION_METADATA_KEY] as B2BRegistrationPayload | undefined;
  if (!payload?.companyName || !payload.ico || !payload.contactName) {
    return { created: false, missingMetadata: true, error: null as string | null };
  }

  const { error } = await insertB2BProfile(user.id, payload);
  if (!error) return { created: true, missingMetadata: false, error: null as string | null };

  if (error.code === "23505") {
    return { created: false, missingMetadata: false, error: null as string | null };
  }

  return { created: false, missingMetadata: false, error: error.message };
};

export const withTimeout = async <T,>(promise: Promise<T>, errorMessage: string, ms = 18000): Promise<T> => {
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(errorMessage)), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
};