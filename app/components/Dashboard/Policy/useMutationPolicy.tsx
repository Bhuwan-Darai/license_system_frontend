"use client";

import api from "@/app/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type PolicyType = "POLICY" | "ABOUT_US";

export interface Policy {
  id: number;
  policy_id: string;
  title: string;
  content: string;
  page_type: PolicyType;
  sort_order: number;
  display: boolean;
  created_at: string;
  updated_at: string;
}

export interface PolicyPayload {
  title: string;
  content: string;
  page_type: PolicyType;
  sort_order: number;
  display: boolean;
}

export const useMutationPolicy = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["policy"] });

  const { mutateAsync: addPolicy, isPending: isAdding } = useMutation({
    mutationFn: (payload: PolicyPayload) => api.post("/policy", payload),
    onSuccess: invalidate,
  });

  const { mutateAsync: updatePolicy, isPending: isUpdating } = useMutation({
    mutationFn: ({
      policy_id,
      payload,
    }: {
      policy_id: string;
      payload: PolicyPayload;
    }) => api.put(`/policy/${policy_id}`, payload),
    onSuccess: invalidate,
  });

  const { mutateAsync: deletePolicy, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/policy/${id}`),
    onSuccess: invalidate,
  });

  return {
    addPolicy,
    updatePolicy,
    deletePolicy,
    isAdding,
    isUpdating,
    isDeleting,
  };
};
