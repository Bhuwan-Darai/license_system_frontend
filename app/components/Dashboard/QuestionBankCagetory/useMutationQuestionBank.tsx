"use client";

import api from "@/app/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { message } from "antd";
import { CreateQuestionBankCategoryPayload } from "./QuestionBankCategories";
import { QuestionBankAdd } from "../Questions/Bank/QuestionBank";

export const useMutationQuestionBankCategories = () => {
  const queryClient = useQueryClient();
  const [editingQuestionBank, setEditingQuestionBank] =
    useState<QuestionBankAdd | null>(null);

   // add question bank category
  const { mutateAsync: add, isPending } = useMutation({
    mutationFn: (payload: CreateQuestionBankCategoryPayload) =>
      api.post("/question-bank-category", payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["question-bank-categories"],
      });

      message.success("Question bank category added successfully!");
    },
  });

  // delete question bank category
  const { mutateAsync: deleteQuestionBankCategory, isPending: deletePending } =
    useMutation({
      mutationFn: (id: string) => api.delete(`/question-bank-category/${id}`),

      onSuccess: () => {
        message.success("Question bank category deleted successfully");
        queryClient.invalidateQueries({
          queryKey: ["question-bank-categories"],
        });
      },
      onError: () => {
        message.error("Failed to delete question bank category");
      },
    });

      const { mutateAsync: update, isPending: isUpdatePending } = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: CreateQuestionBankCategoryPayload }) =>
      api.put(`/question-bank-category/${id}`, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["question-bank-categories"],
      });

      message.success("Question bank category updated successfully!");
    },
  });

  return {
    add,
    update,
    isPending,
    isUpdatePending,
    deleteQuestionBankCategory,
    deletePending,
    setEditingQuestionBank,
    editingQuestionBank,
  };
};
