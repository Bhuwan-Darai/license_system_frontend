"use client";

import api from "@/app/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface FiscalYear {
  year_id: string;
  name_ad: string;
  name_bs: string;
  start_date_ad: string;
  end_date_ad: string;
  start_date_bs: string;
  end_date_bs: string;
  active: boolean;
  selected: boolean;
  created_at: string;
}

export interface FiscalYearPayload {
  name_ad: string;
  name_bs: string;
  start_date_ad: string;
  end_date_ad: string;
  start_date_bs: string;
  end_date_bs: string;
  active: boolean;
}

export const useMutationFiscalYear = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["fiscal-year"] });

  const { mutateAsync: addFiscalYear, isPending: isAdding } = useMutation({
    mutationFn: (payload: FiscalYearPayload) =>
      api.post("/fiscal-year", payload),
    onSuccess: invalidate,
  });

  const { mutateAsync: updateFiscalYear, isPending: isUpdating } = useMutation({
    mutationFn: ({
      year_id,
      payload,
    }: {
      year_id: string;
      payload: FiscalYearPayload;
    }) => api.put(`/fiscal-year/${year_id}`, payload),
    onSuccess: invalidate,
  });

  const { mutateAsync: selectFiscalYear, isPending: isSelecting } = useMutation(
    {
      mutationFn: (year_id: string) =>
        api.put(`/fiscal-year/${year_id}/select`),
      onSuccess: invalidate,
    },
  );

  const { mutateAsync: deleteFiscalYear, isPending: isDeleting } = useMutation({
    mutationFn: (year_id: string) => api.delete(`/fiscal-year/${year_id}`),
    onSuccess: invalidate,
  });

  return {
    addFiscalYear,
    updateFiscalYear,
    selectFiscalYear,
    deleteFiscalYear,
    isAdding,
    isUpdating,
    isSelecting,
    isDeleting,
  };
};
