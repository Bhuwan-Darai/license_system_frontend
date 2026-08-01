"use client";

import api from "@/app/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

export interface Signal {
  id: number | string;
  TrafficSignalID: string;
  Title: string;
  Description: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt: string;
}

export type UpdateSignal = {
  signal_id: string;
  signal_category: string;
  english_title: string;
  title: string;
  image_url: string;
  english_description: string;
  description: string;
  is_active: boolean;
};

export const useSignalMutation = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: addSignal, isPending: isAdding } = useMutation({
    mutationFn: (payload: Omit<Signal, "TrafficSignalID">) =>
      api.post("/traffic-signal", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["traffic-signals"],
      });
      message.success("Signal added successfully!");
    },
    onError: () => {
      message.error("Failed to add signal");
    },
  });

  const { mutateAsync: updateSignal, isPending: isUpdating } = useMutation({
    mutationFn: (payload: UpdateSignal) =>
      api.put(`/traffic-signal/${payload?.signal_id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["traffic-signals"],
      });
      message.success("Signal updated successfully!");
    },
    onError: () => {
      message.error("Failed to update signal");
    },
  });

  const { mutateAsync: deleteSignal, isPending: isDeleting } = useMutation({
    mutationFn: (id: string | number) => api.delete(`/traffic-signal/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["traffic-signals"],
      });
      message.success("Signal deleted successfully");
    },
    onError: () => {
      message.error("Failed to delete signal");
    },
  });

  return {
    addSignal,
    isAdding,
    updateSignal,
    isUpdating,
    deleteSignal,
    isDeleting,
  };
};
