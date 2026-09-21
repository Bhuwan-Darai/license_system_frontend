"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

// The admin dashboard is styled with fixed light colours, so it always renders light.
const LIGHT_ONLY_PREFIXES = ["/dashboard"];

/**
 * Runs in <head> before first paint (see app/layout.tsx) so a saved or OS-preferred
 * dark theme never flashes light. Keep in sync with the logic below.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var d=t==="dark"&&!${JSON.stringify(
  LIGHT_ONLY_PREFIXES,
)}.some(function(p){return location.pathname.indexOf(p)===0});var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"}catch(e){}})();`;

interface ThemeContextValue {
  /** The user's chosen theme (not necessarily what's rendered — see `resolvedTheme`) */
  theme: Theme;
  /** What is actually on screen; always "light" on light-only routes */
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const readStoredTheme = (): Theme => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // storage unavailable (private mode etc.) — fall through to OS preference
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Server and first client render agree on "light"; the real value is read after mount.
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(readStoredTheme());
  }, []);

  const lightOnly = LIGHT_ONLY_PREFIXES.some((p) => pathname?.startsWith(p));
  const resolvedTheme: Theme = lightOnly ? "light" : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // ignore — the choice still applies for this session
    }
  }, []);

  const toggleTheme = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme],
  );

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
