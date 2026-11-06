import NepaliDate from "nepali-date-converter";
import type { GenerateConfig } from "@rc-component/picker/generate/index";

/**
 * rc-picker / antd "custom date library" configs.
 * See https://ant.design/docs/react/use-custom-date-library
 *
 * The picker's value type is a plain JS `Date` holding the real (AD) instant.
 *  - `bsGenerateConfig`: every getter/setter reads/writes the *Bikram Sambat*
 *    year / month / day, so the calendar shows BS.
 *  - `adGenerateConfig`: the same, for the Gregorian calendar.
 *
 * Locale handling: a locale starting with "ne" renders Nepali month/weekday
 * names and Devanagari digits; anything else renders English.
 *
 * `nepali-date-converter` supports BS 2000-01-01 .. 2090-12-30. Results are
 * clamped into range so the picker never throws.
 */

export const BS_MONTHS_EN = [
  "Baisakh", "Jestha", "Asar", "Shrawan", "Bhadra", "Aswin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra",
];
export const BS_MONTHS_NE = [
  "बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "असोज",
  "कार्तिक", "मंसिर", "पुष", "माघ", "फागुन", "चैत",
];
const AD_MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_NE = ["आइतबार", "सोमबार", "मङ्गलबार", "बुधबार", "बिहिबार", "शुक्रबार", "शनिबार"];
const WEEKDAYS_SHORT_NE = ["आइत", "सोम", "मङ्गल", "बुध", "बिहि", "शुक्र", "शनि"];

export const BS_MIN_YEAR = 2000;
export const BS_MAX_YEAR = 2090;
const AD_MIN_YEAR = 1943;
const AD_MAX_YEAR = 2034;

const DEVANAGARI = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export const isNe = (locale: string) => locale.toLowerCase().startsWith("ne");
const pad = (n: number, len = 2) => String(n).padStart(len, "0");
export const toNeDigits = (s: string) => s.replace(/\d/g, (d) => DEVANAGARI[Number(d)]);
const fromNeDigits = (s: string) => s.replace(/[०-९]/g, (d) => String(DEVANAGARI.indexOf(d)));

/* ---------- calendar abstraction ---------- */

export interface DateParts {
  year: number;
  /** 0-indexed */
  month: number;
  day: number;
}

interface Calendar {
  minYear: number;
  maxYear: number;
  monthsEn: string[];
  monthsNe: string[];
  /** Parts of an AD instant in this calendar. Throws when out of range. */
  toParts(date: Date): DateParts;
  /** AD midnight for the given parts (month/day overflow rolls over). Throws when out of range. */
  fromParts(year: number, month: number, day: number): Date;
  daysInMonth(year: number, month: number): number;
}

const bsCalendar: Calendar = {
  minYear: BS_MIN_YEAR,
  maxYear: BS_MAX_YEAR,
  monthsEn: BS_MONTHS_EN,
  monthsNe: BS_MONTHS_NE,
  toParts: (date) => {
    const nd = new NepaliDate(date);
    return { year: nd.getYear(), month: nd.getMonth(), day: nd.getDate() };
  },
  fromParts: (y, m, d) => new NepaliDate(y, m, d).toJsDate(),
  daysInMonth: (y, m) => new NepaliDate(y, m + 1, 0).getDate(),
};

const adCalendar: Calendar = {
  minYear: AD_MIN_YEAR,
  maxYear: AD_MAX_YEAR,
  monthsEn: AD_MONTHS_EN,
  monthsNe: AD_MONTHS_EN,
  toParts: (date) => ({ year: date.getFullYear(), month: date.getMonth(), day: date.getDate() }),
  fromParts: (y, m, d) => {
    const dt = new Date(2000, 0, 1);
    dt.setFullYear(y, m, d); // setFullYear avoids the 0-99 => 19xx quirk
    return dt;
  },
  daysInMonth: (y, m) => {
    const dt = new Date(2000, 0, 1);
    dt.setFullYear(y, m + 1, 0);
    return dt.getDate();
  },
};

/* ---------- public BS helpers ---------- */

export const toBs = (date: Date): DateParts => bsCalendar.toParts(date);
export const daysInBsMonth = (year: number, month: number) => bsCalendar.daysInMonth(year, month);

/* ---------- token formatting / parsing ---------- */

// Longest tokens first so "MMMM" isn't read as "MM" "MM".
const TOKEN_RE = /\[([^\]]*)\]|YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|dd|d|HH|H|hh|h|mm|m|ss|s|A|a/g;

