"use client";

import api from "@/app/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { SignalCategory } from "./Categories";

export const useSignalCategoryMutation = () => {
  const queryClient = useQueryClient();

  // Add Mutation
  const { mutateAsync: addCategory, isPending: isAdding } = useMutation({
    mutationFn: (payload: Omit<SignalCategory, "TrafficSignalCategoryID">) =>
      api.post("/traffic-signal-category", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["traffic-signal-categories"],
      });
      message.success("Category added successfully!");
    },
    onError: () => {
      message.error("Failed to add category");
    },
  });

  // Update Mutation
  const { mutateAsync: updateCategory, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: Partial<SignalCategory>;
    }) => api.put(`/traffic-signal-category/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["traffic-signal-categories"],
      });
      message.success("Category updated successfully!");
    },
    onError: () => {
      message.error("Failed to update category");
    },
  });

  // Delete Mutation
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: (id: string | number) =>
      api.delete(`/traffic-signal-category/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["traffic-signal-categories"],
      });
      message.success("Category deleted successfully");
    },
    onError: () => {
      message.error("Failed to delete category");
    },
  });

  return {
    addCategory,
    isAdding,
    updateCategory,
    isUpdating,
    deleteCategory,
    isDeleting,
  };
};
