"use client";

import api from "@/app/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

export interface PanelUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  role_id: string | null;
  role_name: string;
  is_super_admin: boolean;
  created_at: string;
}

export interface UserPayload {
  username: string;
  email: string;
  phone: string;
  /** left empty on edit keeps the current password */
  password: string;
  /** empty means super admin (full access) */
  role_id: string;
}

const errorMessage = (err: unknown, fallback: string) => {
  const data = (
    err as { response?: { data?: { message?: string; error?: string } } }
  )?.response?.data;
  return data?.message || data?.error || fallback;
};

export const useQueryUsers = (
  page: number,
  limit: number,
  search: string,
  enabled = true,
) =>
  useQuery({
    queryKey: ["users", page, limit, search],
    queryFn: async () => {
      const res = await api.get("/user", {
        params: { page, limit, search: search || undefined },
      });
      return res.data as {
        data: PanelUser[];
        pagination: { page: number; limit: number; total: number };
      };
    },
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });

export const useMutationUser = () => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    // role user counts change when people are added, moved or removed
    queryClient.invalidateQueries({ queryKey: ["roles"] });
  };

  const { mutateAsync: createUser, isPending: isCreating } = useMutation({
    mutationFn: (payload: UserPayload) => api.post("/user", payload),
    onSuccess: () => {
      invalidate();
      message.success("User created successfully.");
    },
    onError: (err) => message.error(errorMessage(err, "Failed to create user")),
  });

  const { mutateAsync: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UserPayload }) =>
      api.put(`/user/${id}`, payload),
    onSuccess: () => {
      invalidate();
      message.success("User updated successfully.");
    },
    onError: (err) => message.error(errorMessage(err, "Failed to update user")),
  });

  const { mutateAsync: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/user/${id}`),
    onSuccess: () => {
      invalidate();
      message.success("User deleted successfully.");
    },
    onError: (err) => message.error(errorMessage(err, "Failed to delete user")),
  });

  return { createUser, updateUser, deleteUser, isCreating, isUpdating, isDeleting };
};
