"use client";

import api from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";

interface Pagination {
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

export const useQueryTrafficSignalCategories = (
  page: number = 1,
  pageSize: number = 100,
  search?: string,
  enabled = true,
) => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["traffic-signal-categories", page, pageSize, search],
    enabled,
    queryFn: async () => {
      const res = await api.get("/traffic-signal-category", {
        params: { page, limit: pageSize, search: search || undefined },
      });
      return res.data;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  return {
    categories: data?.data ?? [],
    pagination: data?.pagination as Pagination | undefined,
    isLoading: isLoading || isFetching,
  };
};
