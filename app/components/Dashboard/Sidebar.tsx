"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Menu, Input, Avatar } from "antd";
import type { MenuProps } from "antd";
import { useRouter, usePathname } from "next/navigation";
import {
  SearchOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { usePermissions, User } from "@/app/hooks/usePermissions";
import { routes } from "@/config/route";
import { useTheme } from "@/app/context/ThemeContext";

type MenuItem = Required<MenuProps>["items"][number];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, user }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const { filterRoutes, can } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRoutes, setFilteredRoutes] = useState(routes);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Update selected keys based on pathname
  useEffect(() => {
    if (pathname) {
      setSelectedKeys([pathname]);
    }
  }, [pathname]);

  // Filter routes based on permissions
  useEffect(() => {
    const filtered = filterRoutes(routes);
    setFilteredRoutes(filtered);
  }, [filterRoutes]);

  const findSelectedPath = (
    items: any[],
    currentPath: string,
    parents: string[] = [],
  ): { key: string; parentKeys: string[] } | null => {
    let bestMatch: {
      key: string;
      parentKeys: string[];
      matchLength: number;
    } | null = null;

    for (const item of items) {
      if (item.children && item.children.length > 0) {
        const childResult = findSelectedPath(item.children, currentPath, [
          ...parents,
          item.key,
        ]);
        if (childResult) return childResult;
      }

      if (item.path) {
        if (item.path === currentPath) {
          return { key: item.key, parentKeys: parents };
        }
        if (
          currentPath.startsWith(`${item.path}/`) &&
          (!bestMatch || item.path.length > bestMatch.matchLength)
        ) {
          bestMatch = {
            key: item.key,
            parentKeys: parents,
            matchLength: item.path.length,
          };
        }
      }
    }

    return bestMatch
      ? { key: bestMatch.key, parentKeys: bestMatch.parentKeys }
      : null;
  };

  useEffect(() => {
    if (!pathname) return;

    const match = findSelectedPath(filteredRoutes, pathname);
    if (match) {
      setSelectedKeys([match.key]);
      setOpenKeys((prev) =>
        Array.from(new Set([...prev, ...match.parentKeys])),
      );
    } else {
      setSelectedKeys([pathname]);
    }
  }, [pathname, filteredRoutes]);

  const buildMenuItems = (items: any[]): MenuItem[] => {
    return items
      .map((item) => {
        if (item.permission && !can(item.permission)) {
          return null;
        }

        if (item.children && item.children.length > 0) {
          const children = buildMenuItems(item.children);
          if (children.length === 0) return null;

          return {
            key: item.key,
            icon: item.icon,
            label: item.label,
            children: children,
          } as MenuItem;
        }

        return {
          key: item.key,
          icon: item.icon,
          label: item.label,
          onClick: () => {
            if (item.path) {
              router.push(item.path);
            }
          },
        } as MenuItem;
      })
      .filter((item): item is MenuItem => item !== null);
  };

  const filterMenuItemsBySearch = (items: any[], search: string): any[] => {
    if (!search) return items;

    return items
      .map((item) => {
        const matchesSearch = item.label
          .toLowerCase()
          .includes(search.toLowerCase());

        if (item.children) {
          const childMatches = filterMenuItemsBySearch(item.children, search);
          if (matchesSearch || childMatches.length > 0) {
            return {
              ...item,
              children: childMatches.length > 0 ? childMatches : item.children,
            };
          }
          return null;
        }

        return matchesSearch ? item : null;
      })
      .filter(Boolean);
  };

  const menuItems = useMemo(() => {
    let items = filteredRoutes;

    if (searchTerm) {
      items = filterMenuItemsBySearch(items, searchTerm);

      const searchKeys: string[] = [];
      items.forEach((route: any) => {
        if (route.children && route.children.length > 0) {
          searchKeys.push(route.key);
        }
      });
      setOpenKeys((prev) => Array.from(new Set([...prev, ...searchKeys])));
    }

    return buildMenuItems(items);
  }, [filteredRoutes, searchTerm, can]);

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    setSelectedKeys([e.key]);
  };

  const handleOpenChange: MenuProps["onOpenChange"] = (keys) => {
    setOpenKeys(keys);
  };

  const isThemeLight = theme === "light";

  // Theme tokens
  const sidebarBg = isThemeLight ? "#eee8dd" : "#131b2e";
  const borderColor = isThemeLight ? "#d1d5db" : "#1e3a5f";
  const textPrimary = isThemeLight ? "#1f2937" : "#f5f5f5";
  const textSecondary = isThemeLight ? "#6b7280" : "#9ca3af";
  const hoverBg = isThemeLight ? "#e0d9cb" : "#1c2740";
  const activeBg = isThemeLight ? "#fde2e2" : "rgba(239, 68, 68, 0.22)";
  const activeText = isThemeLight ? "#dc2626" : "#fca5a5";
  const inputBg = isThemeLight ? "#ffffff" : "#0f1a2e";
  const inputBorder = isThemeLight ? "#d1d5db" : "#1e3a5f";
  const inputText = isThemeLight ? "#1f2937" : "#f5f5f5";

  return (
    <div
      className={`h-screen flex flex-col border-r transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
      style={{
        backgroundColor: sidebarBg,
        borderRightColor: borderColor,
      }}
    >
      {/* Header / Logo */}
      <div
        className="flex items-center justify-between h-16 px-4 border-b flex-shrink-0"
        style={{ borderBottomColor: borderColor }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden m-4">
            <div className="border-1 bg-ly-panel-ink rounded-xl sm:rounded-2xl w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center text-[#7A1F2B] p-2">
              <span className="text-xl sm:text-2xl font-bold">LY</span>
            </div>
            <span
              className="text-lg font-bold whitespace-nowrap"
              style={{ color: textPrimary }}
            >
              Likhit Yatra
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg transition-colors flex-shrink-0"
          style={{ color: textPrimary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = hoverBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div
          className="p-4 border-b flex-shrink-0"
          style={{ borderBottomColor: borderColor }}
        >
          <Input
            placeholder="Search menu..."
            prefix={<SearchOutlined style={{ color: textSecondary }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg"
            style={{
              backgroundColor: inputBg,
              borderColor: inputBorder,
              color: inputText,
            }}
            allowClear
          />
        </div>
      )}

      {/* Menu */}
      <style>{`
        .ly-sidebar-menu.ant-menu .ant-menu-item-selected,
        .ly-sidebar-menu.ant-menu .ant-menu-item-selected:hover {
          background-color: ${activeBg} !important;
          color: ${activeText} !important;
        }
        .ly-sidebar-menu.ant-menu .ant-menu-submenu-selected > .ant-menu-submenu-title,
        .ly-sidebar-menu.ant-menu .ant-menu-submenu-selected > .ant-menu-submenu-title .anticon,
        .ly-sidebar-menu.ant-menu .ant-menu-submenu-selected > .ant-menu-submenu-title .ant-menu-submenu-arrow {
          color: ${activeText} !important;
        }
        .ly-sidebar-menu.ant-menu .ant-menu-item-selected .anticon,
        .ly-sidebar-menu.ant-menu .ant-menu-item-selected a {
          color: ${activeText} !important;
        }
      `}</style>
      <div className="flex-1 overflow-y-auto py-4">
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          onClick={handleMenuClick}
          inlineCollapsed={collapsed}
          items={menuItems}
          className="ly-sidebar-menu border-r-0"
          style={{
            backgroundColor: "transparent",
            color: textPrimary,
          }}
          theme={isThemeLight ? "light" : "dark"}
        />
      </div>

      {/* User footer */}
      {!collapsed && (
        <div
          className="p-4 border-t flex-shrink-0"
          style={{ borderTopColor: borderColor }}
        >
          <div className="flex items-center gap-3">
            <Avatar
              size="default"
              icon={<UserOutlined />}
              className="bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: textPrimary }}
              >
                {user?.name || "User"}
              </p>
              <p className="text-xs truncate" style={{ color: textSecondary }}>
                {user?.role_name || user?.role || "Guest"}
              </p>
            </div>
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: "#39ff14",
                boxShadow: "0 0 6px #39ff14, 0 0 12px #39ff14",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
