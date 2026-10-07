// components/dashboard/DashboardLayout.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "../components/Dashboard/Sidebar";

import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import Header from "../components/Dashboard/Header";
import Footer from "../components/Dashboard/Footer";
import { ProtectedRoute } from "../components/Route/ProtectedRoute";
import { RouteGuard } from "../components/Route/RouteGuard";
import { useAuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { BreadcrumbProvider } from "../context/BreadcrumbContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  const pathname = usePathname();
  const { theme } = useTheme();

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
  const textPrimary = isThemeLight ? "#131b2e" : "#eee8dd";
  const textSecondary = isThemeLight ? "#6b7280" : "#9ca3af";
  const hoverBg = isThemeLight ? "#e0d9cb" : "#1c2740";

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          user={user}
        />
        <div className="flex-1 flex flex-col">
          <Header user={user} collapsed={collapsed} />
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <LoadingSkeleton type={getSkeletonType()} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <BreadcrumbProvider>
    <div className="flex h-screen">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} user={user} />
      <div className="flex-1 flex flex-col">
        <Header user={user} collapsed={collapsed} />
        <main style={{
        backgroundColor: background,
        color : textPrimary
      }} className="flex-1 overflow-y-auto p-6">
          <ProtectedRoute>
            <RouteGuard>{children}</RouteGuard>
          </ProtectedRoute>
        </main>
        <Footer collapsed={collapsed} />
      </div>
    </div>
    </BreadcrumbProvider>
  );
};

export default DashboardLayout;
