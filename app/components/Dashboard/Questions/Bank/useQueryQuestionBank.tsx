"use client";

import api from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";

export const useQueryQuestionBank = () => {
  const {
    data: questionBanks = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["question-bank"],
    queryFn: async () => {
      const res = await api.get("/question-bank");
      return res?.data ?? [];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  return { questionBanks, isLoading, refetch };
};
