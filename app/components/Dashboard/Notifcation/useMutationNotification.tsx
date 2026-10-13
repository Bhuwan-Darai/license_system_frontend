"use client";

import api from "@/app/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type NotificationStatus = "DRAFT" | "SENDING" | "SENT" | "FAILED";

export interface NotificationItem {
  id: number;
  notification_id: string;
  title: string;
  message: string;
  send_email: boolean;
  send_push: boolean;
  status: NotificationStatus;
  sent_at: string | null;
  email_sent: number;
  email_failed: number;
  push_sent: number;
  push_failed: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationPayload {
  title: string;
  message: string;
  send_email: boolean;
  send_push: boolean;
  /** send right after saving (create only) */
  send_now?: boolean;
}

export const useMutationNotification = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["notification"] });

  const { mutateAsync: addNotification, isPending: isAdding } = useMutation({
    mutationFn: (payload: NotificationPayload) =>
      api.post("/notification", payload),
    onSuccess: invalidate,
  });

  const { mutateAsync: updateNotification, isPending: isUpdating } =
    useMutation({
      mutationFn: ({
        notification_id,
        payload,
      }: {
        notification_id: string;
        payload: NotificationPayload;
      }) => api.put(`/notification/${notification_id}`, payload),
      onSuccess: invalidate,
    });

  const { mutateAsync: sendNotification, isPending: isSending } = useMutation({
    mutationFn: (notification_id: string) =>
      api.post(`/notification/${notification_id}/send`),
    onSuccess: invalidate,
  });

  const { mutateAsync: deleteNotification, isPending: isDeleting } =
    useMutation({
      mutationFn: (notification_id: string) =>
        api.delete(`/notification/${notification_id}`),
      onSuccess: invalidate,
    });

  return {
    addNotification,
    updateNotification,
    sendNotification,
    deleteNotification,
    isAdding,
    isUpdating,
    isSending,
    isDeleting,
  };
};
