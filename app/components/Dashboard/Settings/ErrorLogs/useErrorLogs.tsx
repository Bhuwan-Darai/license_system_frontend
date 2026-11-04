"use client";

import api from "@/app/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type ErrorSource = "database" | "http";

export interface ErrorLog {
  id: number;
  source: ErrorSource;
  method: string;
  path: string;
  status: number | null;
  message: string;
  error: string;
  query: string;
  location: string;
  payload: string;
  response: string;
  ip: string;
  created_at: string;
}

export interface ErrorLogFilters {
  page: number;
  pageSize: number;
  search: string;
  source?: ErrorSource;
}

export const useQueryErrorLogs = (f: ErrorLogFilters, enabled = true) =>
  useQuery({
    queryKey: ["error-logs", f],
    queryFn: async () => {
      const res = await api.get("/error-log", {
        params: {
          page: f.page,
          limit: f.pageSize,
          search: f.search || undefined,
          source: f.source || undefined,
        },
      });
      return res.data as { data: ErrorLog[]; pagination: { total: number } };
    },
    enabled,
    refetchInterval: 30_000,
  });

export const useMutationErrorLogs = () => {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["error-logs"] });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/error-log/${id}`),
    onSuccess: refresh,
  });
  const clear = useMutation({
    mutationFn: () => api.delete("/error-log"),
    onSuccess: refresh,
  });

  return {
    deleteLog: remove.mutateAsync,
    clearLogs: clear.mutateAsync,
    isClearing: clear.isPending,
  };
};
