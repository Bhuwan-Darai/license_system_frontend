"use client";

import api from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

/** Shape of the Fiber monitor middleware's JSON output. */
export interface ServerMetrics {
  pid: { cpu: number; ram: number; conns: number };
  os: {
    cpu: number;
    ram: number;
    total_ram: number;
    load_avg: number;
    conns: number;
  };
}

export interface ServerStatus {
  metrics: ServerMetrics;
  /** round trip of the metrics request, in milliseconds */
  latency: number;
  checkedAt: Date;
}

export const REFRESH_MS = 5000;

// /metrics is served from the server root, not under /api/v1
const metricsUrl = () =>
  `${(api.defaults.baseURL ?? "").replace(/\/api\/v1\/?$/, "")}/metrics`;

export const useServerStatus = (enabled = true) =>
  useQuery({
    queryKey: ["server-status"],
    queryFn: async (): Promise<ServerStatus> => {
      const start = performance.now();
      // Plain axios on purpose: the shared instance shows an error toast on every
      // failed request, which would repeat on each poll while the server is down.
      // The monitor only answers with JSON when Accept is exactly application/json.
      const res = await axios.get<ServerMetrics>(metricsUrl(), {
        headers: { Accept: "application/json" },
        timeout: 4000,
      });
      return {
        metrics: res.data,
        latency: Math.round(performance.now() - start),
        checkedAt: new Date(),
      };
    },
    refetchInterval: REFRESH_MS,
    refetchIntervalInBackground: false,
    enabled,
    retry: false,
    staleTime: 0,
  });
