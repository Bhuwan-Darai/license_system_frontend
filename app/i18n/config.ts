import en from "./messages/en";
import ne from "./messages/ne";
import type { Messages } from "./messages/en";

export const LOCALES = ["en", "ne"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "lang";

export const dictionaries: Record<Locale, Messages> = { en, ne };

export const hasLocale = (value: string | undefined): value is Locale =>
  !!value && (LOCALES as readonly string[]).includes(value);

// Devanagari digits, used when formatting numbers for the Nepali locale
const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export const toLocaleDigits = (value: string | number, locale: Locale) => {
  const text = String(value);
  return locale === "ne" ? text.replace(/\d/g, (d) => NEPALI_DIGITS[+d]) : text;
};
