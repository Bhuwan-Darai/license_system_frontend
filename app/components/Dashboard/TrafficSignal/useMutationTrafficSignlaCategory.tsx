import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TrafficSignalCategory } from "./TrafficSignalCategory";
import api from "@/app/utils/axios";
import { message } from "antd";
import { useState } from "react";

export const useMutationTrafficSignalCategory = () => {
  const queryClient = useQueryClient();

  // Add Mutation
  const { mutateAsync: addCategory, isPending: isAdding } = useMutation({
    mutationFn: (payload: Omit<TrafficSignalCategory, "id">) =>
      api.post("/traffic-signal-category", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["traffic-signal-categories"] });
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
      payload: Partial<TrafficSignalCategory>;
    }) => api.put(`/traffic-signal-category/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["traffic-signal-categories"] });
      message.success("Category updated successfully!");
    },
    onError: () => {
      message.error("Failed to update category");
    },
  });

  // Delete Mutation
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: (id: string | number) => api.delete(`/traffic-signal-category/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["traffic-signal-categories"] });
      message.success("Category deleted successfully");
      // Deleting the last row on a page beyond page 1 would otherwise leave
      // the user stranded on a now-empty page.
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
    isDeleting
  }

}