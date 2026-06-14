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

export interface RegisterB2BResponse {
  ok: boolean;
  status?: "pending";
  code?: string;
  message?: string;
}

export const registerB2B = async (
  body: B2BRegistrationPayload & { email: string; password: string },
  ms = 18000,
): Promise<RegisterB2BResponse> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), ms);

  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/register-b2b`;
    const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null) as RegisterB2BResponse | null;
    if (payload) return payload;
    return { ok: false, code: "network", message: `Registrace se nezdařila (HTTP ${response.status}).` };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { ok: false, code: "timeout", message: "Registrace trvá příliš dlouho. Zkuste to prosím znovu." };
    }
    return {
      ok: false,
      code: "network",
      message: error instanceof Error ? error.message : "Registrace se nezdařila. Zkuste to prosím znovu.",
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
};