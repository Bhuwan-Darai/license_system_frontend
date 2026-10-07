"use client";

import React, { useEffect } from "react";
import { Button, Result } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/app/context/AuthContext";
import { findRouteForPath, routes, type Route } from "@/config/route";

// first page in the menu the user is allowed to open
const firstAllowedPath = (
  items: Route[],
  isAllowed: (permission: NonNullable<Route["permission"]>) => boolean,
): string | null => {
  for (const item of items) {
    if (item.children?.length) {
      const inner = firstAllowedPath(item.children, isAllowed);
      if (inner) return inner;
    } else if (!item.permission || isAllowed(item.permission)) {
      return item.path;
    }
  }
  return null;
};

/** Stops a signed-in user from opening a page their role does not allow. */
export const RouteGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAllowed } = useAuthContext();

  const required = findRouteForPath(pathname ?? "")?.permission;
  const allowed = !required || isAllowed(required);
  const fallback = firstAllowedPath(routes, isAllowed);

  // Landing on /dashboard without the dashboard permission goes to the first page they can use
  useEffect(() => {
    if (!allowed && pathname === "/dashboard" && fallback) {
      router.replace(fallback);
    }
  }, [allowed, pathname, fallback, router]);

  if (allowed) return <>{children}</>;
  if (pathname === "/dashboard" && fallback) return null;

  return (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you don't have permission to access this page."
      extra={
        fallback && fallback !== pathname ? (
          <Button type="primary" onClick={() => router.push(fallback)}>
            Go to an allowed page
          </Button>
        ) : undefined
      }
    />
  );
};
