import type { Session } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const PROJECT_REF = new URL(SUPABASE_URL).hostname.split(".")[0];
const AUTH_STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`;

type AdminSignInResult = {
  session: Session | null;
  error: Error | null;
};

const isSession = (value: unknown): value is Session => {
  return Boolean(
    value &&
      typeof value === "object" &&
      "access_token" in value &&
      "refresh_token" in value &&
      "user" in value
  );
};

export const getStoredAdminSession = (): Session | null => {
  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawSession) return null;

  try {
    const parsed = JSON.parse(rawSession) as Session | { currentSession?: Session };
    const session = "currentSession" in parsed ? parsed.currentSession : parsed;
    return isSession(session) ? session : null;
  } catch {
    return null;
  }
};

export const clearStoredAdminSession = () => {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

const persistAdminSession = (session: Session) => {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Ověření přístupu trvá příliš dlouho. Přihlaste se prosím znovu.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const adminSignInWithPassword = async (email: string, password: string): Promise<AdminSignInResult> => {
  const response = await fetchWithTimeout(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify({ email, password, gotrue_meta_security: {} }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { session: null, error: new Error(data?.msg || data?.message || "Přihlášení se nezdařilo.") };
  }

  persistAdminSession(data as Session);
  return { session: data as Session, error: null };
};

export const checkAdminRole = async (userId: string, accessToken: string) => {
  const response = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/rpc/has_role`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ _user_id: userId, _role: "admin" }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { isAdmin: false, error: new Error(errorText || "Nepodařilo se ověřit administrátorský přístup.") };
  }

  return { isAdmin: Boolean(await response.json()), error: null };
};