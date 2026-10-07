"use client";

import api from "@/app/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import type { DBQuestion } from "../Questions/MCQ/useQuestions";

export interface ExamSummary {
  id: number;
  exam_id: string;
  title: string;
  description: string;
  duration: number;
  total_marks: number;
  pass_marks: number;
  is_visible: boolean;
  question_count: number;
  created_at: string;
  updated_at: string;
}

export interface ExamQuestionRow {
  id: number;
  exam_id: string;
  question_id: string;
  question_bank_id: string;
  marks: number;
  sort_order: number;
  question?: DBQuestion;
}

export interface ExamDetail extends Omit<ExamSummary, "question_count"> {
  questions: ExamQuestionRow[];
}

export interface ExamPayload {
  title: string;
  description: string;
  duration: number;
  pass_marks: number;
  is_visible: boolean;
  questions: { question_id: string; marks: number }[];
}

export interface ExamBank {
  "Question Bank Id": string;
  Title: string;
  "No Of Questions": number;
  Category: { question_bank_category_id: string; title: string };
}

const errorMessage = (err: unknown, fallback: string) => {
  const data = (err as { response?: { data?: { message?: string; error?: string } } })
    ?.response?.data;
  return data?.message || data?.error || fallback;
};

export const useQueryExams = (
  page: number,
  limit: number,
  search?: string,
  enabled = true,
) =>
  useQuery({
    queryKey: ["exams", page, limit, search],
    queryFn: async () => {
      const res = await api.get("/exam", {
        params: { page, limit, search: search || undefined },
      });
      return res.data as {
        data: ExamSummary[];
        pagination: { page: number; limit: number; total: number };
      };
    },
    staleTime: 0,
    refetchOnMount: "always",
    enabled,
  });

export const useQueryExam = (examId: string | null) =>
  useQuery({
    queryKey: ["exam", examId],
    queryFn: async () => {
      const res = await api.get(`/exam/${examId}`);
      return res.data.data as ExamDetail;
    },
    enabled: !!examId,
    staleTime: 0,
  });

/** Every question bank (exam set), hidden ones included. */
export const useQueryExamBanks = () =>
  useQuery({
    queryKey: ["exam-question-banks"],
    queryFn: async () => {
      const res = await api.get("/question-bank", { params: { limit: 100 } });
      return (res.data?.data ?? []) as ExamBank[];
    },
    staleTime: 0,
  });

/** All questions of one bank, fetched page by page. */
export const useQueryBankQuestions = (bankId: string, enabled: boolean) =>
  useQuery({
    queryKey: ["exam-bank-questions", bankId],
    queryFn: async () => {
      const limit = 100;
      const all: DBQuestion[] = [];
      for (let page = 1; ; page++) {
        const res = await api.get(`/question/bank/${bankId}`, {
          params: { page, limit },
        });
        all.push(...((res.data?.data ?? []) as DBQuestion[]));
        if (page >= (res.data?.pagination?.total_pages ?? 1)) break;
      }
      return all;
    },
    enabled,
    staleTime: 0,
  });

export const useMutationExam = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["exams"] });
    queryClient.invalidateQueries({ queryKey: ["exam"] });
  };

  const { mutateAsync: createExam, isPending: isCreating } = useMutation({
    mutationFn: (payload: ExamPayload) => api.post("/exam", payload),
    onSuccess: () => {
      invalidate();
      message.success("Exam created successfully!");
    },
    onError: (err) => message.error(errorMessage(err, "Failed to create exam")),
  });

  const { mutateAsync: updateExam, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ExamPayload }) =>
      api.put(`/exam/${id}`, payload),
    onSuccess: () => {
      invalidate();
      message.success("Exam updated successfully!");
    },
    onError: (err) => message.error(errorMessage(err, "Failed to update exam")),
  });

  const { mutateAsync: setExamVisibility, isPending: isTogglingVisibility } =
    useMutation({
      mutationFn: ({ id, is_visible }: { id: string; is_visible: boolean }) =>
        api.put(`/exam/${id}/visibility`, { is_visible }),
      onSuccess: (_, { is_visible }) => {
        invalidate();
        message.success(is_visible ? "Exam is now visible" : "Exam hidden");
      },
      onError: (err) =>
        message.error(errorMessage(err, "Failed to change visibility")),
    });

  const { mutateAsync: deleteExam, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/exam/${id}`),
    onSuccess: () => {
      invalidate();
      message.success("Exam deleted successfully!");
    },
    onError: (err) => message.error(errorMessage(err, "Failed to delete exam")),
  });

  return {
    createExam,
    updateExam,
    setExamVisibility,
    deleteExam,
    isCreating,
    isUpdating,
    isTogglingVisibility,
    isDeleting,
  };
};
