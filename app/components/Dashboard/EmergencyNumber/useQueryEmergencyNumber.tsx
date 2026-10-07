"use client";

import api from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";

export const useQueryEmergencyNumber = (
  page?: number,
  pageSize?: number,
  search?: string,
  enabled = true,
) => {
  const {
    data: number = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["emergency-number"],
    queryFn: async () => {
      const res = await api.get("/emergency-number", {
        params: { page, limit: pageSize, search: search || undefined },
      });
      return res.data ?? [];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    enabled,
  });

  return { number, isLoading, error, refetch };
};
