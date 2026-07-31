"use client";

import api from "@/app/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { message } from "antd";
import { CreateIshiharaPlatePayload } from "./IshiharaAddForm";
import { IshiharaPlate } from "./IshiharaCardList";

interface Ishihara {
  IshiharaID: string;
  Title: string;
  Image?: string;
  ImagePath?: string;
}

export const useMutationIshihara = () => {
  const queryClient = useQueryClient();
  const [editingPlate, setEditingPlate] = useState<IshiharaPlate | null>(null);

  const { mutateAsync: addPlate, isPending: isAdding } = useMutation({
    mutationFn: (payload: Omit<CreateIshiharaPlatePayload, "plate_id">) =>
      api.post("/ishihara-plate", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ishihara-plates"] });
      message.success("Plate added successfully!");
    },
    onError: () => {
      message.error("Failed to add plate");
    },
  });

  const { mutateAsync: updatePlate, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateIshiharaPlatePayload>;
    }) => api.put(`/ishihara-plate/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ishihara-plates"] });
      message.success("Plate updated successfully!");
    },
    onError: () => {
      message.error("Failed to update plate");
    },
  });

  const { mutateAsync: deletePlate, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/ishihara-plate/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ishihara-plates"] });
      message.success("Plate deleted successfully!");
    },
    onError: () => {
      message.error("Failed to delete plate");
    },
  });

  return {
    addPlate,
    updatePlate,
    deletePlate,
    isAdding,
    isUpdating,
    isDeleting,
    setEditingPlate,
    editingPlate,
  };
};
