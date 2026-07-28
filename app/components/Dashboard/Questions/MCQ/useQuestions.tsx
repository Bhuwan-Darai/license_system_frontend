"use client";

import api from "@/app/utils/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useState } from "react";

export interface DBQuestion {
  id: number;
  question_id: string;
  question_bank_id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  difficulty_level: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  options: {
    id: number;
    option_id: string;
    question_id: string;
    option_text: string;
    is_correct: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
  }[];
}

export interface CreateQuestionPayload {
  question_bank_id: string;
  title1: string;
  title2?: string;
  title3?: string; // image path/url
  options: {
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    correct_option: number; // 1-4
  };
  level: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  sort_order?: number;
}

export const useQueryQuestions = (
  bankId: string | null,
  params: { page: number; limit: number; search: string },
) => {
  return useQuery({
    queryKey: ["questions", bankId, params.page, params.limit, params.search],
    queryFn: async () => {
      if (!bankId)
        return { data: [], pagination: { total: 0, page: 1, limit: 10 } };
      const res = await api.get(`/question/bank/${bankId}`, {
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search,
        },
      });
      return (
        res?.data ?? { data: [], pagination: { total: 0, page: 1, limit: 10 } }
      );
    },
    enabled: !!bankId,
    staleTime: 0,
  });
};

export const useMutationQuestions = () => {
  const [questionBankId, setQuestionBankId] = useState<any>();
  const [params, setParams] = useState({ page: 1, limit: 10, search: "" });
  const queryClient = useQueryClient();

  const { mutateAsync: createQuestion, isPending: isCreating } = useMutation({
    mutationFn: (payload: CreateQuestionPayload) =>
      api.post("/question", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      message.success("Question created successfully on the server!");
    },
    onError: (err: any) => {
      const errMsg =
        err?.response?.data?.error ||
        err.message ||
        "Failed to create question";
      message.error(errMsg);
    },
  });

  const { mutateAsync: deleteQuestion, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/question/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      message.success("Question deleted from server!");
    },
    onError: () => {
      message.error("Failed to delete question");
    },
  });

  const { mutateAsync: updateQuestion, isPending: isUpdating } = useMutation({
    mutationFn: (id: string) => api.put(`/question/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      message.success("Question updated successfully on the server!");
    },
    onError: () => {
      message.error("Failed to delete question");
    },
  });

  return {
    createQuestion,
    isCreating,
    deleteQuestion,
    isDeleting,
    updateQuestion,
    isUpdating,
    setQuestionBankId,
    setParams,
    questionBankId,
  };
};
