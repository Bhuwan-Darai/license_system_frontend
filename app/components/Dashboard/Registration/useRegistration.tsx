"use client";

import api from "@/app/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type RegistrationStatus = "INITIATED" | "PROCESSING" | "COMPLETED";

export const STATUS_OPTIONS: { value: RegistrationStatus; label: string; color: string }[] = [
  { value: "INITIATED", label: "Initiated", color: "blue" },
  { value: "PROCESSING", label: "Processing", color: "orange" },
  { value: "COMPLETED", label: "Completed", color: "green" },
];

export interface Province {
  name: string;
  districts: string[];
}

export interface RegistrationListItem {
  registration_id: string;
  full_name: string;
  email: string;
  phone: string;
  province: string;
  district: string;
  license_category: string;
  status: RegistrationStatus;
  passport_photo: string;
  created_at: string;
}

export interface RegistrationDetail {
  registration_id: string;
  full_name: string;
  email: string;
  phone: string;
  status: RegistrationStatus;
  remarks: string;
  date_of_birth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  blood_group: string;
  father_name: string;
  mother_name: string;
  citizenship_no: string;
  license_category: string;
  province: string;
  district: string;
  municipality: string;
  ward_no: number | null;
  address: string;
  license_front_image: string;
  license_front_image_path: string;
  license_back_image: string;
  license_back_image_path: string;
  passport_photo: string;
  passport_photo_path: string;
  created_at: string;
  updated_at: string;
}

export interface RegistrationPayload {
  full_name: string;
  email: string;
  phone: string;
  password?: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  father_name: string;
  mother_name: string;
  citizenship_no: string;
  license_category: string;
  province: string;
  district: string;
  municipality: string;
  ward_no: number | null;
  address: string;
  license_front_image: string;
  license_back_image: string;
  passport_photo: string;
}

export interface RegistrationFilters {
  page: number;
  pageSize: number;
  search: string;
  province?: string;
  district?: string;
  status?: RegistrationStatus;
}

const BASE = "/registration/new-license";

export const useQueryLocations = (enabled = true) =>
  useQuery({
    queryKey: ["registration-locations"],
    queryFn: async () => (await api.get("/registration/locations")).data.data as Province[],
    staleTime: Infinity, // the list of provinces does not change
    enabled,
  });

export const useQueryRegistrations = (f: RegistrationFilters, enabled = true) =>
  useQuery({
    queryKey: ["registrations", f],
    queryFn: async () => {
      const res = await api.get(BASE, {
        params: {
          page: f.page,
          limit: f.pageSize,
          search: f.search || undefined,
          province: f.province || undefined,
          district: f.district || undefined,
          status: f.status || undefined,
        },
      });
      return res.data as {
        data: RegistrationListItem[];
        pagination: { total: number; page: number; limit: number };
      };
    },
    enabled,
  });

export const useQueryRegistration = (id: string | undefined, enabled = true) =>
  useQuery({
    queryKey: ["registration", id],
    enabled: !!id && enabled,
    queryFn: async () => (await api.get(`${BASE}/${id}`)).data.data as RegistrationDetail,
  });

export const useMutationRegistration = () => {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["registrations"] });
    queryClient.invalidateQueries({ queryKey: ["registration"] });
  };

  const create = useMutation({
    mutationFn: (payload: RegistrationPayload) => api.post(BASE, payload),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RegistrationPayload }) =>
      api.put(`${BASE}/${id}`, payload),
    onSuccess: refresh,
  });
  const changeStatus = useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: RegistrationStatus; remarks: string }) =>
      api.put(`${BASE}/${id}/status`, { status, remarks }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`${BASE}/${id}`),
    onSuccess: refresh,
  });

  return {
    createRegistration: create.mutateAsync,
    updateRegistration: update.mutateAsync,
    changeStatus: changeStatus.mutateAsync,
    deleteRegistration: remove.mutateAsync,
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isChangingStatus: changeStatus.isPending,
    isDeleting: remove.isPending,
  };
};
