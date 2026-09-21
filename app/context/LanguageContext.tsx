"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  dictionaries,
  hasLocale,
  LOCALE_COOKIE,
  toLocaleDigits,
  type Locale,
} from "@/app/i18n/config";
import type { Messages } from "@/app/i18n/messages/en";

interface LanguageContextValue {
  lang: Locale;
  setLang: (lang: Locale) => void;
  /** The active dictionary — fully typed, e.g. `m.hero.title` */
  m: Messages;
  /** Locale-aware digits: "4.8" -> "४.८" in Nepali */
  n: (value: string | number) => string;
  /** Fill `{name}` placeholders in a message */
  format: (template: string, vars: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: Locale;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Locale>(initialLang);

  const setLang = useCallback((next: Locale) => {
    if (!hasLocale(next)) return;
    setLangState(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  // Keep <html lang> in sync so screen readers and hyphenation follow the UI language
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      m: dictionaries[lang],
      n: (v) => toLocaleDigits(v, lang),
      format: (template, vars) =>
        toLocaleDigits(
          template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? "")),
          lang,
        ),
    }),
    [lang, setLang],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within <LanguageProvider>");
  return ctx;
}
