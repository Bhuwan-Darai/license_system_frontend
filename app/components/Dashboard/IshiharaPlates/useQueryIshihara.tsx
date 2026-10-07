"use client";

import api from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";

export const useQueryIshihara = (enabled = true) => {
    const { data: plates = [], isLoading } = useQuery({
        queryKey: ["ishihara-plates"],
        enabled,
        queryFn: async () => {
            const res = await api.get("/ishihara-plate");
            return res.data ?? [];
        },
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
    });

    return { plates, isLoading };
}