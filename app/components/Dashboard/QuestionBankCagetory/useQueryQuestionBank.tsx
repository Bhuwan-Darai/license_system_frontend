"use client";

import api from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";

export const useQueryQuestionBankCategories = (enabled = true) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["question-bank-categories"],
    enabled,
    queryFn: async () => {
      const res = await api.get("/question-bank-category");
      return res.data?.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return { data, isLoading , error };
};
