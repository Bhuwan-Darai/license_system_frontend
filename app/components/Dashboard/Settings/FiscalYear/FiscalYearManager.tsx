"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Modal,
  Result,
  Space,
  Switch,
  Tag,
  Typography,
  message,
  theme as antdTheme,
} from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import NepaliDate from "nepali-date-converter";

import { useQueryFiscalYear } from "./useQueryFiscalYear";
import {
  useMutationFiscalYear,
  type FiscalYear,
  type FiscalYearPayload,
} from "./useMutationFiscalYear";
import { useTheme } from "@/app/context/ThemeContext";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import useModal from "@/app/hooks/useModalHook";
import CustomTable from "@/app/components/ui/CustomTable";

const { Text } = Typography;

const DATE_FORMAT = "YYYY-MM-DD";

interface FiscalYearForm {
  name_ad: string;
  name_bs: string;
  range: [Dayjs, Dayjs];
  start_date_bs: string;
  end_date_bs: string;
  active: boolean;
}

/** AD date -> BS date string, or "" when it is outside the supported range. */
const toBS = (date: Dayjs): string => {
  try {
    return new NepaliDate(date.toDate()).format(DATE_FORMAT);
  } catch {
    return "";
  }
};

const FiscalYearManager: React.FC = () => {
  const { isAllowed } = useAuthContext();
  const canList = isAllowed(PERM.FISCAL_YEAR.LIST);
  const canAdd = isAllowed(PERM.FISCAL_YEAR.CREATE);
  const canUpdate = isAllowed(PERM.FISCAL_YEAR.EDIT);
  const canDelete = isAllowed(PERM.FISCAL_YEAR.DELETE);
  const canSelect = isAllowed(PERM.FISCAL_YEAR.SELECT);
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

  const { fiscalYears, isLoading, error } = useQueryFiscalYear(
    page,
    pageSize,
    debouncedSearch,
    canList,
  );
  const {
    addFiscalYear,
    updateFiscalYear,
    selectFiscalYear,
    deleteFiscalYear,
    isAdding,
    isUpdating,
    isSelecting,
    isDeleting,
  } = useMutationFiscalYear();

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { open, showModal, hideModal } = useModal();

  const [editingItem, setEditingItem] = useState<FiscalYear | null>(null);
  const [form] = Form.useForm<FiscalYearForm>();

  const colors = {
    pageBg: isDark ? "#131b2e" : "#eee8dd",
    text: isDark ? "#f5f5f5" : "#141414",
    secondaryText: isDark ? "#a6a6a6" : "#666666",
    inputBg: isDark ? "#0f1626" : "#ffffff",
    inputBorder: isDark ? "#2a3446" : "#d9d9d9",
    inputText: isDark ? "#f5f5f5" : "#141414",
    inputPlaceholder: isDark ? "#6b7280" : "#bfbfbf",
    modalBg: isDark ? "#1b2436" : "#ffffff",
    tagIdleBg: isDark ? "#2a3446" : "#fafafa",
    tagIdleBorder: isDark ? "#3a465c" : "#d9d9d9",
    tagIdleText: isDark ? "#c9c9c9" : "#595959",
  };

  const inputStyle = {
    background: colors.inputBg,
    borderColor: colors.inputBorder,
    color: colors.inputText,
  };

  const rows: FiscalYear[] = fiscalYears?.data ?? [];
  const pagination = fiscalYears?.pagination;

  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ active: true });
    showModal();
  };

  const handleEdit = (item: FiscalYear) => {
    setEditingItem(item);
    form.setFieldsValue({
      name_ad: item.name_ad,
      name_bs: item.name_bs,
      range: [dayjs(item.start_date_ad), dayjs(item.end_date_ad)],
      start_date_bs: item.start_date_bs,
      end_date_bs: item.end_date_bs,
      active: item.active,
    });
    showModal();
  };

  const handleClose = () => {
    form.resetFields();
    setEditingItem(null);
    hideModal();
  };

  // Picking AD dates fills in the BS dates; they stay editable.
  const handleRangeChange = (range: [Dayjs, Dayjs] | null) => {
    if (!range) return;
    form.setFieldsValue({
      start_date_bs: toBS(range[0]),
      end_date_bs: toBS(range[1]),
    });
  };

  const toPayload = (item: FiscalYear, active = item.active): FiscalYearPayload => ({
    name_ad: item.name_ad,
    name_bs: item.name_bs,
    start_date_ad: item.start_date_ad,
    end_date_ad: item.end_date_ad,
    start_date_bs: item.start_date_bs,
    end_date_bs: item.end_date_bs,
    active,
  });

  const onFinish = async (values: FiscalYearForm) => {
    const payload: FiscalYearPayload = {
      name_ad: values.name_ad,
      name_bs: values.name_bs ?? "",
      start_date_ad: values.range[0].format(DATE_FORMAT),
      end_date_ad: values.range[1].format(DATE_FORMAT),
      start_date_bs: values.start_date_bs ?? "",
      end_date_bs: values.end_date_bs ?? "",
      active: values.active,
    };

    try {
      if (editingItem) {
        await updateFiscalYear({ year_id: editingItem.year_id, payload });
        messageApi.success("Updated successfully.");
      } else {
        await addFiscalYear(payload);
        messageApi.success("Added successfully.");
      }
      handleClose();
    } catch {
      messageApi.error("Could not save. Please check the fields and try again.");
    }
  };

  const handleSelect = (item: FiscalYear) => {
    Modal.confirm({
      title: `Set ${item.name_ad || item.name_bs} as the current fiscal year?`,
      content:
        "New records will be recorded under this fiscal year. Existing records keep the year they were created in.",
      okText: "Yes, Set Current",
      onOk: async () => {
        try {
          await selectFiscalYear(item.year_id);
          messageApi.success("Current fiscal year updated.");
        } catch {
          messageApi.error("Failed to set the current fiscal year.");
        }
      },
    });
  };

  const handleActiveChange = async (item: FiscalYear, active: boolean) => {
    try {
      await updateFiscalYear({
        year_id: item.year_id,
        payload: toPayload(item, active),
      });
      messageApi.success(active ? "Fiscal year activated." : "Fiscal year deactivated.");
    } catch {
      messageApi.error("Failed to update status.");
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this fiscal year?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteFiscalYear(id);
          if (rows.length === 1 && page > 1) {
            setPage((prev) => prev - 1);
          }
          messageApi.success("Deleted successfully.");
        } catch (err) {
          const apiMessage = (
            err as { response?: { data?: { message?: string } } }
          )?.response?.data?.message;
          messageApi.error(apiMessage || "Failed to delete fiscal year.");
        }
      },
    });
  };

  const columns: ColumnsType<FiscalYear> = [
    {
      title: "S.N",
      key: "sn",
      width: 70,
      render: (_t, _r, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: "Fiscal Year",
      key: "name",
      render: (_: unknown, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: colors.text }}>
            {record.name_bs || record.name_ad}
          </Text>
          {record.name_bs && record.name_ad && (
            <Text style={{ color: colors.secondaryText }}>
              {record.name_ad}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Start Date (AD / BS)",
      key: "start",
      render: (_: unknown, record) => (
        <Text style={{ color: colors.secondaryText }}>
          {record.start_date_ad}
          {record.start_date_bs ? ` / ${record.start_date_bs}` : ""}
        </Text>
      ),
    },
    {
      title: "End Date (AD / BS)",
      key: "end",
      render: (_: unknown, record) => (
        <Text style={{ color: colors.secondaryText }}>
          {record.end_date_ad}
          {record.end_date_bs ? ` / ${record.end_date_bs}` : ""}
        </Text>
      ),
    },
    {
      title: "Current",
      dataIndex: "selected",
      key: "selected",
      width: 120,
      render: (selected: boolean) =>
        selected ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Current
          </Tag>
        ) : (
          <Tag
            style={{
              background: colors.tagIdleBg,
              borderColor: colors.tagIdleBorder,
              color: colors.tagIdleText,
            }}
          >
            —
          </Tag>
        ),
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      width: 150,
      render: (active: boolean, record) => (
        <Space>
          <Tag color={active ? "green" : "default"}>
            {active ? "Active" : "Inactive"}
          </Tag>
          <Switch
            size="small"
            checked={active}
            loading={isUpdating}
            // The current year has to stay active.
            disabled={!canUpdate || record.selected}
            onChange={(checked) => handleActiveChange(record, checked)}
          />
        </Space>
      ),
    },
    ...(canSelect || canUpdate || canDelete
      ? [
          {
            title: "Action",
            key: "action",
            width: 340,
            render: (_: unknown, record: FiscalYear) => (
              <Space>
                {canSelect && !record.selected && (
                  <Button
                    icon={<CheckCircleOutlined />}
                    loading={isSelecting}
                    onClick={() => handleSelect(record)}
                  >
                    Set Current
                  </Button>
                )}
                {canUpdate && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                  >
                    Edit
                  </Button>
                )}
                {canDelete && !record.selected && (
                  <Button
                    danger
                    type="primary"
                    icon={<DeleteOutlined />}
                    loading={isDeleting}
                    onClick={() => handleDelete(record.year_id)}
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
              Add Fiscal Year
            </Button>
          )}
        </div>

        <CustomTable
          rowKey="year_id"
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
              {editingItem ? "Edit Fiscal Year" : "Add Fiscal Year"}
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
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark="optional"
          >
            <div style={{ display: "flex", gap: 16 }}>
              <Form.Item
                label={<span style={{ color: colors.text }}>Name (AD)</span>}
                name="name_ad"
                style={{ flex: 1 }}
                rules={[
                  { required: true, message: "Please enter the name" },
                  { max: 100, message: "Cannot exceed 100 characters" },
                ]}
              >
                <Input size="large" placeholder="e.g. 2026/27" style={inputStyle} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: colors.text }}>Name (BS)</span>}
                name="name_bs"
                style={{ flex: 1 }}
                rules={[{ max: 100, message: "Cannot exceed 100 characters" }]}
              >
                <Input size="large" placeholder="e.g. 2083/84" style={inputStyle} />
              </Form.Item>
            </div>

            <Form.Item
              label={<span style={{ color: colors.text }}>Start &amp; End Date (AD)</span>}
              name="range"
              rules={[{ required: true, message: "Please select the dates" }]}
            >
              <DatePicker.RangePicker
                size="large"
                style={{ width: "100%" }}
                onChange={(range) =>
                  handleRangeChange(range as [Dayjs, Dayjs] | null)
                }
              />
            </Form.Item>

            <div style={{ display: "flex", gap: 16 }}>
              <Form.Item
                label={<span style={{ color: colors.text }}>Start Date (BS)</span>}
                name="start_date_bs"
                style={{ flex: 1 }}
                extra="Filled in from the AD date."
                rules={[{ max: 20, message: "Cannot exceed 20 characters" }]}
              >
                <Input size="large" placeholder="YYYY-MM-DD" style={inputStyle} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: colors.text }}>End Date (BS)</span>}
                name="end_date_bs"
                style={{ flex: 1 }}
                rules={[{ max: 20, message: "Cannot exceed 20 characters" }]}
              >
                <Input size="large" placeholder="YYYY-MM-DD" style={inputStyle} />
              </Form.Item>
            </div>

            <Form.Item
              label={<span style={{ color: colors.text }}>Active</span>}
              name="active"
              valuePropName="checked"
              style={{ marginBottom: 24 }}
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
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

export default FiscalYearManager;
