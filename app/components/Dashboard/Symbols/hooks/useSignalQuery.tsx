"use client";

import api from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";

export const useSignalQuery = () => {
  const {
    data: signals = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["traffic-signals"],
    queryFn: async () => {
      const res = await api.get("/traffic-signal");
      return res.data || [];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  return {
    signals,
    isLoading,
    error,
  };
};
