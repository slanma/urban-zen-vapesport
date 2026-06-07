import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const SCRIPT_ID = "ga4-gtag-script";
const INLINE_ID = "ga4-gtag-init";
const GA_ID_RE = /^G-[A-Z0-9]{4,}$/i;

let injectedId: string | null = null;

function injectGtag(measurementId: string) {
  if (injectedId === measurementId) return;
  // Remove any previously injected scripts (e.g. if id changed)
  document.getElementById(SCRIPT_ID)?.remove();
  document.getElementById(INLINE_ID)?.remove();

  const s = document.createElement("script");
  s.id = SCRIPT_ID;
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(s);

  const inline = document.createElement("script");
  inline.id = INLINE_ID;
  inline.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', '${measurementId}', { send_page_view: false });
  `;
  document.head.appendChild(inline);

  injectedId = measurementId;
}

export const useAnalytics = () => {
  const location = useLocation();
  const measurementIdRef = useRef<string | null>(null);

  // Load Measurement ID once and inject script
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ga4_measurement_id")
        .maybeSingle();
      const id = data?.value?.trim();
      if (cancelled || !id || !GA_ID_RE.test(id)) return;
      measurementIdRef.current = id;
      injectGtag(id);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Track pageviews across react-router navigations
  useEffect(() => {
    const id = measurementIdRef.current;
    if (!id || typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
      send_to: id,
    });
  }, [location.pathname, location.search]);
};

export default useAnalytics;
