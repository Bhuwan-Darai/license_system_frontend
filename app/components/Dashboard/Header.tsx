// components/dashboard/Header.tsx
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
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { User } from "@/app/hooks/usePermissions";

interface HeaderProps {
  user: User | null;
  collapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, collapsed }) => {
  const router = useRouter();
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
      onClick: () => {
        // Handle logout
        router.push("/auth/login");
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

  return (
    <header
      className={`h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 transition-all duration-300 ${
        collapsed ? "ml-20" : "ml-64"
      }`}
    >
      <div className="flex items-center gap-4">
        <Breadcrumb items={[{ title: "Home" }, { title: "Dashboard" }]} />
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={
            isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
          }
          onClick={toggleFullscreen}
          className="text-gray-500 hover:text-gray-700"
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
              className="text-gray-500 hover:text-gray-700"
            />
          </Badge>
        </Dropdown>

        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Space className="cursor-pointer hover:bg-gray-50 px-3 py-1 rounded-lg transition-colors">
            <Avatar
              size="default"
              icon={<UserOutlined />}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            />
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
              {user?.name || "User"}
            </span>
          </Space>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
