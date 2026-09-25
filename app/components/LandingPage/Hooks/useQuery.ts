import { useQuery } from "@tanstack/react-query";
import api from "@/app/utils/axios";

export const useQueryDashboard = (
  page: number = 1,
  pageSize: number = 100,
  search?: string,
  initialData?: any,
) => {
  const {
    data: blog,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["blog", page, pageSize, search],
    queryFn: async () => {
      const res = await api.get(`/public/blogs/`, {
        params: { page, limit: pageSize, search: search || undefined },
      });
      return res?.data;
    },
    initialData,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  return {
    blog: blog?.data ?? [],
    pagination: blog?.pagination || undefined,
    isLoading: isLoading ?? false,
    error: error ?? false,
  };
};
