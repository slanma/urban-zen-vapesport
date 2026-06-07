import { useEffect, useState } from "react";

const KEY = "vapesport-admin-theme";
type Theme = "light" | "dark";

export const useAdminTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem(KEY) as Theme) || "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem(KEY, theme);
    return () => {
      // when leaving admin, theme persists for admin only; we reset on unmount
    };
  }, [theme]);

  // Clean up dark class when component unmounts (i.e. leaving admin)
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  return { theme, toggle };
};
