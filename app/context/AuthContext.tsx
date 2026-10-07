"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/app/utils/axios";
import { message } from "antd";
import { useRouter } from "next/navigation";
import type { PermissionRequirement } from "@/config/permissions";
import {
  clearAccessCache,
  saveAccessCache,
  useCachedPermissions,
} from "@/app/lib/accessCache";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  /** account type: "Admin" for panel users, "User" for app users */
  role: string;
  /** name of the assigned role, "Super Admin" when the account has full access */
  role_name: string;
  is_super_admin: boolean;
  permissions: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Permission codes of the signed-in user. */
  permissions: string[];
  isSuperAdmin: boolean;
  /**
   * True when the user holds the permission. Pass a list to allow when any one
   * of the codes is held. This only decides what the screen shows, the backend
   * checks the permission again on every request.
   */
  isAllowed: (permission: PermissionRequirement) => boolean;
  refetchUser: () => void;
  login: (
    credentials: LoginCredentials,
  ) => Promise<{ success: boolean; message: string }>;
  isLoginLoading: boolean;
  logout: () => void;
}

interface LoginCredentials {
  email: string;
  password: string;
}

const NO_PERMISSIONS: string[] = [];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const cachedPermissions = useCachedPermissions();

  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async (): Promise<AuthUser | null> => {
      try {
        const response = await api.get("/auth/me");
        const me = response.data?.data as Partial<AuthUser> | undefined;
        if (!me?.id) {
          clearAccessCache();
          return null;
        }
        const full: AuthUser = {
          id: me.id,
          name: me.name ?? "",
          email: me.email ?? "",
          role: me.role ?? "",
          role_name: me.role_name ?? "",
          is_super_admin: !!me.is_super_admin,
          permissions: me.permissions ?? [],
        };
        saveAccessCache(full.id, full.permissions);
        return full;
      } catch {
        clearAccessCache();
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    },
    onSuccess: async (data) => {
      if (data.success) {
        await refetch();
        await message.success(data.message || "Login successful!");
        router.push("/dashboard");
      } else {
        await message.error(data.message || "Login failed.");
      }
    },
    onError: async (error: { response?: { data?: { message?: string } } }) => {
      await message.error(error.response?.data?.message || "Login failed");
    },
  });

  const isAuthenticated = !!user;

  // While /auth/me is loading the cached codes keep the menu from flashing
  // empty. Once it answers, the server's codes are the only ones used.
  const permissions = isLoading
    ? cachedPermissions
    : (user?.permissions ?? NO_PERMISSIONS);
  const isSuperAdmin = !!user?.is_super_admin;

  const isAllowed = useCallback(
    (permission: PermissionRequirement) => {
      const required = typeof permission === "string" ? [permission] : permission;
      return required.some((code) => isSuperAdmin || permissions.includes(code));
    },
    [isSuperAdmin, permissions],
  );

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error(err);
    }
    clearAccessCache();
    queryClient.setQueryData(["user"], null);
    router.push("/login");
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user: user ?? null,
      isLoading,
      isAuthenticated,
      permissions,
      isSuperAdmin,
      isAllowed,
      refetchUser: refetch,
      login: loginMutation.mutateAsync,
      isLoginLoading: loginMutation.isPending,
      logout,
    }),
    // logout only closes over stable references
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      user,
      isLoading,
      isAuthenticated,
      permissions,
      isSuperAdmin,
      isAllowed,
      refetch,
      loginMutation.mutateAsync,
      loginMutation.isPending,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
