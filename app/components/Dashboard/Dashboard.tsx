"use client";

import ServerStatus from "./ServerStatus/ServerStatus";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";

export default function Dashboard() {
  const { isAllowed } = useAuthContext();

  return (
    <div style={{ padding: 24 }}>
      {isAllowed(PERM.DASHBOARD.SERVER_STATUS) && <ServerStatus />}
    </div>
  );
}
