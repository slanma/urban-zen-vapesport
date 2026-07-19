/**
 * Guarded service-worker registration.
 * - Registers the kill-switch worker only in production.
 * - Never registers inside Lovable preview/dev, iframes, or when ?sw=off is present.
 * - Unregisters any existing /sw.js registration in refused contexts.
 */

const SW_PATH = "/sw.js";

function isPreviewOrDev(): boolean {
  if (import.meta.env.DEV) return true;
  const host = window.location.hostname;
  if (host.startsWith("id-preview--") || host.startsWith("preview--")) return true;
  if (host === "lovableproject.com" || host.endsWith(".lovableproject.com")) return true;
  if (host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com")) return true;
  if (host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev")) return true;
  return false;
}

function shouldRegister(): boolean {
  if (!import.meta.env.PROD) return false;
  if (window.self !== window.top) return false;
  if (isPreviewOrDev()) return false;
  if (window.location.search.includes("sw=off")) return false;
  return true;
}

async function unregisterExisting(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((reg) => reg.scope.endsWith(SW_PATH) || reg.scope.endsWith("/"))
      .map((reg) => reg.unregister()),
  );
}

export async function registerServiceWorker(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  if (!shouldRegister()) {
    await unregisterExisting();
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
    // The kill-switch worker will unregister itself after activation.
    // eslint-disable-next-line no-console
    console.log("[SW] kill-switch registered:", registration.scope);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[SW] registration failed:", err);
  }
}
