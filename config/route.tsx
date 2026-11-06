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
  MessageOutlined,
  IdcardOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { type PermissionRequirement } from "./permissions";

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
    permission: "DASHBOARD_STATS_LIST",
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
        permission: "CATEGORY_BLOG_LIST",
        icon: <AreaChartOutlined />,
      },
      {
        key: "categories-vehicle",
        label: "Vehicle Category",
        path: "/dashboard/categories/vehicle",
        permission: "CATEGORY_VEHICLE_LIST",
        icon: <AreaChartOutlined />,
      },
      {
        key: "categories-ishihara",
        label: "Ishihara Category",
        path: "/dashboard/categories/ishihara",
        permission: "CATEGORY_ISHIHARA_LIST",
        icon: <AreaChartOutlined />,
      },
      {
        key: "question-bank",
        label: "Question Bank",
        path: "/dashboard/categories/question-bank",
        permission: "CATEGORY_QUESTION_BANK_LIST",
        icon: <AreaChartOutlined />,
      },
      {
        key: "traffic-signal-category",
        label: "Traffic Signal Category",
        path: "/dashboard/categories/traffic-signal-category",
        permission: "CATEGORY_TRAFFIC_SIGNAL_LIST",
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
        permission: "ACCESS_USER_LIST",
        icon: <UserOutlined />,
      },
      {
        key: "roles-list",
        label: "Roles",
        path: "/dashboard/roles",
        permission: "ACCESS_ROLE_LIST",
        icon: <TeamOutlined />,
      },
    ],
  },
  {
    key: "registration",
    label: "Registration",
    icon: <IdcardOutlined />,
    path: "/dashboard/registration/new-license",
    children: [
      {
        key: "registration-new-license",
        label: "New License",
        path: "/dashboard/registration/new-license",
        permission: "REGISTRATION_NEW_LICENSE_LIST",
        icon: <IdcardOutlined />,
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
        permission: "QUESTION_BANK_LIST",
        icon: <ShoppingOutlined />,
      },
      {
        key: "questions-add",
        label: "Add Question",
        path: "/dashboard/question/mcq",
        permission: ["QUESTION_MCQ_LIST", "QUESTION_MCQ_CREATE", "QUESTION_MCQ_EDIT"],
        icon: <ShoppingOutlined />,
      },
    ],
  },
  {
    key: "signals",
    label: "Signals",
    icon: <ShoppingCartOutlined />,
    path: "/dashboard/signals",
    permission: "SIGNAL_TRAFFIC_SIGNAL_LIST",
  },
  {
    key: "ishihara_plates",
    label: "Ishihara Plates",
    icon: <ShoppingCartOutlined />,
    path: "/dashboard/ishihara_plates",
    permission: "ISHIHARA_PLATE_LIST",
  },
  {
    key: "blog",
    label: "Blog",
    icon: <ShoppingCartOutlined />,
    path: "/dashboard/blog",
    permission: "BLOG_BLOG_LIST",
  },
  {
    key: "Exam",
    label: "Exam",
    icon: <ShoppingCartOutlined />,
    path: "/dashboard/exam-manager",
    permission: "EXAM_EXAM_LIST",
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
    permission: "CAROUSEL_CAROUSEL_LIST",
  },
  {
    key: "message",
    label: "Message",
    icon: <MessageOutlined />,
    path: "/dashboard/message",
    permission: "MESSAGE_MESSAGE_LIST",
  },
  {
    key: "inquiry",
    label: "Inquiries",
    icon: <MailOutlined />,
    path: "/dashboard/inquiry",
    permission: "INQUIRY_INQUIRY_LIST",
  },
  {
    key: "news",
    label: "News & Notices",
    icon: <FileTextOutlined />,
    path: "/dashboard/news-manager",
    permission: "NEWS_NEWS_LIST",
  },
  {
    key: "emergency-number",
    label: "Emergency Number",
    icon: <PhoneOutlined />,
    path: "/dashboard/emergency-number",
    permission: "EMERGENCY_NUMBER_LIST",
  },
  {
    key: "policy",
    label: "Policy & About Us",
    icon: <SafetyCertificateOutlined />,
    path: "/dashboard/policy",
    permission: "POLICY_LIST",
  },
  {
    key: "notification",
    label: "Notification",
    icon: <FileTextOutlined />,
    path: "/dashboard/notification",
    permission: "NOTIFICATION_NOTIFICATION_LIST",
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
        permission: "SETTINGS_GENERAL_LIST",
      },
      {
        key: "settings-fiscal-year",
        label: "Fiscal Year",
        path: "/dashboard/settings/fiscal-year",
        icon: <SettingOutlined />,
        permission: "FISCAL_YEAR_LIST",
      },
      {
        key: "settings-error-logs",
        label: "Error Logs",
        path: "/dashboard/settings/error-logs",
        icon: <SettingOutlined />,
        permission: "SETTINGS_ERROR_LOG_LIST",
      },
      {
        key: "settings-email-logs",
        label: "Email Logs",
        path: "/dashboard/settings/email-logs",
        icon: <SettingOutlined />,
        permission: "SETTINGS_EMAIL_LOG_LIST",
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
