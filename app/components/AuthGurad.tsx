// app/components/AuthGuard.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/app/context/AuthContext";
import { Spin } from "antd";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuthContext();
    const router = useRouter();
    const pathname = usePathname();
    const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated && !isPublic) {
            router.replace("/login");
        }
        if (isAuthenticated && isPublic) {
            router.replace("/dashboard");
        }
    }, [isLoading, isAuthenticated, isPublic, pathname]);

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20%" }}>
                <Spin size="large" />
            </div>
        );
    }

    if ((!isAuthenticated && !isPublic) || (isAuthenticated && isPublic)) {
        return null; // avoid flashing protected/public content during redirect
    }

    return <>{children}</>;
}