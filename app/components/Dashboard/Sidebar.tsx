// components/dashboard/Sidebar.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Menu, Input, Badge } from "antd";
import type { MenuProps } from "antd";
import { useRouter, usePathname } from "next/navigation";
import {
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { usePermissions, User } from "@/app/hooks/usePermissions";
import { routes } from "@/config/route";

type MenuItem = Required<MenuProps>["items"][number];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, user }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { filterRoutes, can } = usePermissions(user);
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
  }, [user]);

  // Build menu items from routes
  const buildMenuItems = (items: any[]): MenuItem[] => {
    return items
      .map((item) => {
        if (item.permission && !can(item.permission)) {
          return null;
        }

        // If item has children, recursively build them
        if (item.children && item.children.length > 0) {
          const children = buildMenuItems(item.children);
          if (children.length === 0) return null;

          return {
            key: item.key,
            icon: item.icon,
            label: item.label,
            children: children,
            // Remove onTitleClick for parent items with children
          } as MenuItem;
        }

        // Leaf node: redirect on click
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

  // Filter menu items based on search
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

  // Get menu items with search filter
  const menuItems = useMemo(() => {
    let items = filteredRoutes;

    if (searchTerm) {
      items = filterMenuItemsBySearch(items, searchTerm);

      // Auto expand all items when searching
      const keys: string[] = [];
      items.forEach((route: any) => {
        if (route.children && route.children.length > 0) {
          keys.push(route.key);
        }
      });
      setOpenKeys(keys);
    } else {
      setOpenKeys([]);
    }

    return buildMenuItems(items);
  }, [filteredRoutes, searchTerm, can]);

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    setSelectedKeys([e.key]);
  };

  const handleOpenChange: MenuProps["onOpenChange"] = (keys) => {
    setOpenKeys(keys);
  };

  return (
    <div
      className={`h-screen flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? "w-20" : "w-64"
        }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-lg font-bold text-gray-800 whitespace-nowrap">
              Dashboard
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {!collapsed && (
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <Input
            placeholder="Search menu..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg"
            allowClear
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-4">
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          onClick={handleMenuClick}
          inlineCollapsed={collapsed}
          items={menuItems}
          className="border-r-0"
        />
      </div>

      {!collapsed && (
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role || "Guest"}
              </p>
            </div>
            <Badge dot className="w-2 h-2 bg-green-500 flex-shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
