"use client";

import api from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";

export const useQueryPolicy = (
  page?: number,
  pageSize?: number,
  search?: string,
  enabled = true,
) => {
  const {
    data: policies = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["policy", page, pageSize, search],
    queryFn: async () => {
      const res = await api.get("/policy", {
        params: { page, limit: pageSize, search: search || undefined },
      });
      return res.data ?? [];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    enabled,
  });

  return { policies, isLoading, error, refetch };
};
