"use client";

import api from "@/app/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

export interface EmergencyNumber {
  id: number;
  emergency_number_id: string;
  emergency_number: string;
  name: string;
  display: boolean;
}

export interface CreateEmergencyNumberPayload {
  name: string;
  number: string;
  display: boolean;
}

type UpdateEmergencyNumberPayload = Partial<CreateEmergencyNumberPayload>;

export const useMutationEmergencyNumber = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["emergency-number"] });

  const { mutateAsync: addNumber, isPending: isAdding } = useMutation({
    mutationFn: (payload: CreateEmergencyNumberPayload) =>
      api.post("/emergency-number", payload),
    onSuccess: () => {
      invalidate();
    },
  });

  const { mutateAsync: updateNumber, isPending: isUpdating } = useMutation({
    mutationFn: ({
      emergency_number_id,
      payload,
    }: {
      emergency_number_id: string;
      payload: UpdateEmergencyNumberPayload;
    }) => api.put(`/emergency-number/${emergency_number_id}`, payload),
    onSuccess: () => {
      invalidate();
    },
  });

  const { mutateAsync: deleteNumber, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/emergency-number/${id}`),
    onSuccess: () => {
      invalidate();
    },
  });

  return {
    addNumber,
    updateNumber,
    deleteNumber,
    isAdding,
    isUpdating,
    isDeleting,
  };
};
