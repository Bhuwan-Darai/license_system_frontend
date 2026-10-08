"use client";

import api from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";

export interface DashboardCounts {
  roles_total: number;
  panel_users: number;
  app_users: number;
  questions_total: number;
  questions_active: number;
  questions_inactive: number;
  blogs_total: number;
  blogs_published: number;
  blogs_draft: number;
  ishihara_total: number;
  ishihara_active: number;
  ishihara_inactive: number;
  exams_total: number;
  exams_active: number;
  exams_inactive: number;
  carousels_total: number;
  carousels_shown: number;
  carousels_hidden: number;
  registrations_total: number;
  inquiries_total: number;
  inquiries_new: number;
}

export interface DayPoint {
  date: string;
  count: number;
}

export interface DistrictCount {
  province: string;
  district: string;
  count: number;
}

export interface DashboardStats {
  counts: DashboardCounts;
  registrations_per_day: DayPoint[];
  inquiries_per_day: DayPoint[];
  registrations_by_district: DistrictCount[];
}

export const useDashboardStats = (enabled: boolean) =>
  useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await api.get("/dashboard/stats");
      return res.data.data as DashboardStats;
    },
    enabled,
    refetchInterval: 60_000,
  });
