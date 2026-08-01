"use client";

import api from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";

export const useSignalCategoryQuery = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["traffic-signal-categories"],
    queryFn: async () => {
      const res = await api.get("/traffic-signal-category");
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
