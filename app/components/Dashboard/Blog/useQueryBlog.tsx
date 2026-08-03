"use client";

import api from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";

export const useQueryBlog = () => {
  const {
    data: blogs = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["blog"],
    queryFn: async () => {
      const res = await api.get("/blogs");
      return res?.data ?? [];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  return { blogs, isLoading, refetch };
};
