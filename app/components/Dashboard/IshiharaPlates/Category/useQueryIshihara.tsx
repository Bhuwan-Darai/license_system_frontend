"use client";

import api from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";

export const useQueryIshihara = () => {
    const { data: categories = [], isLoading } = useQuery({
        queryKey: ["ishihara-categories"],
        queryFn: async () => {
            const res = await api.get("/ishihara-category");
            return res.data?.data || res.data || [];
        },
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
    });

    return { categories, isLoading };
}