function formatDate(cal: Calendar, date: Date, format: string, locale: string): string {
  const ne = isNe(locale);
  const { year, month, day } = cal.toParts(date);
  const weekday = date.getDay();
  const h = date.getHours();
  const months = ne ? cal.monthsNe : cal.monthsEn;

  const out = format.replace(TOKEN_RE, (token, literal?: string) => {
    if (literal !== undefined) return literal;
    switch (token) {
      case "YYYY": return pad(year, 4);
      case "YY": return pad(year % 100);
      case "MMMM": return months[month];
      case "MMM": return ne ? months[month] : months[month].slice(0, 3);
      case "MM": return pad(month + 1);
      case "M": return String(month + 1);
      case "DD": return pad(day);
      case "D": return String(day);
      case "dddd": return (ne ? WEEKDAYS_NE : WEEKDAYS_EN)[weekday];
      case "ddd": return ne ? WEEKDAYS_SHORT_NE[weekday] : WEEKDAYS_EN[weekday].slice(0, 3);
      case "dd": return ne ? WEEKDAYS_SHORT_NE[weekday] : WEEKDAYS_EN[weekday].slice(0, 2);
      case "d": return String(weekday);
      case "HH": return pad(h);
      case "H": return String(h);
      case "hh": return pad(h % 12 || 12);
      case "h": return String(h % 12 || 12);
      case "mm": return pad(date.getMinutes());
      case "m": return String(date.getMinutes());
      case "ss": return pad(date.getSeconds());
      case "s": return String(date.getSeconds());
      case "A": return h < 12 ? "AM" : "PM";
      case "a": return h < 12 ? "am" : "pm";
      default: return token;
    }
  });
  return ne ? toNeDigits(out) : out;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function parseDate(cal: Calendar, text: string, format: string, locale: string): Date | null {
  const ne = isNe(locale);
  const src = fromNeDigits(text.trim());
  const groups: string[] = [];
  let pattern = "";
  let last = 0;

  for (const m of format.matchAll(TOKEN_RE)) {
    pattern += escapeRe(format.slice(last, m.index));
    last = (m.index ?? 0) + m[0].length;
    const token = m[0];
    if (m[1] !== undefined) {
      pattern += escapeRe(m[1]);
      continue;
    }
    groups.push(token);
    switch (token) {
      case "YYYY": pattern += "(\\d{4})"; break;
      case "YY": case "MM": case "DD": case "HH": case "hh": case "mm": case "ss": pattern += "(\\d{2})"; break;
      case "M": case "D": case "H": case "h": case "m": case "s": pattern += "(\\d{1,2})"; break;
      case "MMMM": case "MMM": pattern += "([^\\s\\d]+)"; break;
      case "A": case "a": pattern += "([AaPp][Mm])"; break;
      default: pattern += "(.+?)"; // weekday names etc. are ignored
    }
  }
  pattern += escapeRe(format.slice(last));

  const match = new RegExp(`^${pattern}$`).exec(src);
  if (!match) return null;

  let year = 0;
  let month = 0;
  let day = 1;
  let hour = 0;
  let minute = 0;
  let second = 0;
  let pm: boolean | null = null;
  try {
    year = cal.toParts(new Date()).year;
  } catch {
    return null;
  }

  for (let i = 0; i < groups.length; i++) {
    const v = match[i + 1];
    switch (groups[i]) {
      case "YYYY": year = Number(v); break;
      case "YY": year = Math.floor(year / 100) * 100 + Number(v); break;
      case "MM": case "M": month = Number(v) - 1; break;
      case "MMMM": case "MMM": {
        const names = ne ? cal.monthsNe : cal.monthsEn;
        const idx = names.findIndex((n) => n.toLowerCase().startsWith(v.toLowerCase()));
        if (idx < 0) return null;
        month = idx;
        break;
      }
      case "DD": case "D": day = Number(v); break;
      case "HH": case "H": case "hh": case "h": hour = Number(v); break;
      case "mm": case "m": minute = Number(v); break;
      case "ss": case "s": second = Number(v); break;
      case "A": case "a": pm = v.toLowerCase() === "pm"; break;
    }
  }
  if (pm !== null) hour = (hour % 12) + (pm ? 12 : 0);

  if (year < cal.minYear || year > cal.maxYear) return null;
  if (month < 0 || month > 11) return null;
  if (day < 1 || day > cal.daysInMonth(year, month)) return null;
  if (hour > 23 || minute > 59 || second > 59) return null;

  try {
    const d = cal.fromParts(year, month, day);
    d.setHours(hour, minute, second, 0);
    return d;
  } catch {
    return null;
  }
}

/* ---------- config factory ---------- */

function createGenerateConfig(cal: Calendar): GenerateConfig<Date> {
  const inRange = (date: Date) => {
    try {
      const { year } = cal.toParts(date);
      return year >= cal.minYear && year <= cal.maxYear;
    } catch {
      return false;
    }
  };

  /** Build a date from parts keeping the time of `base`. Day is not clamped. */
  const build = (year: number, month: number, day: number, base: Date): Date => {
    const d = cal.fromParts(year, month, day);
    d.setHours(base.getHours(), base.getMinutes(), base.getSeconds(), base.getMilliseconds());
    return d;
  };

  /** Like `build` but clamps the day into the target month (31st + 1 month). */
  const buildClamped = (year: number, month: number, day: number, base: Date): Date => {
    const first = cal.toParts(cal.fromParts(year, month, 1)); // normalises month overflow
    return build(first.year, first.month, Math.min(day, cal.daysInMonth(first.year, first.month)), base);
  };

  /** Never throw for out-of-range input: fall back to the original date. */
  const safe = (fn: () => Date, fallback: Date): Date => {
    try {
      const out = fn();
      return inRange(out) ? out : fallback;
    } catch {
      return fallback;
    }
  };

  const withTime = (date: Date, fn: (d: Date) => void) => {
    const d = new Date(date);
    fn(d);
    return d;
  };

  const weekOfYear = (date: Date): number => {
    const { year } = cal.toParts(date);
    const first = cal.fromParts(year, 0, 1);
    const dayMs = 86_400_000;
    const startUtc = Date.UTC(first.getFullYear(), first.getMonth(), first.getDate()) - first.getDay() * dayMs;
    const dateUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.floor((dateUtc - startUtc) / (7 * dayMs)) + 1;
  };

  const config: GenerateConfig<Date> = {
    getNow: () => new Date(),
    getFixedDate: (string) => new Date(string),
    getEndDate: (date) =>
      safe(() => {
        const { year, month } = cal.toParts(date);
        return build(year, month, cal.daysInMonth(year, month), date);
      }, date),
    getWeekDay: (date) => date.getDay(),
    getYear: (date) => cal.toParts(date).year,
    getMonth: (date) => cal.toParts(date).month,
    getDate: (date) => cal.toParts(date).day,
    getHour: (date) => date.getHours(),
    getMinute: (date) => date.getMinutes(),
    getSecond: (date) => date.getSeconds(),
    getMillisecond: (date) => date.getMilliseconds(),

    addYear: (date, diff) =>
      safe(() => {
        const { year, month, day } = cal.toParts(date);
        return buildClamped(year + diff, month, day, date);
      }, date),
    addMonth: (date, diff) =>
      safe(() => {
        const { year, month, day } = cal.toParts(date);
        return buildClamped(year, month + diff, day, date);
      }, date),
    addDate: (date, diff) => {
      const d = withTime(date, (x) => x.setDate(x.getDate() + diff));
      return inRange(d) ? d : date;
    },
    setYear: (date, year) =>
      safe(() => {
        const { month, day } = cal.toParts(date);
        return buildClamped(year, month, day, date);
      }, date),
    setMonth: (date, month) =>
      safe(() => {
        const { year, day } = cal.toParts(date);
        return buildClamped(year, month, day, date);
      }, date),
    setDate: (date, num) =>
      safe(() => {
        const { year, month } = cal.toParts(date);
        return build(year, month, num, date);
      }, date),
    setHour: (date, v) => withTime(date, (d) => d.setHours(v)),
    setMinute: (date, v) => withTime(date, (d) => d.setMinutes(v)),
    setSecond: (date, v) => withTime(date, (d) => d.setSeconds(v)),
    setMillisecond: (date, v) => withTime(date, (d) => d.setMilliseconds(v)),

    isAfter: (a, b) => a.getTime() > b.getTime(),
    isValidate: (date) => date instanceof Date && !Number.isNaN(date.getTime()) && inRange(date),

    locale: {
      getWeekFirstDay: () => 0, // Sunday
      getWeekFirstDate: (_locale, date) => withTime(date, (d) => d.setDate(d.getDate() - d.getDay())),
      getWeek: (_locale, date) => weekOfYear(date),
      getShortWeekDays: (locale) =>
        isNe(locale) ? WEEKDAYS_SHORT_NE : WEEKDAYS_EN.map((w) => w.slice(0, 2)),
      getShortMonths: (locale) =>
        isNe(locale) ? cal.monthsNe : cal.monthsEn.map((m) => m.slice(0, 3)),
      format: (locale, date, format) => (config.isValidate(date) ? formatDate(cal, date, format, locale) : ""),
      parse: (locale, text, formats) => {
        for (const format of formats) {
          const parsed = parseDate(cal, text, format, locale);
          if (parsed) return parsed;
        }
        return null;
      },
    },
  };
  return config;
}

export const bsGenerateConfig = createGenerateConfig(bsCalendar);
export const adGenerateConfig = createGenerateConfig(adCalendar);
export default bsGenerateConfig;
