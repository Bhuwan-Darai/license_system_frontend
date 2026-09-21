/** @format */

"use client";

import React from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ConfigProvider, theme as antdTheme } from "antd";
import enUS from "antd/locale/en_US";
import neNP from "antd/locale/ne_NP";
import { AuthProvider } from "@/app/context/AuthContext";
import { ThemeProvider, useTheme } from "@/app/context/ThemeContext";
import { LanguageProvider, useI18n } from "@/app/context/LanguageContext";
import type { Locale } from "@/app/i18n/config";
import AuthGuard from "../components/AuthGurad";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
    },
  },
});

// Keeps Ant Design's built-in text and colours in step with the app's language and theme
function AntdConfig({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const { lang } = useI18n();

  return (
    <ConfigProvider
      locale={lang === "ne" ? neNP : enUS}
      theme={{
        algorithm:
          resolvedTheme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
}

function Providers({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: Locale;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider initialLang={initialLang}>
          <AntdConfig>
            <AuthProvider>
              <AuthGuard>{children}</AuthGuard>
            </AuthProvider>
          </AntdConfig>
        </LanguageProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default Providers;
