"use client";

import React from "react";
import { Avatar, Badge, Dropdown, Space, Button, Breadcrumb } from "antd";
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@/app/hooks/usePermissions";
import { useAuthContext } from "@/app/context/AuthContext";
import { useTheme } from "@/app/context/ThemeContext";
import { useBreadcrumbExtra } from "@/app/context/BreadcrumbContext";
import { Route, routes } from "@/config/route";

type Crumb = { label: string; path: string };

/** Sidebar entry for a path (with its parent group), longest matching path wins. */
const findCrumbs = (pathname: string): Crumb[] => {
  let best: { crumbs: Crumb[]; length: number } | null = null;

  const visit = (items: Route[], parents: Crumb[]) => {
    for (const item of items) {
      if (item.children?.length) {
        visit(item.children, [
          ...parents,
          { label: item.label, path: item.path },
        ]);
        continue;
      }
      const matches =
        pathname === item.path || pathname.startsWith(`${item.path}/`);
      if (matches && (!best || item.path.length > best.length)) {
        best = {
          crumbs: [...parents, { label: item.label, path: item.path }],
          length: item.path.length,
        };
      }
    }
  };
  visit(routes, []);

  return (best as { crumbs: Crumb[] } | null)?.crumbs ?? [];
};

interface HeaderProps {
  user: User | null;
  collapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, collapsed }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { label: extraLabel, hasBack, goBack } = useBreadcrumbExtra();
  const { logout } = useAuthContext();
  const { setTheme, theme } = useTheme();
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => router.push("/dashboard/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => router.push("/dashboard/settings"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: async () => {
        await logout();
      },
      danger: true,
    },
  ];

  const notificationItems = [
    {
      key: "1",
      label: "New user registered",
      description: "John Doe created an account",
    },
    {
      key: "2",
      label: "Order #1234 completed",
      description: "Order has been delivered",
    },
    {
      key: "3",
      label: "System update",
      description: "New version 2.0.1 available",
    },
  ];

  const isThemeLight = theme === "light";
  const headerBg = isThemeLight ? "#eee8dd" : "#131b2e";
  const textColor = isThemeLight ? "#131b2e" : "#ece6da";
  const hoverColor = isThemeLight ? "#eee8dd" : "#131b2e";
  const borderColor = isThemeLight ? "#d1d5db" : "#1e3a5f";

  const crumbs = findCrumbs(pathname ?? "");
  const breadcrumbItems = [
    { title: <Link href="/dashboard">Home</Link> },
    ...crumbs.map((crumb, index) => {
      const isLast = index === crumbs.length - 1 && !extraLabel;
      if (isLast) return { title: crumb.label };
      // a sub-view (e.g. "Add Carousel") goes back to the page's main view in place
      if (extraLabel && index === crumbs.length - 1 && hasBack) {
        return {
          title: (
            <a
              onClick={(e) => {
                e.preventDefault();
                goBack?.();
              }}
              href={crumb.path}
            >
              {crumb.label}
            </a>
          ),
        };
      }
      return { title: <Link href={crumb.path}>{crumb.label}</Link> };
    }),
    ...(extraLabel ? [{ title: extraLabel }] : []),
  ];

  return (
    <header
      className={`h-16 border-b flex items-center justify-between px-6 transition-all duration-300 `}
      style={{
        backgroundColor: headerBg,
        borderBottomColor: borderColor,
        color: textColor,
      }}
    >
      <div className="flex items-center gap-4">
        <Breadcrumb items={breadcrumbItems} style={{ color: textColor }} />
      </div>

      <div className="flex items-center gap-4">
        {isThemeLight ? (
          <Button onClick={() => setTheme("dark")}>
            <MoonOutlined />
            Dark
          </Button>
        ) : (
          <Button onClick={() => setTheme("light")}>
            <SunOutlined />
            Light
          </Button>
        )}
        <Button
          type="text"
          icon={
            isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
          }
          onClick={toggleFullscreen}
          style={{ color: textColor }}
        />
        <Dropdown
          menu={{ items: notificationItems }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Badge count={5} size="small" className="cursor-pointer">
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ color: textColor }}
            />
          </Badge>
        </Dropdown>

        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Space
            className="cursor-pointer px-3 py-1 rounded-lg transition-colors"
            style={{ color: textColor }}
          >
            <Avatar
              size="default"
              icon={<UserOutlined />}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            />
            <span
              className="text-sm font-medium hidden sm:inline"
              style={{ color: textColor }}
            >
              {user?.name || "User"}
            </span>
          </Space>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
