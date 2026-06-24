// lib/permissions.ts
"use client";
export const PERMISSIONS = {
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_ANALYTICS: "view_analytics",
  MANAGE_USERS: "manage_users",
  VIEW_USERS: "view_users",
  MANAGE_PRODUCTS: "manage_products",
  VIEW_PRODUCTS: "view_products",
  MANAGE_ORDERS: "manage_orders",
  VIEW_ORDERS: "view_orders",
  VIEW_REPORTS: "view_reports",
  MANAGE_SETTINGS: "manage_settings",
  VIEW_SETTINGS: "view_settings",
} as const;

export const ROLES = {
  ADMIN: ["admin"],
  MANAGER: ["admin", "manager"],
  USER: ["admin", "manager", "user"],
  VIEWER: ["admin", "manager", "user", "viewer"],
} as const;

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: Object.values(PERMISSIONS),
  manager: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VIEW_REPORTS,
  ],
  user: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_ORDERS,
  ],
  viewer: [PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_PRODUCTS],
};

export const hasPermission = (
  userPermissions: string[],
  requiredPermission: string,
): boolean => {
  return userPermissions.includes(requiredPermission);
};
