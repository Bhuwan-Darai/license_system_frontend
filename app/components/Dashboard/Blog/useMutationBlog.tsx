"use client";

import api from "@/app/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { message } from "antd";

export type Blog = {
  blog_id: string;
  title: string;
  subtitle: string;
  cover_image: string;
  blog_category: string;
  blog_content: string;
  status: string;
};

export interface BlogPayload {
  title: string;
  subtitle: string;
  cover_image: string;
  blog_category: string;
  blog_content: string;
  status: string;
}

export const useMutationBlog = () => {
  const queryClient = useQueryClient();


  const { mutateAsync: addBlog, isPending: isAdding } = useMutation({
    mutationFn: (payload: Omit<BlogPayload, "blog_id">) =>
      api.post("/blogs", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog"] });
      message.success("Blog added successfully!");
    },
    onError: () => {
      message.error("Failed to add blog");
    },
  });

  const { mutateAsync: updateBlog, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<BlogPayload>;
    }) => api.put(`/blogs/${id}`, payload),
    onSuccess: async () => {
     await queryClient.invalidateQueries({ queryKey: ["blog"] });
     await message.success("Blog updated successfully!");
    },
    onError: async () => {
      await message.error("Failed to update blog");
    },
  });

  const { mutateAsync: deleteBlog, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/blogs/${id}`),
    onSuccess: async () => {
     await queryClient.invalidateQueries({ queryKey: ["blog"] });
     await message.success("Blog deleted successfully!");
    },
    onError: async () => {
     await message.error("Failed to delete blog");
    },
  });

  return {
    addBlog,
    updateBlog,
    deleteBlog,
    isAdding,
    isUpdating,
    isDeleting
  };
};
