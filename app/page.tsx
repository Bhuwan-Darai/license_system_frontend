"use client";
import { Button, DatePicker } from "antd";
import NepaliDate from "nepali-date-converter";

export default function Home() {
  const handleDateChange = (date: any, dateString: any) => {
    // Convert English date to Nepali
    const nepaliDate = new NepaliDate(date.toDate());
    console.log("Nepali Date:", nepaliDate.format("YYYY-MM-DD"));
  };
  return (
    <div className="App">
      <Button type="primary">Button</Button>
      <DatePicker onChange={handleDateChange} />;
    </div>
  );
}
