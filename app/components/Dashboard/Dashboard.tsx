"use client";

import ServerStatus from "./ServerStatus/ServerStatus";
import DashboardStats from "./DashboardStats";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";

export default function Dashboard() {
  const { isAllowed } = useAuthContext();
  const canView = isAllowed(PERM.DASHBOARD.VIEW);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      {canView && <DashboardStats enabled={canView} />}
      {isAllowed(PERM.DASHBOARD.SERVER_STATUS) && <ServerStatus />}
    </div>
  );
}
