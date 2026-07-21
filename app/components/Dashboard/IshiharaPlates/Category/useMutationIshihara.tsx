"use client";

import api from "@/app/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { message } from "antd";

interface IshiharaCategory {
  IshiharaCategoryID: string;
  Title: string;
  Description: string;
  Image?: string;
  ImagePath?: string;
}

export const useMutationIshihara = () => {
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] =
    useState<IshiharaCategory | null>(null);

  const { mutateAsync: addCategory, isPending: isAdding } = useMutation({
    mutationFn: (payload: Omit<IshiharaCategory, "IshiharaCategoryID">) =>
      api.post("/ishihara-category", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ishihara-categories"] });
      message.success("Category added successfully!");
    },
    onError: () => {
      message.error("Failed to add category");
    },
  });

  const { mutateAsync: updateCategory, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<IshiharaCategory>;
    }) => api.put(`/ishihara-category/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ishihara-categories"] });
      message.success("Category updated successfully!");
    },
    onError: () => {
      message.error("Failed to update category");
    },
  });

  const { mutateAsync: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/ishihara-category/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ishihara-categories"] });
      message.success("Category deleted successfully!");
    },
    onError: () => {
      message.error("Failed to delete category");
    },
  });

  return {
    addCategory,
    updateCategory,
    deleteCategory,
    isAdding,
    isUpdating,
    isDeleting,
    setEditingCategory,
    editingCategory,
  };
};
