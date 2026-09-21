// app/components/AuthGuard.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/app/context/AuthContext";
import { Spin } from "antd";

// Routes anyone can view, regardless of auth state — never redirected by this guard.
const OPEN_ROUTES = ["/home", "/about", "/courses", "/contact", "/pricing","/blog"];
// Routes only meaningful for signed-out users — redirected to /dashboard if already authenticated.
const GUEST_ONLY_ROUTES = ["/login", "/register", "/forgot-password"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuthContext();
    const router = useRouter();
    const pathname = usePathname();
    const isOpen = OPEN_ROUTES.some((r) => pathname.startsWith(r));
    const isGuestOnly = GUEST_ONLY_ROUTES.some((r) => pathname.startsWith(r));

    useEffect(() => {
        if (isOpen || isLoading) return;

    if (!isAuthenticated && !isGuestOnly) {
            router.replace("/login");
        }
        if (isAuthenticated && isGuestOnly) {
            router.replace("/dashboard");
        }
    }, [isLoading, isAuthenticated, isGuestOnly, isOpen, pathname]);

    // Open routes render immediately, without waiting on auth state at all.
    if (isOpen) {
        return <>{children}</>;
    }

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20%" }}>
                <Spin size="large" />
            </div>
        );
    }

    if ((!isAuthenticated && !isGuestOnly) || (isAuthenticated && isGuestOnly)) {
        return null; // avoid flashing protected/guest-only content during redirect
    }

    return <>{children}</>;
}