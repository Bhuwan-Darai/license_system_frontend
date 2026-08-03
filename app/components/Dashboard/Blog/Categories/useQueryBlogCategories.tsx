"use client";

import api from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";

export const useQueryBlogCategoires = () => {
  // Fetch Categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const res = await api.get("/blog-category");
      return res.data?.data || res.data || [];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  return {
    categories,
    isLoading,
  };
};
