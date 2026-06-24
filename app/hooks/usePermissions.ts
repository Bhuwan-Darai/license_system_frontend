// hooks/usePermissions.ts
import { useMemo } from "react";
import { ROLE_PERMISSIONS } from "../lib/permission";

// types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "user" | "viewer";
  permissions: string[];
}

export interface Route {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  permission?: string;
  children?: Route[];
}

export const usePermissions = (user: User | null) => {
  const userPermissions = useMemo(() => {
    if (!user) return [];
    return ROLE_PERMISSIONS[user.role] || [];
  }, [user]);

  const can = useMemo(() => {
    return (permission: string) => {
      if (!user) return false;
      if (user.role === "admin") return true;
      return userPermissions.includes(permission);
    };
  }, [user, userPermissions]);

  const filterRoutes = useMemo(() => {
    return (routes: Route[]): Route[] => {
      return routes
        .filter((route) => {
          if (!route.permission) return true;
          return can(route.permission);
        })
        .map((route) => ({
          ...route,
          children: route.children ? filterRoutes(route.children) : undefined,
        }));
    };
  }, [can]);

  return { can, userPermissions, filterRoutes };
};
