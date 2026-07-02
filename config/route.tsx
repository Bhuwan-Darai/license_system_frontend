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
    key: "categories",
    label: "Categories",
    icon: <AreaChartOutlined />,
    path: "/dashboard/categories/blog",
    permission: "view_analytics",
    children: [
      {
        key: "categories-blog",
        label: "Blog Categories",
        path: "/dashboard/categories/blog",
        permission: "view_analytics",
        icon: <AreaChartOutlined />,
      },
      {
        key: "categories-ishihara",
        label: "Ishihara Category",
        path: "/dashboard/categories/ishihara",
        permission: "manage_analytics",
        icon: <AreaChartOutlined />,
      },
    ],
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
    key: "signals",
    label: "Signals",
    icon: <ShoppingCartOutlined />,
    path: "/dashboard/signals",
    permission: "view_orders",
  },
  {
    key: "ishihara_plates",
    label: "Ishihara Plates",
    icon: <ShoppingCartOutlined />,
    path: "/dashboard/ishihara_plates",
    permission: "view_orders",
  },
    {
    key: "blog",
    label: "Blog",
    icon: <ShoppingCartOutlined />,
    path: "/dashboard/blog",
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
