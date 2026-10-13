"use client";

import React, { useEffect } from "react";
import {
  Button,
  Card,
  ConfigProvider,
  Form,
  Result,
  Segmented,
  Select,
  Typography,
  message,
  theme as antdTheme,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/app/utils/axios";
import { useAuthContext } from "@/app/context/AuthContext";
import { useTheme, type FontSize, type Theme } from "@/app/context/ThemeContext";
import { PERM } from "@/config/permissions";

const { Text } = Typography;

interface FiscalYearOption {
  year_id: string;
  name_ad: string;
  name_bs: string;
  start_date_ad: string;
  end_date_ad: string;
  selected: boolean;
}

interface PreferencesForm {
  fiscal_year_id?: string;
  theme: Theme;
  font_size: FontSize;
  language: "en" | "ne";
}

const Settings: React.FC = () => {
  const {
    user,
    isLoading: isUserLoading,
    refetchUser,
    isAllowed,
  } = useAuthContext();
  const canList = isAllowed(PERM.SETTINGS_GENERAL.LIST);
  const canEdit = isAllowed(PERM.SETTINGS_GENERAL.EDIT);
  const { theme, setTheme, setFontSize } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<PreferencesForm>();

  const colors = {
    pageBg: isDark ? "#131b2e" : "#eee8dd",
    cardBg: isDark ? "#1b2436" : "#ffffff",
    text: isDark ? "#f5f5f5" : "#141414",
    secondaryText: isDark ? "#a6a6a6" : "#666666",
  };

  const { data: years = [], isLoading: isYearsLoading } = useQuery({
    queryKey: ["fiscal-year-options"],
    queryFn: async (): Promise<FiscalYearOption[]> => {
      const res = await api.get("/auth/fiscal-years");
      return res.data?.data ?? [];
    },
    staleTime: 0,
    refetchOnMount: "always",
    enabled: canList,
  });

  // Fill the form from the account once it has loaded.
  useEffect(() => {
    if (!user) return;
    form.setFieldsValue({
      fiscal_year_id: user.fiscal_year_id || undefined,
      theme: user.theme,
      font_size: user.font_size,
      language: user.language,
    });
  }, [user, form]);

  const { mutateAsync: savePreferences, isPending: isSaving } = useMutation({
    mutationFn: (payload: PreferencesForm) =>
      api.patch("/auth/preferences", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscal-year-options"] });
    },
  });

  const onFinish = async (values: PreferencesForm) => {
    try {
      await savePreferences(values);
      // apply right away, then refresh the account so every screen agrees
      setTheme(values.theme);
      setFontSize(values.font_size);
      await refetchUser();
      messageApi.success("Settings saved.");
    } catch (err) {
      const apiMessage = (
        err as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      messageApi.error(apiMessage || "Could not save settings.");
    }
  };

  if (!isUserLoading && !user) {
    return <Result status="403" title="403" subTitle="Please sign in again." />;
  }

  if (!isUserLoading && !canList) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="You don't have permission to view this."
      />
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
      }}
    >
      {contextHolder}
      <div
        style={{
          minHeight: "100vh",
          padding: 24,
          background: colors.pageBg,
          transition: "background 0.2s ease",
        }}
      >
        <Card
          loading={isUserLoading}
          title={
            <span style={{ color: colors.text, fontWeight: 600 }}>
              Preferences
            </span>
          }
          style={{ maxWidth: 560, background: colors.cardBg }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            disabled={!canEdit}
          >
            <Form.Item
              label={<span style={{ color: colors.text }}>Fiscal Year</span>}
              name="fiscal_year_id"
              extra={
                <Text style={{ color: colors.secondaryText }}>
                  The fiscal year you work in. New users are given the current
                  fiscal year automatically.
                </Text>
              }
            >
              <Select
                size="large"
                loading={isYearsLoading}
                placeholder="No active fiscal year"
                options={years.map((y) => ({
                  value: y.year_id,
                  label: `${y.name_bs || y.name_ad}${y.selected ? " (Current)" : ""}`,
                }))}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: colors.text }}>Theme</span>}
              name="theme"
            >
              <Segmented
                size="large"
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: colors.text }}>Font Size</span>}
              name="font_size"
            >
              <Segmented
                size="large"
                options={[
                  { value: "small", label: "Small" },
                  { value: "medium", label: "Medium" },
                  { value: "large", label: "Large" },
                ]}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: colors.text }}>Language</span>}
              name="language"
              style={{ marginBottom: 24 }}
            >
              <Segmented
                size="large"
                options={[
                  { value: "en", label: "English" },
                  { value: "ne", label: "नेपाली" },
                ]}
              />
            </Form.Item>

            {canEdit && (
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={isSaving}>
                  Save
                </Button>
              </Form.Item>
            )}
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default Settings;
