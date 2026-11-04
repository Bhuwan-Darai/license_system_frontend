"use client";

import React, { useEffect, useState } from "react";
import { Alert, Button, Input, Popconfirm, Result, Select, Space, Table, Tag, Typography, message } from "antd";
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { useAuthContext } from "@/app/context/AuthContext";
import { ErrorLog, ErrorSource, useMutationErrorLogs, useQueryErrorLogs } from "./useErrorLogs";

const { Text } = Typography;

const SOURCE_OPTIONS: { value: ErrorSource; label: string; color: string }[] = [
  { value: "database", label: "Database", color: "red" },
  { value: "http", label: "Server (5xx)", color: "volcano" },
];

// text only: payloads and SQL come from requests, never rendered as HTML
const block = (title: string, value: string, danger = false) =>
  value ? (
    <div style={{ marginBottom: 12 }}>
      <Text strong type={danger ? "danger" : undefined}>
        {title}
      </Text>
      <pre
        style={{
          margin: "4px 0 0",
          padding: 10,
          borderRadius: 6,
          background: danger ? "#fff1f0" : "#f6f6f6",
          border: danger ? "1px solid #ffa39e" : "1px solid #e8e8e8",
          color: danger ? "#a8071a" : "#262626",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: 12,
          maxHeight: 280,
          overflow: "auto",
        }}
      >
        {value}
      </pre>
    </div>
  ) : null;

const ErrorLogs: React.FC = () => {
  const { isAllowed } = useAuthContext();
  const canList = isAllowed("SETTINGS_ERROR_LOG_LIST");
  const canDelete = isAllowed("SETTINGS_ERROR_LOG_DELETE");
  const [messageApi, contextHolder] = message.useMessage();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [source, setSource] = useState<ErrorSource | undefined>();

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching, refetch, error } = useQueryErrorLogs(
    { page, pageSize, search: debounced, source },
    canList,
  );
  const { deleteLog, clearLogs, isClearing } = useMutationErrorLogs();

  if (!canList) {
    return <Result status="403" title="403" subTitle="You do not have permission to view this." />;
  }

  const errMsg = (e: unknown, fallback: string) =>
    (e as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;

  const columns: ColumnsType<ErrorLog> = [
    {
      title: "Time",
      dataIndex: "created_at",
      width: 170,
      render: (v: string) => new Date(v).toLocaleString(),
    },
    {
      title: "Type",
      dataIndex: "source",
      width: 130,
      render: (s: ErrorSource) => {
        const o = SOURCE_OPTIONS.find((x) => x.value === s);
        return <Tag color={o?.color}>{o?.label ?? s}</Tag>;
      },
    },
    {
      title: "Request",
      key: "request",
      render: (_: unknown, r) =>
        r.path ? (
          <Space direction="vertical" size={0}>
            <Text code>
              {r.method} {r.path}
            </Text>
            {r.status ? <Text type="danger">HTTP {r.status}</Text> : null}
          </Space>
        ) : (
          <Text type="secondary">Background / no request</Text>
        ),
    },
    {
      title: "Error",
      key: "error",
      render: (_: unknown, r) => (
        <div>
          <Text strong>{r.message}</Text>
          {r.error ? (
            <div>
              <Text type="danger" style={{ fontSize: 12 }}>
                {r.error.length > 140 ? `${r.error.slice(0, 140)}...` : r.error}
              </Text>
            </div>
          ) : null}
        </div>
      ),
    },
    ...(canDelete
      ? [
          {
            title: "",
            key: "action",
            width: 70,
            render: (_: unknown, r: ErrorLog) => (
              <Popconfirm
                title="Delete this error log?"
                okText="Delete"
                okButtonProps={{ danger: true }}
                onConfirm={async () => {
                  try {
                    await deleteLog(r.id);
                    messageApi.success("Error log deleted.");
                  } catch (e) {
                    messageApi.error(errMsg(e, "Failed to delete the error log."));
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
            placeholder="Search path, message, error or SQL"
            style={{ width: 300 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            allowClear
            placeholder="Type"
            style={{ width: 170 }}
            value={source}
            options={SOURCE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            onChange={(v) => {
              setSource(v);
              setPage(1);
            }}
          />
          <Button icon={<ReloadOutlined />} loading={isFetching} onClick={() => refetch()}>
            Refresh
          </Button>
        </Space>

        {canDelete && (
          <Popconfirm
            title="Delete all error logs?"
            description="This cannot be undone."
            okText="Delete all"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              try {
                await clearLogs();
                setPage(1);
                messageApi.success("Error logs cleared.");
              } catch (e) {
                messageApi.error(errMsg(e, "Failed to clear the error logs."));
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
        <Alert type="error" showIcon message="Could not load the error logs." style={{ marginBottom: 16 }} />
      ) : null}

      <Table<ErrorLog>
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
          showTotal: (t) => `${t} errors`,
          onChange: (p, s) => {
            setPage(p);
            setPageSize(s);
          },
        }}
        locale={{ emptyText: "No errors recorded" }}
        expandable={{
          expandedRowRender: (r) => (
            <div>
              {block("Error", r.error, true)}
              {block("SQL statement", r.query)}
              {block("Where in the code", r.location)}
              {block("Request payload", r.payload)}
              {block("Response", r.response)}
              <Text type="secondary" style={{ fontSize: 12 }}>
                {r.ip ? `IP ${r.ip}` : ""}
              </Text>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default ErrorLogs;
