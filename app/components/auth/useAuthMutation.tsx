"use client";

import api from "@/app/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAuthMutation = () => {
  const queryClient = useQueryClient();
  const {
    mutateAsync: registerUser,
    isPending,
    error,
    data,
  } = useMutation({
    mutationFn: (user: any) => {
      console.log("user", user);
      return api.post("/users", user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    registerUser,
    isPending,
    error,
    data,
  };
};
