"use client";

import React, { useEffect, useState } from "react";
import { Button, Modal, Result, Select, Space, Tag, Typography, message } from "antd";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import CustomTable from "@/app/components/ui/CustomTable";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import {
  HELP_TYPE_OPTIONS,
  HelpType,
  Inquiry,
  InquiryStatus,
  STATUS_OPTIONS,
  useMutationInquiry,
  useQueryInquiries,
} from "./useInquiry";

const { Text } = Typography;

const InquiryManager: React.FC = () => {
  const { isAllowed } = useAuthContext();
  const canList = isAllowed(PERM.INQUIRY.LIST);
  const canUpdate = isAllowed(PERM.INQUIRY.UPDATE);
  const canDelete = isAllowed(PERM.INQUIRY.DELETE);
  const [messageApi, contextHolder] = message.useMessage();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<InquiryStatus | undefined>();
  const [helpType, setHelpType] = useState<HelpType | undefined>();
  const [viewing, setViewing] = useState<Inquiry | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, error } = useQueryInquiries(
    { page, pageSize, search: debouncedSearch, status, helpType },
    canList,
  );
  const { changeStatus, deleteInquiry, isChangingStatus, isDeleting } = useMutationInquiry();
  const items: Inquiry[] = data?.data ?? [];

  const updateStatus = async (id: string, next: InquiryStatus) => {
    try {
      await changeStatus({ id, status: next });
      setViewing((v) => (v && v.inquiry_id === id ? { ...v, status: next } : v));
      messageApi.success("Status updated.");
    } catch {
      messageApi.error("Failed to update the status.");
    }
  };

  const handleDelete = (record: Inquiry) => {
    Modal.confirm({
      title: `Delete the message from ${record.name}?`,
      content: "This cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        await deleteInquiry(record.inquiry_id);
        if (items.length === 1 && page > 1) setPage((p) => p - 1);
        setViewing(null);
        messageApi.success("Inquiry deleted.");
      },
    });
  };

  const statusTag = (s: InquiryStatus) => {
    const opt = STATUS_OPTIONS.find((o) => o.value === s);
    return <Tag color={opt?.color}>{opt?.label ?? s}</Tag>;
  };
  const helpLabel = (h: HelpType) => HELP_TYPE_OPTIONS.find((o) => o.value === h)?.label ?? h;

  const columns: ColumnsType<Inquiry> = [
    {
      title: "S.N",
      key: "sn",
      width: 70,
      render: (_t, _r, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: "From",
      key: "from",
      render: (_: unknown, r) => (
        <div>
          <Text strong>{r.name}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {r.phone}
              {r.email ? ` · ${r.email}` : ""}
            </Text>
          </div>
        </div>
      ),
    },
    { title: "Topic", dataIndex: "help_type", key: "help_type", width: 170, render: (h: HelpType) => helpLabel(h) },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
    },
    { title: "Status", dataIndex: "status", key: "status", width: 120, render: statusTag },
    {
      title: "Received",
      dataIndex: "created_at",
      key: "created_at",
      width: 170,
      render: (v: string) => new Date(v).toLocaleString(),
    },
    {
      title: "Action",
      key: "action",
      width: 190,
      render: (_: unknown, r) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => setViewing(r)}>
            View
          </Button>
          {canDelete && (
            <Button danger type="primary" icon={<DeleteOutlined />} loading={isDeleting} onClick={() => handleDelete(r)}>
              Delete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (error) return <Result title="Something went wrong" />;
  if (!canList) {
    return <Result status="403" title="403" subTitle="You do not have permission to view this." />;
  }

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}

      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Status"
          style={{ width: 160 }}
          value={status}
          options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
        <Select
          allowClear
          placeholder="Topic"
          style={{ width: 200 }}
          value={helpType}
          options={HELP_TYPE_OPTIONS}
          onChange={(v) => {
            setHelpType(v);
            setPage(1);
          }}
        />
        <Button
          onClick={() => {
            setSearch("");
            setStatus(undefined);
            setHelpType(undefined);
            setPage(1);
          }}
        >
          Reset
        </Button>
      </Space>

      <CustomTable
        rowKey="inquiry_id"
        columns={columns}
        dataSource={items}
        loading={isLoading}
        manualPagination
        total={data?.pagination?.total ?? 0}
        currentPage={page}
        initialPageSize={pageSize}
        searchPlaceholder="Search name, phone, email or message"
        onPageChange={(nextPage, nextPageSize) => {
          setPage(nextPage);
          setPageSize(nextPageSize);
        }}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />

      <Modal
        open={!!viewing}
        title={viewing ? `Message from ${viewing.name}` : ""}
        footer={null}
        onCancel={() => setViewing(null)}
      >
        {viewing && (
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <div>
              <Text type="secondary">Phone: </Text>
              <a href={`tel:${viewing.phone}`}>{viewing.phone}</a>
            </div>
            {viewing.email && (
              <div>
                <Text type="secondary">Email: </Text>
                <a href={`mailto:${viewing.email}`}>{viewing.email}</a>
              </div>
            )}
            <div>
              <Text type="secondary">Topic: </Text>
              {helpLabel(viewing.help_type)}
            </div>
            <div>
              <Text type="secondary">Received: </Text>
              {new Date(viewing.created_at).toLocaleString()}
            </div>
            {/* rendered as plain text by React, never as HTML */}
            <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: "rgba(0,0,0,0.04)", padding: 12, borderRadius: 8 }}>
              {viewing.message}
            </div>
            {canUpdate ? (
              <Select
                style={{ width: 200 }}
                value={viewing.status}
                loading={isChangingStatus}
                options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                onChange={(v) => updateStatus(viewing.inquiry_id, v)}
              />
            ) : (
              statusTag(viewing.status)
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default InquiryManager;
