"use client";

import api from "@/app/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import type { Permission } from "@/config/permissions";

export interface Role {
  id: number;
  role_id: string;
  name: string;
  description: string;
  permissions: string[];
  permission_count: number;
  user_count: number;
  created_at: string;
  updated_at: string;
}

export interface RolePayload {
  name: string;
  description: string;
  permissions: string[];
}

const errorMessage = (err: unknown, fallback: string) => {
  const data = (
    err as { response?: { data?: { message?: string; error?: string } } }
  )?.response?.data;
  return data?.message || data?.error || fallback;
};

export const useQueryRoles = (enabled = true) =>
  useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await api.get("/role");
      return (res.data?.data ?? []) as Role[];
    },
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });

/** The permission tree (groups > sub groups > permissions) served by the backend. */
export const useQueryPermissionCatalog = (enabled = true) =>
  useQuery({
    queryKey: ["permission-catalog"],
    queryFn: async () => {
      const res = await api.get("/permission");
      return (res.data?.data ?? []) as Permission[];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

export const useMutationRole = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["roles"] });

  const { mutateAsync: createRole, isPending: isCreating } = useMutation({
    mutationFn: (payload: RolePayload) => api.post("/role", payload),
    onSuccess: () => {
      invalidate();
      message.success("Role created successfully.");
    },
    onError: (err) => message.error(errorMessage(err, "Failed to create role")),
  });

  const { mutateAsync: updateRole, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RolePayload }) =>
      api.put(`/role/${id}`, payload),
    onSuccess: () => {
      invalidate();
      // people holding this role get the new permissions on their next load
      queryClient.invalidateQueries({ queryKey: ["users"] });
      message.success("Role updated successfully.");
    },
    onError: (err) => message.error(errorMessage(err, "Failed to update role")),
  });

  const { mutateAsync: deleteRole, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/role/${id}`),
    onSuccess: () => {
      invalidate();
      message.success("Role deleted successfully.");
    },
    onError: (err) => message.error(errorMessage(err, "Failed to delete role")),
  });

  return { createRole, updateRole, deleteRole, isCreating, isUpdating, isDeleting };
};
