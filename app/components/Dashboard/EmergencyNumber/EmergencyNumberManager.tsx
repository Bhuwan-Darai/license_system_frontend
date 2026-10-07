"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  ConfigProvider,
  Form,
  Input,
  Modal,
  Switch,
  Tag,
  Typography,
  Space,
  message,
  theme as antdTheme,
  Result,
} from "antd";

import {
  DeleteOutlined,
  EditOutlined,
  PhoneOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import type { ColumnsType } from "antd/es/table";

import { useQueryEmergencyNumber } from "./useQueryEmergencyNumber";
import { useMutationEmergencyNumber } from "./useMutationEmergencyNumber";
import { useTheme } from "@/app/context/ThemeContext";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import useModal from "@/app/hooks/useModalHook";
import CustomTable from "@/app/components/ui/CustomTable";

const { Text } = Typography;

type NumberData = {
  id: number;
  emergency_number_id: string;
  name: string;
  emergency_number: string;
  display: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
};

const EmergencyNumberManager: React.FC = () => {
  const { isAllowed } = useAuthContext();
  const canList = isAllowed(PERM.EMERGENCY_NUMBER.LIST);
  const canAdd = isAllowed(PERM.EMERGENCY_NUMBER.ADD);
  const canUpdate = isAllowed(PERM.EMERGENCY_NUMBER.UPDATE);
  const canDelete = isAllowed(PERM.EMERGENCY_NUMBER.DELETE);
  const [messageApi, contextHolder] = message.useMessage();

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1); // reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { number, isLoading, error } = useQueryEmergencyNumber(
    page,
    pageSize,
    debouncedSearch,
    canList,
  );

  const {
    addNumber,
    updateNumber,
    deleteNumber,
    isAdding,
    isUpdating,
    isDeleting,
  } = useMutationEmergencyNumber();

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { open, showModal, hideModal } = useModal();

  const [editingItem, setEditingItem] = useState<NumberData | null>(null);
  const [form] = Form.useForm();

  const colors = {
    pageBg: isDark ? "#131b2e" : "#eee8dd",
    cardBg: isDark ? "#1b2436" : "#ffffff",
    cardBorder: isDark ? "#2a3446" : "#f0f0f0",

    text: isDark ? "#f5f5f5" : "#141414",
    secondaryText: isDark ? "#a6a6a6" : "#666666",

    inputBg: isDark ? "#0f1626" : "#ffffff",
    inputBorder: isDark ? "#2a3446" : "#d9d9d9",
    inputText: isDark ? "#f5f5f5" : "#141414",
    inputPlaceholder: isDark ? "#6b7280" : "#bfbfbf",

    modalBg: isDark ? "#1b2436" : "#ffffff",
    modalHeaderBg: isDark ? "#1b2436" : "#ffffff",
    modalFooterBg: isDark ? "#1b2436" : "#ffffff",

    tagHiddenBg: isDark ? "#2a3446" : "#fafafa",
    tagHiddenBorder: isDark ? "#3a465c" : "#d9d9d9",
    tagHiddenText: isDark ? "#c9c9c9" : "#595959",
  };

  const numbers: NumberData[] = number?.data ?? [];
  const pagination = number?.pagination; // { total, page, pageSize, ... } — adjust to match your API

  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ display: true });
    showModal();
  };

  const handleEdit = (item: NumberData) => {
    setEditingItem(item);
    form.setFieldsValue({
      name: item.name,
      number: item.emergency_number,
      display: item.display,
    });
    showModal();
  };

  const handleClose = () => {
    form.resetFields();
    setEditingItem(null);
    hideModal();
  };

  const onFinish = async (values: {
    name: string;
    number: string;
    display: boolean;
  }) => {
    const payload = {
      name: values.name,
      number: values.number,
      display: values.display,
    };

    if (editingItem) {
      await updateNumber({
        emergency_number_id: editingItem.emergency_number_id,
        payload,
      });
      handleClose();
      message.success("Emergency number updated successfully.");
    } else {
      await addNumber(payload);
      handleClose();
      message.success("Emergency number added successfully.");
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this emergency number?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        await deleteNumber(id);

        // If we just deleted the last row on the last page, step back one page
        if (numbers.length === 1 && page > 1) {
          setPage((prev) => prev - 1);
        }

        messageApi.success("Emergency number deleted successfully.");
      },
    });
  };

  const handleDisplayChange = async (item: NumberData, display: boolean) => {
    try {
      await updateNumber({
        emergency_number_id: item.emergency_number_id,
        payload: {
          name: item.name,
          number: item.emergency_number,
          display,
        },
      });
      messageApi.success(
        display
          ? "Emergency number is now visible."
          : "Emergency number is now hidden.",
      );
    } catch {
      messageApi.error("Failed to update display status.");
    }
  };

  const columns: ColumnsType<NumberData> = [
    {
      title: "S.N",
      key: "S.N",
      width: 70,
      render: (_text, _record, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: "Service",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isDark ? "rgba(22, 119, 255, 0.15)" : "#eaf3ff",
            }}
          >
            <PhoneOutlined style={{ color: "#1677ff", fontSize: 14 }} />
          </div>
          <Text strong style={{ color: colors.text }}>
            {name}
          </Text>
        </Space>
      ),
    },
    {
      title: "Phone Number",
      dataIndex: "emergency_number",
      key: "emergency_number",
      render: (value: string) => (
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
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (value: string) => (
        <Text style={{ color: colors.secondaryText }}>
          {value ? new Date(value).toLocaleDateString() : "—"}
        </Text>
      ),
    },
    ...(canUpdate || canDelete
      ? [
          {
            title: "Action",
            key: "action",
            width: 180,
            render: (_: unknown, record: NumberData) => (
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
                    onClick={() => handleDelete(record.emergency_number_id)}
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

  const isSubmitting = isAdding || isUpdating;

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  if (error) {
    return <Result title={"Something went wrong"} />;
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
              Add Number
            </Button>
          )}
        </div>

        <CustomTable
          rowKey="emergency_number_id"
          columns={columns}
          dataSource={numbers}
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
              {editingItem ? "Edit Emergency Number" : "Add Emergency Number"}
            </span>
          }
          open={open}
          footer={null}
          onCancel={handleClose}
          centered
          width={480}
          destroyOnHidden
          styles={{
            container: { background: colors.modalBg },
            header: { background: colors.modalHeaderBg },
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
              label={<span style={{ color: colors.text }}>Name</span>}
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please enter the emergency service name",
                },
                { max: 100, message: "Name cannot exceed 100 characters" },
              ]}
            >
              <Input
                size="large"
                placeholder="e.g. Nepal Police"
                style={{
                  background: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.inputText,
                }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: colors.text }}>Phone Number</span>}
              name="number"
              rules={[
                { required: true, message: "Please enter the phone number" },
                {
                  pattern: /^\d{10}$/,
                  message: "Phone number must be exactly 10 digits",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="e.g. 9800000000"
                prefix={<PhoneOutlined />}
                maxLength={10}
                style={{
                  background: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.inputText,
                }}
              />
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
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
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

export default EmergencyNumberManager;
