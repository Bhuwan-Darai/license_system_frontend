"use client";

import api from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";
import type { NotificationItem } from "./useMutationNotification";

export const useQueryNotification = (
  page?: number,
  pageSize?: number,
  search?: string,
  enabled = true,
) => {
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notification", page, pageSize, search],
    queryFn: async () => {
      const res = await api.get("/notification", {
        params: { page, limit: pageSize, search: search || undefined },
      });
      return res.data ?? [];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    // sending runs in the background: keep polling until it has finished
    refetchInterval: (query) => {
      const rows: NotificationItem[] = query.state.data?.data ?? [];
      return rows.some((r) => r.status === "SENDING") ? 4000 : false;
    },
    enabled,
  });

  return { notifications, isLoading, error, refetch };
};
