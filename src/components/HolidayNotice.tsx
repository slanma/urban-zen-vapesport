import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/* ------------------------------------------------------------------ */
/* Nastavení — jediné místo, kde se text a termíny mění                */
/* ------------------------------------------------------------------ */

/** Začátek dovolené (měsíc je 0-based: 8 = září). */
const VACATION_FROM = new Date(2026, 8, 23, 0, 0, 0);

/** Poslední den dovolené. */
const VACATION_TO = new Date(2026, 8, 30, 23, 59, 59);

/** Den, kdy se začínají znovu odesílat objednávky (9 = říjen). */
const SHIPPING_RESUMES = new Date(2026, 9, 1, 8, 0, 0);

/** Změň verzi, když upravíš text — lidem se okno zobrazí znovu. */
const NOTICE_VERSION = "dovolena-2026-09";

/** Na kterých stránkách se okno ukáže. Přidej "/pokladna", pokud chceš i tam. */
const SHOW_ON = ["/", "/kosik"];

const COPY = {
  eyebrow: "Dovolená 23. – 30. 9. 2026",
  heading: "Objednávky odesíláme od 1. října",
  body:
    "Od 23. do 30. září máme zavřený sklad, ale e-shop jede dál. Objednávku nám můžete poslat kdykoliv — vyexpedujeme ji hned 1. října v pořadí, ve kterém objednávky přišly.",
  note: "Na e-maily v tomto týdnu odpovídáme se zpožděním.",
  confirm: "Rozumím",
  bannerBody: "Objednávku klidně dokončete teď — expedujeme ji 1. října.",
};

/** Po obnovení expedice se hláška sama přestane zobrazovat. */
export function isHolidayNoticeActive(now: Date = new Date()): boolean {
  return now < SHIPPING_RESUMES;
}

/** True jen v průběhu samotné dovolené (pro případ jiného textu). */
export function isOnVacation(now: Date = new Date()): boolean {
  return now >= VACATION_FROM && now <= VACATION_TO;
}

function normalize(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}

/* ------------------------------------------------------------------ */
/* Modální okno — namontováno jednou v App.tsx, řídí se podle URL      */
/* ------------------------------------------------------------------ */

export function HolidayNotice({ delay = 700 }: { delay?: number }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const path = normalize(pathname);
  const storageKey = `vs-notice:${NOTICE_VERSION}:${path}`;

  useEffect(() => {
    setOpen(false);

    if (!isHolidayNoticeActive()) return;
    if (!SHOW_ON.includes(path)) return;

    try {
      if (sessionStorage.getItem(storageKey) === "seen") return;
    } catch {
      /* privátní režim — okno prostě ukážeme */
    }

    const t = setTimeout(() => setOpen(true), delay);
    return () => clearTimeout(t);
  }, [path, storageKey, delay]);

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    try {
      sessionStorage.setItem(storageKey, "seen");
    } catch {
      /* ignore */
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-[#1F1F1F]/45 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vs-notice-title"
        aria-describedby="vs-notice-body"
        className="relative w-full max-w-lg bg-white shadow-[0_24px_60px_-20px_rgba(31,31,31,0.35)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-200"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Zavřít"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center text-[#1F1F1F]/40 transition-colors hover:text-[#1F1F1F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48604B]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M2 2L14 14M14 2L2 14" />
          </svg>
        </button>

        <div className="px-8 pb-8 pt-10 sm:px-12 sm:pb-10 sm:pt-12">
          <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-[#48604B]">
            {COPY.eyebrow}
          </p>

          <h2
            id="vs-notice-title"
            className="mt-5 font-[Space_Grotesk,sans-serif] text-[1.9rem] font-bold uppercase leading-[1.05] tracking-[-0.01em] text-[#1F1F1F] sm:text-[2.25rem]"
          >
            {COPY.heading}
          </h2>

          <p
            id="vs-notice-body"
            className="mt-6 max-w-[48ch] text-[0.9375rem] leading-relaxed text-[#1F1F1F]/70"
          >
            {COPY.body}
          </p>

          <p className="mt-3 text-sm text-[#1F1F1F]/45">{COPY.note}</p>

          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="mt-9 w-full bg-[#48604B] px-10 py-4 text-[0.6875rem] uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#3A4E3D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2 sm:w-auto"
          >
            {COPY.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Volitelný pruh — když ho budeš chtít napevno do Cart.tsx            */
/* ------------------------------------------------------------------ */

export function HolidayBanner({ className = "" }: { className?: string }) {
  if (!isHolidayNoticeActive()) return null;

  return (
    <aside
      className={`border-l-2 border-[#48604B] bg-[#F5F5F3] px-6 py-5 ${className}`}
    >
      <p className="text-[0.625rem] uppercase tracking-[0.22em] text-[#48604B]">
        {COPY.eyebrow}
      </p>
      <p className="mt-2.5 font-[Space_Grotesk,sans-serif] text-base font-bold uppercase leading-tight tracking-[-0.01em] text-[#1F1F1F]">
        {COPY.heading}
      </p>
      <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-[#1F1F1F]/65">
        {COPY.bannerBody}
      </p>
    </aside>
  );
}

export default HolidayNotice;
