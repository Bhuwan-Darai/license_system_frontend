"use client";

import api from "@/app/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type NewsTag = "NEWS" | "NOTICE" | "SCHEDULE" | "UPDATE";
export type NewsStatus = "DRAFT" | "PUBLISHED";

export interface News {
  id: number;
  news_id: string;
  title: string;
  content: string;
  tag: NewsTag;
  status: NewsStatus;
  image: string;
  image_path: string;
  published_at?: string;
  notified_at?: string;
  created_at: string;
}

export interface NewsPayload {
  title: string;
  content: string;
  tag: NewsTag;
  status: NewsStatus;
  image: string;
  send_notification: boolean;
}

export const useQueryNews = (
  page: number,
  pageSize: number,
  search: string,
  enabled = true,
) =>
  useQuery({
    queryKey: ["news", page, pageSize, search],
    queryFn: async () => {
      const res = await api.get("/news", {
        params: { page, limit: pageSize, search: search || undefined },
      });
      return res.data;
    },
    enabled,
  });

export const useMutationNews = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["news"] });

  const add = useMutation({
    mutationFn: (payload: NewsPayload) => api.post("/news", payload),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NewsPayload }) =>
      api.put(`/news/${id}`, payload),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/news/${id}`),
    onSuccess: invalidate,
  });

  return {
    addNews: add.mutateAsync,
    updateNews: update.mutateAsync,
    deleteNews: remove.mutateAsync,
    isAdding: add.isPending,
    isUpdating: update.isPending,
    isDeleting: remove.isPending,
  };
};
