"use client";

import React, { useMemo, useState } from "react";
import { Segmented } from "antd";
import generatePicker from "antd/es/date-picker/generatePicker";
import type { PickerProps, PickerLocale } from "antd/es/date-picker/generatePicker";
import enUS from "antd/es/date-picker/locale/en_US";
import neCalendarLocale from "@rc-component/picker/locale/ne_NP";
import { adGenerateConfig, bsGenerateConfig, toBs, toNeDigits, BS_MONTHS_EN } from "./generateConfig";

/**
 * antd DatePicker on the Bikram Sambat (Nepali) calendar. Values are plain JS
 * `Date`s (the real AD instant).
 *
 *   <NepaliDatePicker />            // BS calendar, Date value
 *   <NepaliDatePicker.RangePicker />
 *   <EnglishDatePicker />           // same API on the Gregorian calendar
 */
export const NepaliDatePicker = generatePicker<Date>(bsGenerateConfig);
export const EnglishDatePicker = generatePicker<Date>(adGenerateConfig);

/* ---------- value helpers ---------- */

export type CalendarMode = "ne" | "en";

/** What the field stores: the same day in both calendars. */
export interface NepaliDateValue {
  /** English / Gregorian date, "YYYY-MM-DD" (this is what the backend stores). */
  ad: string;
  /** Nepali / Bikram Sambat date, "YYYY-MM-DD" with ASCII digits. Empty if outside BS 2000-2090. */
  bs: string;
  /** Same BS date in Devanagari digits, e.g. "२०८२-०१-०१". */
  bsNe: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "YYYY-MM-DD" (AD) in local time. */
export function toAdString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Accepts a NepaliDateValue, "YYYY-MM-DD" / ISO string (AD), or a Date. Null when invalid. */
export function parseAd(value: NepaliDateValue | string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const str = typeof value === "string" ? value : value.ad;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(str ?? "");
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Build the both-calendars value from a Date. */
export function toNepaliDateValue(date: Date): NepaliDateValue {
  let bs = "";
  try {
    const { year, month, day } = toBs(date);
    bs = `${String(year).padStart(4, "0")}-${pad(month + 1)}-${pad(day)}`;
  } catch {
    /* outside the supported BS range */
  }
  return { ad: toAdString(date), bs, bsNe: toNeDigits(bs) };
}

/** BS display string for an AD value, e.g. "2082-01-01" or "1 Baisakh 2082". Empty when invalid. */
export function formatBsDate(
  value: NepaliDateValue | string | Date | null | undefined,
  withMonthName = false,
): string {
  const d = parseAd(value);
  if (!d) return "";
  try {
    const { year, month, day } = toBs(d);
    return withMonthName ? `${day} ${BS_MONTHS_EN[month]} ${year}` : `${year}-${pad(month + 1)}-${pad(day)}`;
  } catch {
    return "";
  }
}

/* ---------- locales ---------- */

const enLocale = enUS as PickerLocale;
const neLocale: PickerLocale = {
  ...enUS,
  lang: {
    ...enUS.lang,
    ...neCalendarLocale,
    placeholder: "मिति छान्नुहोस्",
    yearPlaceholder: "वर्ष छान्नुहोस्",
    monthPlaceholder: "महिना छान्नुहोस्",
    rangePlaceholder: ["सुरु मिति", "अन्तिम मिति"],
  },
} as PickerLocale;

/* ---------- Form-friendly field ---------- */

type BasePickerProps = Omit<
  PickerProps<Date>,
  "value" | "defaultValue" | "onChange" | "picker" | "multiple" | "locale" | "mode" | "open" | "onOpenChange"
>;

export interface NepaliDateFieldProps extends BasePickerProps {
  /** Stored value. Also accepts an AD "YYYY-MM-DD" string or a Date as initial value. */
  value?: NepaliDateValue | string | Date | null;
  /** Called with both the AD and BS date (or null when cleared). */
  onChange?: (value: NepaliDateValue | null, date: Date | null) => void;
  /** Initial calendar: "ne" = Nepali (BS, Devanagari), "en" = English (AD). Default "ne". */
  defaultCalendar?: CalendarMode;
  /** Controlled calendar mode. */
  calendar?: CalendarMode;
  onSwitchCalendar?: (mode: CalendarMode) => void;
  /** Display format. Default "YYYY-MM-DD". */
  format?: string;
}

/**
 * Drop-in replacement for `<DatePicker />` inside `<Form.Item>`:
 *
 *   <Form.Item name="dob" label="Date of birth" rules={[{ required: true }]}>
 *     <NepaliDateField />
 *   </Form.Item>
 *
 * - A NEP / ENG switch in the popup footer swaps the calendar.
 *   NEP: Bikram Sambat calendar, Nepali month/day names and digits.
 *   ENG: Gregorian calendar in English.
 * - The form value is `{ ad, bs, bsNe }`, so you always get both dates; send
 *   `value.ad` to the backend.
 */
export function NepaliDateField({
  value,
  onChange,
  defaultCalendar = "ne",
  calendar: calendarProp,
  onSwitchCalendar,
  format = "YYYY-MM-DD",
  placeholder,
  style,
  renderExtraFooter,
  ...rest
}: NepaliDateFieldProps) {
  const [innerMode, setInnerMode] = useState<CalendarMode>(defaultCalendar);
  const [open, setOpen] = useState(false);
  const mode = calendarProp ?? innerMode;
  const dateValue = useMemo(() => parseAd(value), [value]);

  const Picker = mode === "ne" ? NepaliDatePicker : EnglishDatePicker;

  const switchMode = (next: CalendarMode) => {
    if (calendarProp === undefined) setInnerMode(next);
    onSwitchCalendar?.(next);
  };

  return (
    <Picker
      allowClear
      format={format}
      locale={mode === "ne" ? neLocale : enLocale}
      placeholder={placeholder ?? (mode === "ne" ? neLocale.lang.placeholder : "YYYY-MM-DD")}
      style={{ width: "100%", ...style }}
      {...rest}
      open={open}
      onOpenChange={setOpen}
      value={dateValue}
      onChange={(d: Date | null) => onChange?.(d ? toNepaliDateValue(d) : null, d)}
      renderExtraFooter={(pickerMode) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "6px 0" }}>
          {renderExtraFooter?.(pickerMode)}
          <Segmented<CalendarMode>
            size="small"
            value={mode}
            onChange={switchMode}
            options={[
              { label: "NEP", value: "ne" },
              { label: "ENG", value: "en" },
            ]}
          />
        </div>
      )}
    />
  );
}

export default NepaliDateField;
