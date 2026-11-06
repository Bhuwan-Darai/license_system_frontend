"use client";

import api from "@/app/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type EmailStatus = "sent" | "failed";

export interface EmailLog {
  id: number;
  user_id: string | null;
  user_name: string | null;
  recipient: string;
  subject: string;
  purpose: string;
  status: EmailStatus;
  error: string;
  created_at: string;
}

export interface EmailLogFilters {
  page: number;
  pageSize: number;
  search: string;
  status?: EmailStatus;
}

export const useQueryEmailLogs = (f: EmailLogFilters, enabled = true) =>
  useQuery({
    queryKey: ["email-logs", f],
    queryFn: async () => {
      const res = await api.get("/email-log", {
        params: {
          page: f.page,
          limit: f.pageSize,
          search: f.search || undefined,
          status: f.status || undefined,
        },
      });
      return res.data as { data: EmailLog[]; pagination: { total: number } };
    },
    enabled,
    refetchInterval: 30_000,
  });

export const useMutationEmailLogs = () => {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["email-logs"] });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/email-log/${id}`),
    onSuccess: refresh,
  });
  const clear = useMutation({
    mutationFn: () => api.delete("/email-log"),
    onSuccess: refresh,
  });

  return {
    deleteLog: remove.mutateAsync,
    clearLogs: clear.mutateAsync,
    isClearing: clear.isPending,
  };
};
