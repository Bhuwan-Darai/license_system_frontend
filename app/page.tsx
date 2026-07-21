"use client";
import { Button, DatePicker } from "antd";
import NepaliDate from "nepali-date-converter";
import HamroPatroCalendar from "./components/ui/NepaliPatro";

export default function Page() {
  const handleDateChange = (date: any, dateString: any) => {
    // Convert English date to Nepali
    const nepaliDate = new NepaliDate(date.toDate());
    console.log("Nepali Date:", nepaliDate.format("YYYY-MM-DD"));
  };
  return (
    <div className="flex justify-center items-center gap-4">
      <Button type="primary">Button</Button>
      <DatePicker onChange={handleDateChange} />
      <HamroPatroCalendar />
    </div>
  );
}
