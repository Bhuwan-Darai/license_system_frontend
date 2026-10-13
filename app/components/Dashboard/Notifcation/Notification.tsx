"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  ConfigProvider,
  Form,
  Input,
  Modal,
  Result,
  Space,
  Tag,
  Typography,
  message,
  theme as antdTheme,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  MailOutlined,
  MobileOutlined,
  PlusOutlined,
  SendOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { useQueryNotification } from "./useQueryNotification";
import {
  useMutationNotification,
  type NotificationItem,
  type NotificationPayload,
  type NotificationStatus,
} from "./useMutationNotification";
import { useTheme } from "@/app/context/ThemeContext";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import useModal from "@/app/hooks/useModalHook";
import CustomTable from "@/app/components/ui/CustomTable";

const { Text } = Typography;

const STATUS_TAG: Record<NotificationStatus, { color: string; label: string }> =
  {
    DRAFT: { color: "default", label: "Draft" },
    SENDING: { color: "processing", label: "Sending" },
    SENT: { color: "green", label: "Sent" },
    FAILED: { color: "red", label: "Failed" },
  };

interface NotificationForm {
  title: string;
  message: string;
  channels: ("email" | "push")[];
}

const apiMessage = (err: unknown) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;

const Notification: React.FC = () => {
  const { isAllowed } = useAuthContext();
  const canList = isAllowed(PERM.NOTIFICATION.LIST);
  const canAdd = isAllowed(PERM.NOTIFICATION.CREATE);
  const canUpdate = isAllowed(PERM.NOTIFICATION.EDIT);
  const canDelete = isAllowed(PERM.NOTIFICATION.DELETE);
  const canSend = isAllowed(PERM.NOTIFICATION.SEND);
  const [messageApi, contextHolder] = message.useMessage();

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { notifications, isLoading, error } = useQueryNotification(
    page,
    pageSize,
    debouncedSearch,
    canList,
  );
  const {
    addNotification,
    updateNotification,
    sendNotification,
    deleteNotification,
    isAdding,
    isUpdating,
    isSending,
    isDeleting,
  } = useMutationNotification();

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { open, showModal, hideModal } = useModal();

  const [editingItem, setEditingItem] = useState<NotificationItem | null>(null);
  const [form] = Form.useForm<NotificationForm>();

  const colors = {
    pageBg: isDark ? "#131b2e" : "#eee8dd",
    text: isDark ? "#f5f5f5" : "#141414",
    secondaryText: isDark ? "#a6a6a6" : "#666666",
    inputBg: isDark ? "#0f1626" : "#ffffff",
    inputBorder: isDark ? "#2a3446" : "#d9d9d9",
    inputText: isDark ? "#f5f5f5" : "#141414",
    inputPlaceholder: isDark ? "#6b7280" : "#bfbfbf",
    modalBg: isDark ? "#1b2436" : "#ffffff",
  };

  const inputStyle = {
    background: colors.inputBg,
    borderColor: colors.inputBorder,
    color: colors.inputText,
  };

  const rows: NotificationItem[] = notifications?.data ?? [];
  const pagination = notifications?.pagination;

  // a notification that has gone out (or is going out) cannot change
  const isEditable = (item: NotificationItem) =>
    item.status === "DRAFT" || item.status === "FAILED";

  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ channels: ["email", "push"] });
    showModal();
  };

  const handleEdit = (item: NotificationItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      title: item.title,
      message: item.message,
      channels: [
        ...(item.send_email ? (["email"] as const) : []),
        ...(item.send_push ? (["push"] as const) : []),
      ],
    });
    showModal();
  };

  const handleClose = () => {
    form.resetFields();
    setEditingItem(null);
    hideModal();
  };

  const toPayload = (
    values: NotificationForm,
    sendNow: boolean,
  ): NotificationPayload => ({
    title: values.title,
    message: values.message,
    send_email: values.channels.includes("email"),
    send_push: values.channels.includes("push"),
    send_now: sendNow,
  });

  const save = async (sendNow: boolean) => {
    let values: NotificationForm;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    try {
      if (editingItem) {
        await updateNotification({
          notification_id: editingItem.notification_id,
          payload: toPayload(values, false),
        });
        if (sendNow) {
          await sendNotification(editingItem.notification_id);
          messageApi.success("Updated and sending.");
        } else {
          messageApi.success("Updated successfully.");
        }
      } else {
        await addNotification(toPayload(values, sendNow));
        messageApi.success(sendNow ? "Saved and sending." : "Saved as draft.");
      }
      handleClose();
    } catch (err) {
      messageApi.error(
        apiMessage(err) || "Could not save. Please check the fields.",
      );
    }
  };

  const handleSend = (item: NotificationItem) => {
    const channels = [
      item.send_email ? "email" : null,
      item.send_push ? "push notification" : null,
    ]
      .filter(Boolean)
      .join(" and ");

    Modal.confirm({
      title: `Send "${item.title}" to all app users?`,
      content: `It will go out by ${channels}. This cannot be undone.`,
      okText: "Yes, Send",
      onOk: async () => {
        try {
          await sendNotification(item.notification_id);
          messageApi.success("Sending started.");
        } catch (err) {
          messageApi.error(apiMessage(err) || "Failed to send.");
        }
      },
    });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this notification?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteNotification(id);
          if (rows.length === 1 && page > 1) {
            setPage((prev) => prev - 1);
          }
          messageApi.success("Deleted successfully.");
        } catch (err) {
          messageApi.error(apiMessage(err) || "Failed to delete.");
        }
      },
    });
  };

  const columns: ColumnsType<NotificationItem> = [
    {
      title: "S.N",
      key: "sn",
      width: 70,
      render: (_t, _r, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: "Notification",
      key: "title",
      render: (_: unknown, record) => (
        <Space direction="vertical" size={0} style={{ maxWidth: 420 }}>
          <Text strong style={{ color: colors.text }}>
            {record.title}
          </Text>
          <Text
            ellipsis
            style={{ color: colors.secondaryText, maxWidth: 420 }}
          >
            {record.message}
          </Text>
        </Space>
      ),
    },
    {
      title: "Channels",
      key: "channels",
      width: 190,
      render: (_: unknown, record) => (
        <Space size={4} wrap>
          {record.send_email && (
            <Tag color="blue" icon={<MailOutlined />}>
              Email
            </Tag>
          )}
          {record.send_push && (
            <Tag color="purple" icon={<MobileOutlined />}>
              Push
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: NotificationStatus) => (
        <Tag color={STATUS_TAG[status]?.color}>
          {STATUS_TAG[status]?.label ?? status}
        </Tag>
      ),
    },
    {
      title: "Delivered",
      key: "delivered",
      width: 190,
      render: (_: unknown, record) => {
        if (record.status === "DRAFT") {
          return <Text style={{ color: colors.secondaryText }}>—</Text>;
        }
        return (
          <Space direction="vertical" size={0}>
            {record.send_email && (
              <Text style={{ color: colors.secondaryText }}>
                Email: {record.email_sent}
                {record.email_failed > 0 && ` (${record.email_failed} failed)`}
              </Text>
            )}
            {record.send_push && (
              <Text style={{ color: colors.secondaryText }}>
                Push: {record.push_sent}
                {record.push_failed > 0 && ` (${record.push_failed} failed)`}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: "Sent At",
      dataIndex: "sent_at",
      key: "sent_at",
      width: 170,
      render: (value: string | null) => (
        <Text style={{ color: colors.secondaryText }}>
          {value ? new Date(value).toLocaleString() : "—"}
        </Text>
      ),
    },
    ...(canSend || canUpdate || canDelete
      ? [
          {
            title: "Action",
            key: "action",
            width: 320,
            render: (_: unknown, record: NotificationItem) => (
              <Space>
                {canSend && isEditable(record) && (
                  <Button
                    icon={<SendOutlined />}
                    loading={isSending}
                    onClick={() => handleSend(record)}
                  >
                    {record.status === "FAILED" ? "Retry" : "Send"}
                  </Button>
                )}
                {canUpdate && isEditable(record) && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                  >
                    Edit
                  </Button>
                )}
                {canDelete && record.status !== "SENDING" && (
                  <Button
                    danger
                    type="primary"
                    icon={<DeleteOutlined />}
                    loading={isDeleting}
                    onClick={() => handleDelete(record.notification_id)}
                  >
                    Delete
                  </Button>
                )}
              </Space>
            ),
          },
        ]
      : []),
  ];

  if (error) {
    return <Result title="Something went wrong" />;
  }

  if (!canList) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="You don't have permission to view this."
      />
    );
  }

  const saving = isAdding || isUpdating || isSending;

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
        token: {
          colorBgElevated: colors.modalBg,
          colorBgContainer: colors.inputBg,
          colorBorder: colors.inputBorder,
          colorText: colors.text,
          colorTextPlaceholder: colors.inputPlaceholder,
        },
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
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          {canAdd && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              New Notification
            </Button>
          )}
        </div>

        <CustomTable
          rowKey="notification_id"
          columns={columns}
          dataSource={rows}
          loading={isLoading}
          manualPagination
          total={pagination?.total ?? 0}
          currentPage={page}
          initialPageSize={pageSize}
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
          title={
            <span style={{ color: colors.text, fontSize: 18, fontWeight: 600 }}>
              {editingItem ? "Edit Notification" : "New Notification"}
            </span>
          }
          open={open}
          footer={null}
          onCancel={handleClose}
          centered
          width={620}
          destroyOnHidden
          styles={{
            container: { background: colors.modalBg },
            header: { background: colors.modalBg },
            body: { background: colors.modalBg },
          }}
        >
          <Form form={form} layout="vertical" requiredMark="optional">
            <Form.Item
              label={<span style={{ color: colors.text }}>Title</span>}
              name="title"
              extra="Used as the email subject and the push notification title."
              rules={[
                { required: true, message: "Please enter a title" },
                { max: 255, message: "Title cannot exceed 255 characters" },
              ]}
            >
              <Input size="large" style={inputStyle} />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: colors.text }}>Message</span>}
              name="message"
              rules={[{ required: true, message: "Please enter the message" }]}
            >
              <Input.TextArea rows={5} style={inputStyle} />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: colors.text }}>Send via</span>}
              name="channels"
              extra="Goes to every approved app user."
              rules={[
                {
                  validator: (_, value?: string[]) =>
                    value && value.length > 0
                      ? Promise.resolve()
                      : Promise.reject(new Error("Choose at least one channel")),
                },
              ]}
              style={{ marginBottom: 24 }}
            >
              <Checkbox.Group
                options={[
                  { value: "email", label: "Email" },
                  { value: "push", label: "Push notification (app)" },
                ]}
              />
            </Form.Item>

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}
            >
              <Button onClick={handleClose}>Cancel</Button>
              <Button loading={saving} onClick={() => save(false)}>
                {editingItem ? "Update" : "Save as Draft"}
              </Button>
              {canSend && (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={saving}
                  onClick={() => save(true)}
                >
                  {editingItem ? "Update & Send" : "Save & Send"}
                </Button>
              )}
            </div>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default Notification;
