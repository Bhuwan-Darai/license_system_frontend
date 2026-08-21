"use client";

import api from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";

interface Pagination {
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

export const useQueryBlogCategoires = (
  page: number = 1,
  // Default to the backend's max page size so callers that just want "all
  // categories" (e.g. a select dropdown) get them without paging through.
  pageSize: number = 100,
  search?: string,
) => {
  // Fetch Categories (server-side pagination)
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["blog-categories", page, pageSize, search],
    queryFn: async () => {
      const res = await api.get("/blog-category", {
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
