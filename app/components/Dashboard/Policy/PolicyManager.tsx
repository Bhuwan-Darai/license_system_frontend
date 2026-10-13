"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  ConfigProvider,
  Form,
  Input,
  InputNumber,
  Modal,
  Result,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  message,
  theme as antdTheme,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { useQueryPolicy } from "./useQueryPolicy";
import {
  useMutationPolicy,
  type Policy,
  type PolicyPayload,
  type PolicyType,
} from "./useMutationPolicy";
import { useTheme } from "@/app/context/ThemeContext";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import useModal from "@/app/hooks/useModalHook";
import CustomTable from "@/app/components/ui/CustomTable";
import TextEditor from "@/app/components/ui/TextEditor";

const { Text } = Typography;

const TYPE_LABEL: Record<PolicyType, string> = {
  POLICY: "Policy",
  ABOUT_US: "About Us",
};

const PolicyManager: React.FC = () => {
  const { isAllowed } = useAuthContext();
  const canList = isAllowed(PERM.POLICY.LIST);
  const canAdd = isAllowed(PERM.POLICY.CREATE);
  const canUpdate = isAllowed(PERM.POLICY.EDIT);
  const canDelete = isAllowed(PERM.POLICY.DELETE);
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

  const { policies, isLoading, error } = useQueryPolicy(
    page,
    pageSize,
    debouncedSearch,
    canList,
  );
  const {
    addPolicy,
    updatePolicy,
    deletePolicy,
    isAdding,
    isUpdating,
    isDeleting,
  } = useMutationPolicy();

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { open, showModal, hideModal } = useModal();

  const [editingItem, setEditingItem] = useState<Policy | null>(null);
  const [form] = Form.useForm<PolicyPayload>();

  const colors = {
    pageBg: isDark ? "#131b2e" : "#eee8dd",
    text: isDark ? "#f5f5f5" : "#141414",
    secondaryText: isDark ? "#a6a6a6" : "#666666",
    inputBg: isDark ? "#0f1626" : "#ffffff",
    inputBorder: isDark ? "#2a3446" : "#d9d9d9",
    inputText: isDark ? "#f5f5f5" : "#141414",
    inputPlaceholder: isDark ? "#6b7280" : "#bfbfbf",
    modalBg: isDark ? "#1b2436" : "#ffffff",
    tagHiddenBg: isDark ? "#2a3446" : "#fafafa",
    tagHiddenBorder: isDark ? "#3a465c" : "#d9d9d9",
    tagHiddenText: isDark ? "#c9c9c9" : "#595959",
  };

  const rows: Policy[] = policies?.data ?? [];
  const pagination = policies?.pagination;

  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ page_type: "POLICY", sort_order: 0, display: true });
    showModal();
  };

  const handleEdit = (item: Policy) => {
    setEditingItem(item);
    form.setFieldsValue({
      title: item.title,
      content: item.content,
      page_type: item.page_type,
      sort_order: item.sort_order,
      display: item.display,
    });
    showModal();
  };

  const handleClose = () => {
    form.resetFields();
    setEditingItem(null);
    hideModal();
  };

  const onFinish = async (values: PolicyPayload) => {
    const payload: PolicyPayload = {
      title: values.title,
      content: values.content,
      page_type: values.page_type,
      sort_order: values.sort_order ?? 0,
      display: values.display,
    };

    try {
      if (editingItem) {
        await updatePolicy({ policy_id: editingItem.policy_id, payload });
        messageApi.success("Updated successfully.");
      } else {
        await addPolicy(payload);
        messageApi.success("Added successfully.");
      }
      handleClose();
    } catch {
      messageApi.error("Could not save. Please check the fields and try again.");
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this page?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        await deletePolicy(id);
        if (rows.length === 1 && page > 1) {
          setPage((prev) => prev - 1);
        }
        messageApi.success("Deleted successfully.");
      },
    });
  };

  const handleDisplayChange = async (item: Policy, display: boolean) => {
    try {
      await updatePolicy({
        policy_id: item.policy_id,
        payload: {
          title: item.title,
          content: item.content,
          page_type: item.page_type,
          sort_order: item.sort_order,
          display,
        },
      });
      messageApi.success(display ? "Page is now visible." : "Page is now hidden.");
    } catch {
      messageApi.error("Failed to update display status.");
    }
  };

  const columns: ColumnsType<Policy> = [
    {
      title: "S.N",
      key: "sn",
      width: 70,
      render: (_t, _r, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title: string) => (
        <Text strong style={{ color: colors.text }}>
          {title}
        </Text>
      ),
    },
    {
      title: "Type",
      dataIndex: "page_type",
      key: "page_type",
      width: 120,
      render: (type: PolicyType) => (
        <Tag color={type === "ABOUT_US" ? "blue" : "purple"}>
          {TYPE_LABEL[type] ?? type}
        </Tag>
      ),
    },
    {
      title: "Order",
      dataIndex: "sort_order",
      key: "sort_order",
      width: 90,
      render: (value: number) => (
        <Text style={{ color: colors.secondaryText }}>{value}</Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "display",
      key: "display",
      width: 140,
      render: (display: boolean, record) => (
        <Space>
          {display ? (
            <Tag color="green">Visible</Tag>
          ) : (
            <Tag
              style={{
                background: colors.tagHiddenBg,
                borderColor: colors.tagHiddenBorder,
                color: colors.tagHiddenText,
              }}
            >
              Hidden
            </Tag>
          )}
          <Switch
            size="small"
            checked={display}
            loading={isUpdating}
            disabled={!canUpdate}
            onChange={(checked) => handleDisplayChange(record, checked)}
          />
        </Space>
      ),
    },
    {
      title: "Last Updated",
      key: "updated",
      width: 160,
      render: (_: unknown, record) => {
        const value = record.updated_at || record.created_at;
        return (
          <Text style={{ color: colors.secondaryText }}>
            {value ? new Date(value).toLocaleDateString() : "—"}
          </Text>
        );
      },
    },
    ...(canUpdate || canDelete
      ? [
          {
            title: "Action",
            key: "action",
            width: 180,
            render: (_: unknown, record: Policy) => (
              <Space>
                {canUpdate && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                  >
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button
                    danger
                    type="primary"
                    icon={<DeleteOutlined />}
                    loading={isDeleting}
                    onClick={() => handleDelete(record.policy_id)}
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
              Add Page
            </Button>
          )}
        </div>

        <CustomTable
          rowKey="policy_id"
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
              {editingItem ? "Edit Page" : "Add Page"}
            </span>
          }
          open={open}
          footer={null}
          onCancel={handleClose}
          centered
          width={820}
          destroyOnHidden
          styles={{
            container: { background: colors.modalBg },
            header: { background: colors.modalBg },
            body: { background: colors.modalBg },
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark="optional"
          >
            <Form.Item
              label={<span style={{ color: colors.text }}>Title</span>}
              name="title"
              rules={[
                { required: true, message: "Please enter a title" },
                { max: 255, message: "Title cannot exceed 255 characters" },
              ]}
            >
              <Input
                size="large"
                placeholder="e.g. Privacy Policy"
                style={{
                  background: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.inputText,
                }}
              />
            </Form.Item>

            <div style={{ display: "flex", gap: 16 }}>
              <Form.Item
                label={<span style={{ color: colors.text }}>Page Type</span>}
                name="page_type"
                style={{ flex: 1 }}
                extra="The app shows the most recently updated visible About Us page."
              >
                <Select
                  size="large"
                  options={[
                    { value: "POLICY", label: "Policy" },
                    { value: "ABOUT_US", label: "About Us" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: colors.text }}>Order</span>}
                name="sort_order"
                style={{ width: 140 }}
                extra="Lower shows first."
              >
                <InputNumber size="large" min={0} style={{ width: "100%" }} />
              </Form.Item>
            </div>

            <Form.Item
              label={<span style={{ color: colors.text }}>Content</span>}
              name="content"
              rules={[{ required: true, message: "Please enter the content" }]}
            >
              <TextEditor />
            </Form.Item>

            <Form.Item
              label={
                <span style={{ color: colors.text }}>Display to Users</span>
              }
              name="display"
              valuePropName="checked"
              style={{ marginBottom: 24 }}
            >
              <Switch checkedChildren="Visible" unCheckedChildren="Hidden" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                }}
              >
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isAdding || isUpdating}
                >
                  {editingItem ? "Update" : "Add"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default PolicyManager;
