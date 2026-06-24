// components/dashboard/PermissionGate.tsx
"use client";

import React from "react";
import { Result, Button } from "antd";
import { usePermissions, User } from "@/app/hooks/usePermissions";

interface PermissionGateProps {
  children: React.ReactNode;
  permission: string;
  user: User | null;
  fallback?: React.ReactNode;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  user,
  fallback,
}) => {
  const { can } = usePermissions(user);

  if (!can(permission)) {
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
