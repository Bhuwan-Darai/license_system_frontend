"use client";

import React, { useEffect, useState } from "react";
import { Alert, Button, Input, Popconfirm, Result, Select, Space, Table, Tag, Typography, message } from "antd";
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { useAuthContext } from "@/app/context/AuthContext";
import { EmailLog, EmailStatus, useMutationEmailLogs, useQueryEmailLogs } from "./useEmailLogs";

const { Text } = Typography;

const STATUS_OPTIONS: { value: EmailStatus; label: string; color: string }[] = [
  { value: "sent", label: "Sent", color: "green" },
  { value: "failed", label: "Failed", color: "red" },
];

const PURPOSE_LABELS: Record<string, string> = {
  register_otp: "Registration OTP",
  resend_otp: "Resend OTP",
  login_otp: "Login OTP",
  notification: "Notification",
};

const EmailLogs: React.FC = () => {
  const { isAllowed } = useAuthContext();
  const canList = isAllowed("SETTINGS_EMAIL_LOG_LIST");
  const canDelete = isAllowed("SETTINGS_EMAIL_LOG_DELETE");
  const [messageApi, contextHolder] = message.useMessage();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState<EmailStatus | undefined>();

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching, refetch, error } = useQueryEmailLogs(
    { page, pageSize, search: debounced, status },
    canList,
  );
  const { deleteLog, clearLogs, isClearing } = useMutationEmailLogs();

  if (!canList) {
    return <Result status="403" title="403" subTitle="You do not have permission to view this." />;
  }

  const errMsg = (e: unknown, fallback: string) =>
    (e as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;

  const columns: ColumnsType<EmailLog> = [
    {
      title: "Time",
      dataIndex: "created_at",
      width: 170,
      render: (v: string) => new Date(v).toLocaleString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 100,
      render: (s: EmailStatus) => {
        const o = STATUS_OPTIONS.find((x) => x.value === s);
        return <Tag color={o?.color}>{o?.label ?? s}</Tag>;
      },
    },
    {
      title: "User",
      key: "user",
      render: (_: unknown, r) =>
        r.user_id ? (
          <Space direction="vertical" size={0}>
            {r.user_name ? <Text strong>{r.user_name}</Text> : null}
            <Text type="secondary" copyable={{ text: r.user_id }} style={{ fontSize: 12 }}>
              {r.user_id}
            </Text>
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    { title: "To", dataIndex: "recipient" },
    {
      title: "Type",
      dataIndex: "purpose",
      width: 150,
      render: (p: string) => PURPOSE_LABELS[p] ?? p,
    },
    { title: "Subject", dataIndex: "subject", ellipsis: true },
    ...(canDelete
      ? [
          {
            title: "",
            key: "action",
            width: 70,
            render: (_: unknown, r: EmailLog) => (
              <Popconfirm
                title="Delete this email log?"
                okText="Delete"
                okButtonProps={{ danger: true }}
                onConfirm={async () => {
                  try {
                    await deleteLog(r.id);
                    messageApi.success("Email log deleted.");
                  } catch (e) {
                    messageApi.error(errMsg(e, "Failed to delete the email log."));
                  }
                }}
              >
                <Button danger size="small" icon={<DeleteOutlined />} />
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}

      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <Space wrap>
          <Input.Search
            allowClear
            placeholder="Search email, subject, user id or error"
            style={{ width: 300 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            allowClear
            placeholder="Status"
            style={{ width: 150 }}
            value={status}
            options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          />
          <Button icon={<ReloadOutlined />} loading={isFetching} onClick={() => refetch()}>
            Refresh
          </Button>
        </Space>

        {canDelete && (
          <Popconfirm
            title="Delete all email logs?"
            description="This cannot be undone."
            okText="Delete all"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              try {
                await clearLogs();
                setPage(1);
                messageApi.success("Email logs cleared.");
              } catch (e) {
                messageApi.error(errMsg(e, "Failed to clear the email logs."));
              }
            }}
          >
            <Button danger loading={isClearing} icon={<DeleteOutlined />}>
              Clear all
            </Button>
          </Popconfirm>
        )}
      </div>

      {error ? (
        <Alert type="error" showIcon message="Could not load the email logs." style={{ marginBottom: 16 }} />
      ) : null}

      <Table<EmailLog>
        rowKey="id"
        columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        scroll={{ x: 900 }}
        pagination={{
          current: page,
          pageSize,
          total: data?.pagination?.total ?? 0,
          showSizeChanger: true,
          showTotal: (t) => `${t} emails`,
          onChange: (p, s) => {
            setPage(p);
            setPageSize(s);
          },
        }}
        locale={{ emptyText: "No emails recorded" }}
        expandable={{
          rowExpandable: (r) => !!r.error,
          // text only: the error comes from the mail server, never rendered as HTML
          expandedRowRender: (r) => (
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontSize: 12,
                color: "#a8071a",
              }}
            >
              {r.error}
            </pre>
          ),
        }}
      />
    </div>
  );
};

export default EmailLogs;
