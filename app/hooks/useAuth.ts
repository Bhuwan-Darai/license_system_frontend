import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/app/utils/axios";
import { useRouter } from "next/navigation";
import { message } from "antd";

interface User {
  email: string;
  username: string;
  role: string;
  isVerify: boolean;
  isApproved: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  phone: string;
  username: string;
  password: string;
  isVerify?: boolean;
  validEmail?: boolean;
  isApproved?: boolean;
  isRejected?: boolean;
  role?: string;
}

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get current user
  const useCurrentUser = () => {
    return useQuery({
      queryKey: ["user"],
      queryFn: async () => {
        const token = localStorage.getItem("token");
        if (!token) return null;

        try {
          const response = await api.get("/auth/me");
          return response.data.data;
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          return null;
        }
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: !!localStorage.getItem("token"),
    });
  };

  // Login mutation
  const useLogin = () => {
    return useMutation({
      mutationFn: async (credentials: LoginCredentials) => {
        const response = await api.post("/auth/login", credentials);
        return response.data;
      },
      onSuccess: (data) => {
        if (data.success && data.data) {
          localStorage.setItem("token", data.data.token);
          localStorage.setItem("user", JSON.stringify(data.data.user));

          queryClient.setQueryData(["user"], data.data.user);
          queryClient.setQueryData(["isAuthenticated"], true);

          message.success(data.message || "Login successful!");
          router.push("/dashboard");
        } else {
          message.error(data.message || "Login failed.");
        }
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "Login failed";
        message.error(errorMessage);
      },
    });
  };

  // Register mutation
  const useRegister = () => {
    return useMutation({
      mutationFn: async (userData: RegisterData) => {
        const response = await api.post("/auth/register", userData);
        return response.data;
      },
      onSuccess: (data) => {
        if (data.success) {
          message.success(data.message || "Registration successful!");
          router.push("/login");
        } else {
          message.error(data.message || "Registration failed.");
        }
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || "Registration failed";
        message.error(errorMessage);
      },
    });
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    queryClient.setQueryData(["user"], null);
    queryClient.setQueryData(["isAuthenticated"], false);
    queryClient.clear(); // Clear all queries
    message.success("Logged out successfully");
    router.push("/login");
  };

  // Check if authenticated
  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  return {
    useCurrentUser,
    useLogin,
    useRegister,
    logout,
    isAuthenticated,
  };
};
