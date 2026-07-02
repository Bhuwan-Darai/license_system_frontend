import axios from "axios";
import { message } from "antd";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://127.0.0.1:4000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        message.error("Session expired. Please login again.");
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        message.error(error.response.data?.message || "Access denied");
      }

      // Handle 404 Not Found
      if (error.response.status === 404) {
        message.error("Resource not found");
      }

      // Handle 500 Server Error
      if (error.response.status >= 500) {
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
