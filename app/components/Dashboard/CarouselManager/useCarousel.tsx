"use client";

import api from "@/app/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

export interface Carousel {
  id: number;
  carousel_id: string;
  title: string;
  description: string;
  /** public URL of the banner */
  image: string;
  /** storage path of the banner, this is what gets saved */
  image_path: string;
  link: string;
  link_text: string;
  open_new_tab: boolean;
  display: boolean;
  sort_order: number;
}

export interface CarouselPayload {
  title: string;
  description: string;
  image: string;
  link: string;
  link_text: string;
  open_new_tab: boolean;
  display: boolean;
  sort_order: number;
}

const errorMessage = (err: unknown, fallback: string) => {
  const data = (
    err as { response?: { data?: { message?: string; error?: string } } }
  )?.response?.data;
  return data?.message || data?.error || fallback;
};

export const useQueryCarousels = (search?: string, enabled = true) =>
  useQuery({
    queryKey: ["carousels", search],
    queryFn: async () => {
      const res = await api.get("/carousel", {
        params: { search: search || undefined },
      });
      return (res.data?.data ?? []) as Carousel[];
    },
    staleTime: 0,
    refetchOnMount: "always",
    enabled,
  });

export const useMutationCarousel = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["carousels"] });

  const { mutateAsync: createCarousel, isPending: isCreating } = useMutation({
    mutationFn: (payload: CarouselPayload) => api.post("/carousel", payload),
    onSuccess: () => {
      invalidate();
      message.success("Carousel created successfully.");
    },
    onError: (err) =>
      message.error(errorMessage(err, "Failed to create carousel")),
  });

  const { mutateAsync: updateCarousel, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CarouselPayload }) =>
      api.put(`/carousel/${id}`, payload),
    onSuccess: () => {
      invalidate();
      message.success("Carousel updated successfully.");
    },
    onError: (err) =>
      message.error(errorMessage(err, "Failed to update carousel")),
  });

  const { mutateAsync: setCarouselDisplay, isPending: isTogglingDisplay } =
    useMutation({
      mutationFn: ({ id, display }: { id: string; display: boolean }) =>
        api.put(`/carousel/${id}/display`, { display }),
      onSuccess: () => invalidate(),
      onError: (err) =>
        message.error(errorMessage(err, "Failed to change display")),
    });

  const { mutateAsync: deleteCarousel } = useMutation({
    mutationFn: (id: string) => api.delete(`/carousel/${id}`),
    onSuccess: () => {
      invalidate();
      message.success("Carousel deleted successfully.");
    },
    onError: (err) =>
      message.error(errorMessage(err, "Failed to delete carousel")),
  });

  return {
    createCarousel,
    updateCarousel,
    setCarouselDisplay,
    deleteCarousel,
    isCreating,
    isUpdating,
    isTogglingDisplay,
  };
};
