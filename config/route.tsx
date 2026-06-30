// lib/routes.tsx
"use client";
import {
  DashboardOutlined,
  AreaChartOutlined,
  UserOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";

export interface Route {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  permission?: string;
  children?: Route[];
}

export const routes: Route[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <DashboardOutlined />,
    path: "/dashboard",
    permission: "view_dashboard",
  },
  
  {
    key: "analytics",
    label: "Analytics",
    icon: <AreaChartOutlined />,
    path: "/dashboard/analytics",
    permission: "view_analytics",
  },
  {
    key: "users",
    label: "Users",
    icon: <UserOutlined />,
    path: "/dashboard/users",
    permission: "view_users",
    children: [
      {
        key: "users-list",
        label: "All Users",
        path: "/dashboard/users",
        permission: "view_users",
        icon: <UserOutlined />,
      },
      {
        key: "users-add",
        label: "Add User",
        path: "/dashboard/users/add",
        permission: "manage_users",
        icon: <UserOutlined />,
      },
    ],
  },
  {
    key: "products",
    label: "Products",
    icon: <ShoppingOutlined />,
    path: "/dashboard/products",
    permission: "view_products",
    children: [
      {
        key: "products-list",
        label: "All Products",
        path: "/dashboard/products",
        permission: "view_products",
        icon: <ShoppingOutlined />,
      },
      {
        key: "products-add",
        label: "Add Product",
        path: "/dashboard/products/add",
        permission: "manage_products",
        icon: <ShoppingOutlined />,
      },
    ],
  },
  {
    key: "question",
    label: "Questions",
    icon: <ShoppingCartOutlined />,
    path: "/dashboard/mcq",
    permission: "view_orders",
  },
  {
    key: "reports",
    label: "Reports",
    icon: <FileTextOutlined />,
    path: "/dashboard/reports",
    permission: "view_reports",
  },
  {
    key: "settings",
    label: "Settings",
    icon: <SettingOutlined />,
    path: "/dashboard/settings",
    permission: "view_settings",
    children: [
      {
        key: "settings-general",
        label: "General",
        path: "/dashboard/settings",
        permission: "view_settings",
        icon: <SettingOutlined />,
      },
      {
        key: "settings-security",
        label: "Security",
        path: "/dashboard/settings/security",
        permission: "manage_settings",
        icon: <SettingOutlined />,
      },
    ],
  },
];
