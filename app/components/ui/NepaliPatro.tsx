import React, { useMemo, useState, useCallback } from "react";
import { Button, Select, Typography, Space } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import NepaliDate from "nepali-date-converter";
// npm install antd @ant-design/icons nepali-date-converter

const { Text } = Typography;

/* ---------- constants ---------- */

const BS_MONTHS_NP = [
  "बैशाख",
  "जेठ",
  "असार",
  "श्रावण",
  "भदौ",
  "असोज",
  "कार्तिक",
  "मंसिर",
  "पुष",
  "माघ",
  "फागुन",
  "चैत",
];

const AD_MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAYS = [
  { np: "आइतवार", en: "Sunday" },
  { np: "सोमवार", en: "Monday" },
  { np: "मंगलवार", en: "Tuesday" },
  { np: "बुधवार", en: "Wednesday" },
  { np: "बिहिवार", en: "Thursday" },
  { np: "शुक्रवार", en: "Friday" },
  { np: "शनिवार", en: "Saturday" },
];

const DEVANAGARI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

function toDevanagari(num: number): string {
  return String(num)
    .split("")
    .map((ch) => DEVANAGARI_DIGITS[Number(ch)] ?? ch)
    .join("");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Relies on the library's JS-Date-style overflow handling (day 0 of month+1
// resolves to the last day of month). Worth a quick sanity check against
// your installed version if exactness matters for your use case.
function daysInBsMonth(year: number, month: number): number {
  return new NepaliDate(year, month + 1, 0).getDate();
}

/* ---------- types ---------- */

export interface NepaliDateResult {
  ad: { date: Date; iso: string };
  bs: {
    year: number;
    month: number; // 1-indexed
    day: number;
    monthName: string;
    formatted: string;
  };
}

export interface NepaliDateSelectorProps {
  /** Controlled AD date */
  value?: Date;
  /** Initial AD date when uncontrolled (defaults to today) */
  defaultDate?: Date;
  /** Fires on every date selection with both AD and BS representations */
  onChange?: (result: NepaliDateResult) => void;
  /**
   * Optional hook to render tithi/festival text per day, e.g. backed by
   * your own panchang data source. Not included by default.
   */
  getDayNote?: (
    bsYear: number,
    bsMonth: number,
    bsDay: number,
  ) => string | undefined;
}

/* ---------- component ---------- */

export default function NepaliDateSelector({
  value,
  defaultDate,
  onChange,
  getDayNote,
}: NepaliDateSelectorProps) {
  const initial = useMemo(
    () => new NepaliDate(value || defaultDate || new Date()),
    [],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const [viewYear, setViewYear] = useState(initial.getYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth()); // 0-indexed
  const [selected, setSelected] = useState<{
    year: number;
    month: number;
    day: number;
  }>({
    year: initial.getYear(),
    month: initial.getMonth(),
    day: initial.getDate(),
  });

  const totalDays = daysInBsMonth(viewYear, viewMonth);
  const firstWeekday = new NepaliDate(viewYear, viewMonth, 1).getDay();

  const adRangeLabel = useMemo(() => {
    const firstAd = new NepaliDate(viewYear, viewMonth, 1).toJsDate();
    const lastAd = new NepaliDate(viewYear, viewMonth, totalDays).toJsDate();
    const startLabel = `${AD_MONTHS_SHORT[firstAd.getMonth()]}`;
    const endLabel = `${AD_MONTHS_SHORT[lastAd.getMonth()]}`;
    const yearLabel = lastAd.getFullYear();
    return startLabel === endLabel
      ? `${startLabel} ${yearLabel}`
      : `${startLabel}/${endLabel} ${yearLabel}`;
  }, [viewYear, viewMonth, totalDays]);

  const cells = useMemo(() => {
    const arr: Array<{ day: number; adDay: number } | null> = [];
    for (let i = 0; i < firstWeekday; i++) arr.push(null);
    for (let d = 1; d <= totalDays; d++) {
      const ad = new NepaliDate(viewYear, viewMonth, d).toJsDate();
      arr.push({ day: d, adDay: ad.getDate() });
    }
    return arr;
  }, [viewYear, viewMonth, totalDays, firstWeekday]);

  const goToMonth = useCallback((year: number, monthIndex: number) => {
    // Let the library normalize any overflow (e.g. month -1 or 12).
    const normalized = new NepaliDate(year, monthIndex, 1);
    setViewYear(normalized.getYear());
    setViewMonth(normalized.getMonth());
  }, []);

  const handlePrev = () => goToMonth(viewYear, viewMonth - 1);
  const handleNext = () => goToMonth(viewYear, viewMonth + 1);

  const handleSelect = (day: number) => {
    setSelected({ year: viewYear, month: viewMonth, day });
    const bsDate = new NepaliDate(viewYear, viewMonth, day);
    const adDate = bsDate.toJsDate();
    onChange?.({
      ad: {
        date: adDate,
        iso: `${adDate.getFullYear()}-${pad(adDate.getMonth() + 1)}-${pad(adDate.getDate())}`,
      },
      bs: {
        year: viewYear,
        month: viewMonth + 1,
        day,
        monthName: BS_MONTHS_NP[viewMonth],
        formatted: `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`,
      },
    });
  };

  const isSelected = (day: number) =>
    selected.year === viewYear &&
    selected.month === viewMonth &&
    selected.day === day;

  const yearOptions = useMemo(() => {
    const base = initial.getYear();
    const range: number[] = [];
    for (let y = base - 10; y <= base + 10; y++) range.push(y);
    return range;
  }, [initial]);

  return (
    <div style={styles.wrapper}>
      {/* Header bar */}
      <div style={styles.header}>
        <Space size={4}>
          <Text style={styles.headerText}>{toDevanagari(viewYear)}</Text>
          <Text style={styles.headerText}>{BS_MONTHS_NP[viewMonth]}</Text>
        </Space>
        <Text style={styles.headerText}>{adRangeLabel}</Text>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <Button icon={<LeftOutlined />} onClick={handlePrev} size="small" />
        <Space size={8}>
          <Select
            size="small"
            value={viewMonth}
            style={{ width: 100 }}
            options={BS_MONTHS_NP.map((name, idx) => ({
              label: name,
              value: idx,
            }))}
            onChange={(m) => goToMonth(viewYear, m)}
          />
          <Select
            size="small"
            value={viewYear}
            style={{ width: 90 }}
            options={yearOptions.map((y) => ({
              label: toDevanagari(y),
              value: y,
            }))}
            onChange={(y) => goToMonth(y, viewMonth)}
          />
        </Space>
        <Button icon={<RightOutlined />} onClick={handleNext} size="small" />
      </div>

      {/* Weekday header */}
      <div style={styles.grid}>
        {WEEKDAYS.map((w) => (
          <div key={w.en} style={styles.weekdayCell}>
            <Text style={styles.weekdayNp}>{w.np}</Text>
            <Text style={styles.weekdayEn}>{w.en}</Text>
          </div>
        ))}

        {/* Day cells */}
        {cells.map((cell, idx) =>
          cell === null ? (
            <div key={`blank-${idx}`} style={styles.dayCellEmpty} />
          ) : (
            <button
              key={cell.day}
              onClick={() => handleSelect(cell.day)}
              style={{
                ...styles.dayCell,
                ...(isSelected(cell.day) ? styles.dayCellSelected : {}),
              }}
            >
              <span style={styles.adDay}>{cell.adDay}</span>
              <span
                style={{
                  ...styles.bsDay,
                  color: isSelected(cell.day) ? "#fff" : "#a12b2b",
                }}
              >
                {toDevanagari(cell.day)}
              </span>
              {getDayNote?.(viewYear, viewMonth + 1, cell.day) && (
                <span style={styles.note}>
                  {getDayNote(viewYear, viewMonth + 1, cell.day)}
                </span>
              )}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

/* ---------- styles ---------- */

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    border: "1px solid #e5e1d8",
    borderRadius: 10,
    overflow: "hidden",
    maxWidth: 820,
    background: "#fff",
  },
  header: {
    background: "#c0392b",
    color: "#fff",
    padding: "10px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: { color: "#fff", fontWeight: 700, fontSize: 16 },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    borderBottom: "1px solid #eee",
    background: "#fafafa",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
  },
  weekdayCell: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "8px 4px",
    background: "#f5f5f5",
    borderBottom: "1px solid #eee",
    borderRight: "1px solid #f0f0f0",
  },
  weekdayNp: { fontSize: 13, fontWeight: 700, color: "#333" },
  weekdayEn: { fontSize: 11, color: "#999" },
  dayCell: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minHeight: 78,
    border: "none",
    borderRight: "1px solid #f0f0f0",
    borderBottom: "1px solid #f0f0f0",
    background: "#fff",
    cursor: "pointer",
    padding: "6px 4px",
  },
  dayCellEmpty: {
    minHeight: 78,
    background: "#fafafa",
    borderRight: "1px solid #f0f0f0",
    borderBottom: "1px solid #f0f0f0",
  },
  dayCellSelected: {
    background: "#a12b2b",
  },
  adDay: { fontSize: 11, color: "#999" },
  bsDay: { fontSize: 22, fontWeight: 700 },
  note: { fontSize: 10, color: "#777", textAlign: "center", lineHeight: 1.2 },
};
