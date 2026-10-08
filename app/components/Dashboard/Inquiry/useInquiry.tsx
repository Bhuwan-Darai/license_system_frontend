"use client";

import api from "@/app/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type InquiryStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";
export type HelpType = "REGISTRATION" | "PRACTICE" | "TRIAL" | "INSTITUTE" | "OTHER";

export const STATUS_OPTIONS: { value: InquiryStatus; label: string; color: string }[] = [
  { value: "NEW", label: "New", color: "blue" },
  { value: "IN_PROGRESS", label: "In progress", color: "orange" },
  { value: "RESOLVED", label: "Resolved", color: "green" },
];

export const HELP_TYPE_OPTIONS: { value: HelpType; label: string }[] = [
  { value: "REGISTRATION", label: "License registration" },
  { value: "PRACTICE", label: "Practice app" },
  { value: "TRIAL", label: "Trial exam" },
  { value: "INSTITUTE", label: "Driving institute" },
  { value: "OTHER", label: "Other" },
];

export interface Inquiry {
  inquiry_id: string;
  name: string;
  phone: string;
  email: string;
  help_type: HelpType;
  message: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface InquiryFilters {
  page: number;
  pageSize: number;
  search: string;
  status?: InquiryStatus;
  helpType?: HelpType;
}

export const useQueryInquiries = (f: InquiryFilters, enabled = true, refetchInterval?: number) =>
  useQuery({
    queryKey: ["inquiries", f],
    queryFn: async () => {
      const res = await api.get("/inquiry", {
        params: {
          page: f.page,
          limit: f.pageSize,
          search: f.search || undefined,
          status: f.status || undefined,
          help_type: f.helpType || undefined,
        },
      });
      return res.data as { data: Inquiry[]; pagination: { total: number } };
    },
    enabled,
    refetchInterval,
  });

export const useMutationInquiry = () => {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["inquiries"] });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InquiryStatus }) =>
      api.put(`/inquiry/${id}/status`, { status }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/inquiry/${id}`),
    onSuccess: refresh,
  });

  return {
    changeStatus: changeStatus.mutateAsync,
    deleteInquiry: remove.mutateAsync,
    isChangingStatus: changeStatus.isPending,
    isDeleting: remove.isPending,
  };
};
