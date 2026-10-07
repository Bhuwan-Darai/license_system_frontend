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
  PhoneOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { PERM, type PermissionRequirement } from "./permissions";

export interface Route {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  /** Needed to see the menu entry and open the page. A list means any one of them. */
  permission?: PermissionRequirement;
  children?: Route[];
}

export const routes: Route[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <DashboardOutlined />,
    path: "/dashboard",
    permission: PERM.DASHBOARD.VIEW,
  },

  {
    key: "categories",
    label: "Categories",
    icon: <AreaChartOutlined />,
    path: "/dashboard/categories/blog",
    children: [
      {
        key: "categories-blog",
        label: "Blog Category",
        path: "/dashboard/categories/blog",
        permission: PERM.BLOG_CATEGORY.LIST,
        icon: <AreaChartOutlined />,
      },
      {
        key: "categories-vehicle",
        label: "Vehicle Category",
        path: "/dashboard/categories/vehicle",
        permission: PERM.VEHICLE_CATEGORY.LIST,
        icon: <AreaChartOutlined />,
      },
      {
        key: "categories-ishihara",
        label: "Ishihara Category",
        path: "/dashboard/categories/ishihara",
        permission: PERM.ISHIHARA_CATEGORY.LIST,
        icon: <AreaChartOutlined />,
      },
      {
        key: "question-bank",
        label: "Question Bank",
        path: "/dashboard/categories/question-bank",
        permission: PERM.QUESTION_BANK_CATEGORY.LIST,
        icon: <AreaChartOutlined />,
      },
      {
        key: "traffic-signal-category",
        label: "Traffic Signal Category",
        path: "/dashboard/categories/traffic-signal-category",
        permission: PERM.TRAFFIC_SIGNAL_CATEGORY.LIST,
        icon: <AreaChartOutlined />,
      },
    ],
  },
  {
    key: "access",
    label: "Access Control",
    icon: <SafetyCertificateOutlined />,
    path: "/dashboard/users",
    children: [
      {
        key: "users-list",
        label: "Users",
        path: "/dashboard/users",
        permission: PERM.USER.LIST,
        icon: <UserOutlined />,
      },
      {
        key: "roles-list",
        label: "Roles",
        path: "/dashboard/roles",
        permission: PERM.ROLE.LIST,
        icon: <TeamOutlined />,
      },
    ],
  },
  {
    key: "question",
    label: "Questions",
    icon: <ShoppingCartOutlined />,
    path: "/dashboard/question/question-bank",
    children: [
      {
        key: "questions-list",
        label: "Question Bank",
        path: "/dashboard/question/question-bank",
        permission: PERM.QUESTION_BANK.LIST,
        icon: <ShoppingOutlined />,
      },
      {
        key: "questions-add",
        label: "Add Question",
        path: "/dashboard/question/mcq",
        permission: [PERM.QUESTION.LIST, PERM.QUESTION.ADD, PERM.QUESTION.UPDATE],
        icon: <ShoppingOutlined />,
      },
    ],
  },
  {
    key: "signals",
    label: "Signals",
    icon: <ShoppingCartOutlined />,
    path: "/dashboard/signals",
    permission: PERM.TRAFFIC_SIGNAL.LIST,
  },
  {
    key: "ishihara_plates",
    label: "Ishihara Plates",
    icon: <ShoppingCartOutlined />,
    path: "/dashboard/ishihara_plates",
    permission: PERM.ISHIHARA_PLATE.LIST,
  },
  {
    key: "blog",
    label: "Blog",
    icon: <ShoppingCartOutlined />,
    path: "/dashboard/blog",
    permission: PERM.BLOG.LIST,
  },
  {
    key: "Exam",
    label: "Exam",
    icon: <ShoppingCartOutlined />,
    path: "/dashboard/exam-manager",
    permission: PERM.EXAM.LIST,
  },
  {
    key: "reports",
    label: "Reports",
    icon: <FileTextOutlined />,
    path: "/dashboard/reports",
  },
  {
    key: "carousel",
    label: "Carousel",
    icon: <FileTextOutlined />,
    path: "/dashboard/carousel-manager",
    permission: PERM.CAROUSEL.LIST,
  },
  {
    key: "emergency-number",
    label: "Emergency Number",
    icon: <PhoneOutlined />,
    path: "/dashboard/emergency-number",
    permission: PERM.EMERGENCY_NUMBER.LIST,
  },
  {
    key: "notification",
    label: "Notification",
    icon: <FileTextOutlined />,
    path: "/dashboard/notification",
  },
  {
    key: "settings",
    label: "Settings",
    icon: <SettingOutlined />,
    path: "/dashboard/settings",
    children: [
      {
        key: "settings-general",
        label: "General",
        path: "/dashboard/settings",
        icon: <SettingOutlined />,
      },
      {
        key: "settings-security",
        label: "Security",
        path: "/dashboard/settings/security",
        icon: <SettingOutlined />,
      },
    ],
  },
];

/** The menu entry that owns a path: the page itself, or the closest parent path. */
export const findRouteForPath = (
  pathname: string,
  items: Route[] = routes,
): Route | null => {
  let best: Route | null = null;

  const visit = (list: Route[]) => {
    for (const item of list) {
      if (item.children?.length) {
        visit(item.children);
        continue;
      }
      const matches =
        pathname === item.path || pathname.startsWith(`${item.path}/`);
      if (matches && (!best || item.path.length > best.path.length)) {
        best = item;
      }
    }
  };
  visit(items);

  return best;
};
