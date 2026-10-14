"use client";

import api from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";

export const useQueryFiscalYear = (
  page?: number,
  pageSize?: number,
  search?: string,
  enabled = true,
) => {
  const {
    data: fiscalYears = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["fiscal-year", page, pageSize, search],
    queryFn: async () => {
      const res = await api.get("/fiscal-year", {
        params: { page, limit: pageSize, search: search || undefined },
      });
      return res.data ?? [];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    enabled,
  });

  return { fiscalYears, isLoading, error, refetch };
};
