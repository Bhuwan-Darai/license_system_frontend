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
import { PERM } from "@/config/permissions";
import { HELP_TYPE_OPTIONS, useQueryInquiries } from "./Inquiry/useInquiry";

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
  const { logout, isAllowed } = useAuthContext();

  // new website inquiries, refreshed every 30s; only for staff who may view them
  const canSeeInquiries = isAllowed(PERM.INQUIRY.LIST);
  const { data: newInquiries } = useQueryInquiries(
    { page: 1, pageSize: 5, search: "", status: "NEW" },
    canSeeInquiries,
    30_000,
  );
  const newInquiryCount = newInquiries?.pagination?.total ?? 0;
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

  const timeAgo = (iso: string) => {
    const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    if (mins < 1440) return `${Math.round(mins / 60)} h ago`;
    return `${Math.round(mins / 1440)} d ago`;
  };

  // text only: names and messages come from the public form, never rendered as HTML
  const notificationItems = [
    ...(newInquiries?.data ?? []).map((q) => ({
      key: q.inquiry_id,
      label: (
        <div style={{ maxWidth: 280 }}>
          <div>
            <b>{q.name}</b>{" "}
            <span style={{ opacity: 0.6, fontSize: 12 }}>
              {HELP_TYPE_OPTIONS.find((o) => o.value === q.help_type)?.label ?? q.help_type} · {timeAgo(q.created_at)}
            </span>
          </div>
          <div style={{ opacity: 0.75, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {q.message}
          </div>
        </div>
      ),
      onClick: () => router.push("/dashboard/inquiry"),
    })),
    ...(newInquiryCount === 0
      ? [{ key: "empty", label: "No new notifications", disabled: true }]
      : []),
    ...(canSeeInquiries
      ? [
          { type: "divider" as const },
          {
            key: "all-inquiries",
            label: newInquiryCount > 5 ? `View all ${newInquiryCount} new inquiries` : "Open inquiries",
            onClick: () => router.push("/dashboard/inquiry"),
          },
        ]
      : []),
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
          <Badge count={newInquiryCount} size="small" className="cursor-pointer">
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
