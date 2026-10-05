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

import { useRouter } from "next/navigation";
import { User } from "@/app/hooks/usePermissions";
import { useAuthContext } from "@/app/context/AuthContext";
import { useTheme } from "@/app/context/ThemeContext";

interface HeaderProps {
  user: User | null;
  collapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, collapsed }) => {
  const router = useRouter();
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
  const textColor = isThemeLight ? "#131b2e" : "#eee8dd";
  const hoverColor = isThemeLight ? "#eee8dd" : "#131b2e";
  const borderColor = isThemeLight ? "#d1d5db" : "#1e3a5f";

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
        <Breadcrumb
          items={[{ title: "Home" }, { title: "Dashboard" }]}
          style={{ color: textColor }}
        />
      </div>

      <div className="flex items-center gap-4">
        {isThemeLight ? (
          <Button onClick={() => setTheme("dark")}><MoonOutlined />Dark</Button>
        ) : (
          <Button onClick={() => setTheme("light")}><SunOutlined />Light</Button>
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