"use client";

import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import api from "@/app/utils/axios";
import { clearAccessCache, saveAccessCache } from "@/app/lib/accessCache";

interface PermissionsPayload {
  permissions?: string[];
  role_name?: string;
}

interface CachedUser {
  id: string;
  permissions: string[];
  role_name: string;
}

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join(",") === [...b].sort().join(",");

/**
 * Keeps the signed-in user's permissions current without a new login.
 *
 * Opens GET /auth/permissions/stream (Server-Sent Events). The server sends the
 * current access on connect and again whenever the user's role is edited or
 * reassigned. Each `permissions-update` rewrites the ["user"] query and the
 * localStorage cache, so menus, route guards and buttons re-render at once.
 * `session-ended` means the account is gone, so the session is cleared.
 *
 * EventSource reconnects by itself after a network drop, and the first event of
 * every connection re-syncs anything missed meanwhile. This only keeps the UI
 * honest, the backend checks the permission on every request.
 */
export function usePermissionStream(
  enabled: boolean,
  queryClient: QueryClient,
  onUpdated: () => void,
  onSessionEnded: () => void,
) {
  useEffect(() => {
    if (!enabled || typeof EventSource === "undefined") return;

    const base = api.defaults.baseURL;
    if (!base) return;

    const source = new EventSource(`${base}/auth/permissions/stream`, {
      withCredentials: true,
    });

    source.addEventListener("permissions-update", (event) => {
      let payload: PermissionsPayload;
      try {
        payload = JSON.parse((event as MessageEvent).data);
      } catch {
        return;
      }
      if (!Array.isArray(payload.permissions)) return;
      const permissions = payload.permissions;

      const current = queryClient.getQueryData<CachedUser | null>(["user"]);
      if (!current) return;

      const changed = !sameSet(current.permissions, permissions);
      queryClient.setQueryData<CachedUser>(["user"], {
        ...current,
        permissions,
        role_name: payload.role_name ?? current.role_name,
      });
      saveAccessCache(permissions);
      if (changed) onUpdated();
    });

    source.addEventListener("session-ended", () => {
      source.close();
      clearAccessCache();
      queryClient.setQueryData(["user"], null);
      onSessionEnded();
    });

    return () => source.close();
    // the callbacks are only invoked from events, a new identity must not reconnect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, queryClient]);
}
