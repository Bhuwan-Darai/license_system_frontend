"use client";

import ServerStatus from "./ServerStatus/ServerStatus";
import DashboardStats from "./DashboardStats";
import { useAuthContext } from "@/app/context/AuthContext";

export default function Dashboard() {
  const { isAllowed } = useAuthContext();
  const canView = isAllowed("DASHBOARD_STATS_LIST");

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      {canView && <DashboardStats enabled={canView} />}
      {isAllowed("DASHBOARD_SERVER_STATUS_LIST") && <ServerStatus />}
    </div>
  );
}
