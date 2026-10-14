// components/dashboard/DashboardLayout.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ConfigProvider, theme as antdTheme } from "antd";
import Sidebar from "../components/Dashboard/Sidebar";

import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import Header from "../components/Dashboard/Header";
import Footer from "../components/Dashboard/Footer";
import { ProtectedRoute } from "../components/Route/ProtectedRoute";
import { RouteGuard } from "../components/Route/RouteGuard";
import { useAuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { BreadcrumbProvider } from "../context/BreadcrumbContext";

// Text colour on the dark dashboard: a light white instead of the beige it had.
const DARK_TEXT = "#f5f5f5";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  const pathname = usePathname();
  const { theme, setTheme, setFontSize } = useTheme();

  // Apply the preferences saved on the account (set in Settings).
  const savedTheme = user?.theme;
  const savedFontSize = user?.font_size;
  useEffect(() => {
    if (savedTheme) setTheme(savedTheme);
  }, [savedTheme, setTheme]);
  useEffect(() => {
    if (savedFontSize) setFontSize(savedFontSize);
  }, [savedFontSize, setFontSize]);

  // Language is stored per user; the page text is not translated yet, so it
  // only sets the document language for now.
  const savedLanguage = user?.language;
  useEffect(() => {
    if (savedLanguage) document.documentElement.lang = savedLanguage;
  }, [savedLanguage]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Determine skeleton type based on route
  const getSkeletonType = () => {
    if (pathname?.includes("/users") || pathname?.includes("/orders")) {
      return "table";
    }
    if (pathname?.includes("/add") || pathname?.includes("/settings")) {
      return "form";
    }
    if (pathname?.includes("/analytics") || pathname?.includes("/reports")) {
      return "detail";
    }
    return "dashboard";
  };

  const isThemeLight = theme === "light" ? true : false;

  const background = isThemeLight ? "#eee8dd" : "#131b2e";
  const textPrimary = isThemeLight ? "#131b2e" : DARK_TEXT;
  const textSecondary = isThemeLight ? "#6b7280" : "#9ca3af";
  const hoverBg = isThemeLight ? "#e0d9cb" : "#1c2740";

  // In dark mode every antd component (breadcrumb, tables, forms, headings)
  // gets light white text; light mode keeps antd's defaults.
  const antdConfig = isThemeLight
    ? undefined
    : {
        algorithm: antdTheme.darkAlgorithm,
        token: {
          colorText: DARK_TEXT,
          colorTextHeading: DARK_TEXT,
          colorTextLabel: DARK_TEXT,
          colorTextSecondary: "rgba(245, 245, 245, 0.75)",
          colorTextDescription: "rgba(245, 245, 245, 0.65)",
          colorTextPlaceholder: "rgba(245, 245, 245, 0.45)",
          colorIcon: "rgba(245, 245, 245, 0.75)",
        },
        components: {
          Breadcrumb: {
            itemColor: "rgba(245, 245, 245, 0.75)",
            lastItemColor: DARK_TEXT,
            linkColor: "rgba(245, 245, 245, 0.75)",
            linkHoverColor: "#ffffff",
            separatorColor: "rgba(245, 245, 245, 0.5)",
          },
        },
      };

  if (loading) {
    return (
      <ConfigProvider theme={antdConfig}>
      <div className="flex h-screen">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          user={user}
        />
        <div className="flex-1 min-w-0 flex flex-col">
          <Header user={user} collapsed={collapsed} />
          <main
            className="flex-1 overflow-y-auto"
            style={{ backgroundColor: background, color: textPrimary }}
          >
            <LoadingSkeleton type={getSkeletonType()} />
          </main>
        </div>
      </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={antdConfig}>
    <BreadcrumbProvider>
    <div className="flex h-screen">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} user={user} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header user={user} collapsed={collapsed} />
        <main style={{
        backgroundColor: background,
        color : textPrimary
      }} className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-6">
          <ProtectedRoute>
            <RouteGuard>{children}</RouteGuard>
          </ProtectedRoute>
        </main>
        <Footer collapsed={collapsed} />
      </div>
    </div>
    </BreadcrumbProvider>
    </ConfigProvider>
  );
};

export default DashboardLayout;
