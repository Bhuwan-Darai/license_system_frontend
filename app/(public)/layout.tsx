import React from "react";
import Header from "@/app/components/LandingPage/Header";
import Footer from "@/app/components/LandingPage/Footer";

// The website header and footer live here, not in each page, so they stay on
// screen while a page streams in (see the loading.tsx next to each page).
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-ly-bg">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
