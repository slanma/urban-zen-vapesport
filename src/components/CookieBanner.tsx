import { useEffect, useState } from "react";

const STORAGE_KEY = "vapesport_cookie_consent";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const decide = (choice: "accepted" | "rejected") => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ choice, ts: new Date().toISOString() })
    );
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Souhlas s cookies"
      className="fixed bottom-0 inset-x-0 z-[100] p-4 md:p-6"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-background/95 backdrop-blur-md shadow-2xl p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="flex-1">
            <h2 className="font-heading text-base font-semibold mb-1">
              Tato stránka používá cookies
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Používáme cookies k zajištění funkčnosti webu, analýze návštěvnosti a personalizaci obsahu.
              Můžete je všechny přijmout, nebo odmítnout. Své rozhodnutí můžete kdykoli změnit.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:flex md:flex-row md:shrink-0">
            <button
              onClick={() => decide("rejected")}
              className="h-11 px-5 rounded-md border border-border bg-background text-foreground text-sm font-semibold hover:bg-muted transition-colors min-w-[140px]"
            >
              Odmítnout vše
            </button>
            <button
              onClick={() => decide("accepted")}
              className="h-11 px-5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors min-w-[140px]"
            >
              Přijmout všehny koláčky
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
