"use client";

import api from "@/app/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { message } from "antd";
import { QuestionBankAdd } from "./QuestionBank";

export const useMutationQuestionBank = () => {
  const queryClient = useQueryClient();
  const [editingQuestionBank, setEditingQuestionBank] =
    useState<QuestionBankAdd | null>(null);

  const { mutateAsync: addQuestionBank, isPending: isAdding } = useMutation({
    mutationFn: (payload: Omit<QuestionBankAdd, "QuestionBankID">) =>
      api.post("/question-bank", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-bank"] });
      message.success("Question bank added successfully!");
    },
    onError: () => {
      message.error("Failed to add question bank");
    },
  });

  const { mutateAsync: updateQuestionBank, isPending: isUpdating } =
    useMutation({
      mutationFn: ({
        id,
        payload,
      }: {
        id: string;
        payload: Partial<QuestionBankAdd>;
      }) => api.put(`/question-bank/${id}`, payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["question-bank"] });
        message.success("Question bank updated successfully!");
      },
      onError: () => {
        message.error("Failed to update question bank");
      },
    });

  const { mutateAsync: deleteQuestionBank, isPending: isDeleting } =
    useMutation({
      mutationFn: (id: string) => api.delete(`/question-bank/${id}`),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["question-bank"] });
        message.success("Question bank deleted successfully!");
      },
      onError: () => {
        message.error("Failed to delete question bank");
      },
    });

  return {
    addQuestionBank,
    updateQuestionBank,
    deleteQuestionBank,
    isAdding,
    isUpdating,
    isDeleting,
    setEditingQuestionBank,
    editingQuestionBank,
  };
};
