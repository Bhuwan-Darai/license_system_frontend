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

type BaseQuestionPayload = {
  question_bank_id: string;
  question_id: string;
  title1: string;
  title2?: string;
  title3?: string;
  level: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  sort_order?: number;
};

type BaseOptions = {
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct_option: number;
};

export interface CreateQuestionPayload extends BaseQuestionPayload {
  options: BaseOptions;
}

export interface UpdateQuestionPayload extends BaseQuestionPayload {
  options: BaseOptions & {
    optionA_id: string;
    optionB_id: string;
    optionC_id: string;
    optionD_id: string;
  };
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
      message.success("Question created successfully!");
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
      message.success("Question deleted!");
    },
    onError: () => {
      message.error("Failed to delete question");
    },
  });

  const { mutateAsync: updateQuestion, isPending: isUpdating } = useMutation({
    mutationFn: (value: UpdateQuestionPayload) =>
      api.put(`/question/${value?.question_id}`, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      message.success("Question updated successfully!");
    },
    onError: () => {
      message.error("Failed to update question");
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
