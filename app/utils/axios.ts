import axios from "axios";
import { message } from "antd";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://127.0.0.1:3000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // ← Important for cookies
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // No need to attach token manually anymore (handled by cookie)
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.response.config.url;

      if (status === 401) {
        // Ignore auth check failures
        if (url !== "/auth/me" && url !== "/auth/login") {
          message.error("Session expired. Please login again.");

          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          message.error("Session expired. Please login again.");
        }
      } else if (status === 403) {
        message.error(error.response.data?.message || "Access denied");
      } else if (status === 404) {
        message.error("Resource not found");
      } else if (status >= 500) {
        message.error("Server error. Please try again later.");
      }
    } else if (error.request) {
      message.error("No response from server. Please check your connection.");
    } else {
      message.error(error.message || "An error occurred");
    }

    return Promise.reject(error);
  },
);

export default api;
