// hooks/usePermissions.ts
"use client";

import { useMemo } from "react";
import { AuthUser, useAuthContext } from "../context/AuthContext";
import type { Route } from "@/config/route";

export type User = AuthUser;

/** Permission helpers for the signed-in user. */
export const usePermissions = () => {
  const { isAllowed, permissions } = useAuthContext();

  const filterRoutes = useMemo(() => {
    const filter = (items: Route[]): Route[] =>
      items.flatMap((route) => {
        if (route.permission && !isAllowed(route.permission)) return [];
        if (!route.children) return [route];
        // a group disappears when none of its entries are allowed
        const children = filter(route.children);
        return children.length ? [{ ...route, children }] : [];
      });
    return filter;
  }, [isAllowed]);

  return { can: isAllowed, userPermissions: permissions, filterRoutes };
};
