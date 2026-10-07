// components/dashboard/PermissionGate.tsx
"use client";

import React from "react";
import { Result, Button } from "antd";
import { useAuthContext } from "@/app/context/AuthContext";
import type { PermissionRequirement } from "@/config/permissions";

interface PermissionGateProps {
  children: React.ReactNode;
  permission: PermissionRequirement;
  fallback?: React.ReactNode;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  fallback,
}) => {
  const { isAllowed } = useAuthContext();

  if (!isAllowed(permission)) {
    return (
      fallback || (
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you don't have permission to access this page."
          extra={
            <Button type="primary" href="/dashboard">
              Back to Dashboard
            </Button>
          }
        />
      )
    );
  }

  return <>{children}</>;
};

export default PermissionGate;
