// components/dashboard/DashboardLayout.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { User } from "../hooks/usePermissions";
import Sidebar from "../components/Dashboard/Sidebar";

import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import Header from "../components/Dashboard/Header";
import Footer from "../components/Dashboard/Footer";

// Mock user data for demo
const mockUser: User = {
  id: "1",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
  permissions: [],
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user] = useState<User | null>(mockUser);
  const pathname = usePathname();

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
    <div className="flex h-screen">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} user={user} />
      <div className="flex-1 flex flex-col">
        <Header user={user} collapsed={collapsed} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
        <Footer collapsed={collapsed} />
      </div>
    </div>
  );
};

export default DashboardLayout;
