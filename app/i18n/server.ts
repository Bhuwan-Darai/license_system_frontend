import { cache } from "react";
import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  dictionaries,
  hasLocale,
  LOCALE_COOKIE,
  toLocaleDigits,
} from "./config";

/**
 * The language dictionary for Server Components, picked from the same cookie
 * the root layout uses. Server twin of `useI18n()`: components that only need
 * text can be rendered on the server and ship no JavaScript.
 */
export const getI18n = cache(async () => {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  const lang = hasLocale(saved) ? saved : DEFAULT_LOCALE;

  return {
    lang,
    m: dictionaries[lang],
    n: (value: string | number) => toLocaleDigits(value, lang),
  };
});
