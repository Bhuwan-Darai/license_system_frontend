"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/app/utils/axios";
import { message } from "antd";
import { useRouter } from "next/navigation";

interface User {
  email: string;
  username: string;
  role: string;
  isVerify: boolean;
  isApproved: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetchUser: () => void;
  login: (credentials: LoginCredentials) => Promise<{success: boolean; message: string}>;
  logout: () => void;
}

interface LoginCredentials {
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    },
    onSuccess: async (data) => {
      console.log("data", data);
      if (data.success) {
        console.log("trying to access me");
        // Fetch user after successful login (cookie is already set by backend)
        const userResponse = await api.get("/auth/me", {
          withCredentials: true,
        });
        console.log("userResponse", userResponse);
        const user = userResponse?.data?.data;

        queryClient.setQueryData(["user"], user);
        queryClient.setQueryData(["isAuthenticated"], true);

        message.success(data.message || "Login successful!");
        router.push("/dashboard");
      } else {
        message.error(data.message || "Login failed.");
      }
    },
    onError: (error: { response: { data: { message: string } } }) => {
      const errorMessage = error.response?.data?.message || "Login failed";
      message.error(errorMessage);
    },
  });

  // User Query
  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await api.get("/auth/me", { withCredentials: true });
        return response.data;
      } catch (error) {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const isAuthenticated = !!user;

  // Logout function
  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error(err);
    }
    queryClient.setQueryData(["user"], null);
    router.push("/login");
  };

  // Optional: Auto fetch user on mount
  useEffect(() => {
    if (!user) {
      refetch();
    }
  }, [user, refetch]);

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        isAuthenticated,
        refetchUser: refetch,
        login: loginMutation.mutateAsync, // ← Properly exported
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
