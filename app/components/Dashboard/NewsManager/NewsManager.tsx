"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Result,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import CustomTable from "@/app/components/ui/CustomTable";
import ImageUpload from "@/app/components/ui/UploadImage";
import useModal from "@/app/hooks/useModalHook";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import { News, NewsStatus, NewsTag, useMutationNews, useQueryNews } from "./useNews";

const { Text } = Typography;

const TAG_OPTIONS: { value: NewsTag; label: string }[] = [
  { value: "NEWS", label: "News" },
  { value: "NOTICE", label: "Notice" },
  { value: "SCHEDULE", label: "Schedule" },
  { value: "UPDATE", label: "Update" },
];

type ImageValue = { url: string; path: string };

type FormValues = {
  title: string;
  content: string;
  tag: NewsTag;
  status: NewsStatus;
  image?: ImageValue;
  send_notification: boolean;
};

const NewsManager: React.FC = () => {
  const { isAllowed } = useAuthContext();
  const canList = isAllowed(PERM.NEWS.LIST);
  const canAdd = isAllowed(PERM.NEWS.ADD);
  const canUpdate = isAllowed(PERM.NEWS.UPDATE);
  const canDelete = isAllowed(PERM.NEWS.DELETE);
  const [messageApi, contextHolder] = message.useMessage();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useQueryNews(page, pageSize, debouncedSearch, canList);
  const { addNews, updateNews, deleteNews, isAdding, isUpdating, isDeleting } =
    useMutationNews();

  const { open, showModal, hideModal } = useModal();
  const [editing, setEditing] = useState<News | null>(null);
  const [form] = Form.useForm<FormValues>();
  const status = Form.useWatch("status", form);

  const items: News[] = data?.data ?? [];

  const handleCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ tag: "NEWS", status: "PUBLISHED", send_notification: true });
    showModal();
  };

  const handleEdit = (item: News) => {
    setEditing(item);
    form.setFieldsValue({
      title: item.title,
      content: item.content,
      tag: item.tag,
      status: item.status,
      image: item.image_path ? { url: item.image, path: item.image_path } : undefined,
      send_notification: !item.notified_at,
    });
    showModal();
  };

  const handleClose = () => {
    form.resetFields();
    setEditing(null);
    hideModal();
  };

  const onFinish = async (values: FormValues) => {
    const payload = {
      title: values.title,
      content: values.content,
      tag: values.tag,
      status: values.status,
      image: values.image?.path ?? "",
      send_notification: values.status === "PUBLISHED" && !!values.send_notification,
    };
    try {
      if (editing) {
        await updateNews({ id: editing.news_id, payload });
        messageApi.success("News updated successfully.");
      } else {
        await addNews(payload);
        messageApi.success(
          payload.send_notification
            ? "News published and notification sent."
            : "News saved successfully.",
        );
      }
      handleClose();
    } catch {
      messageApi.error("Failed to save news.");
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Delete this news?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        await deleteNews(id);
        if (items.length === 1 && page > 1) setPage((p) => p - 1);
        messageApi.success("News deleted successfully.");
      },
    });
  };

  const columns: ColumnsType<News> = [
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
      render: (title: string) => <Text strong>{title}</Text>,
    },
    {
      title: "Type",
      dataIndex: "tag",
      key: "tag",
      width: 110,
      render: (tag: NewsTag) => <Tag color="blue">{tag}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s: NewsStatus) =>
        s === "PUBLISHED" ? <Tag color="green">Published</Tag> : <Tag>Draft</Tag>,
    },
    {
      title: "Notification",
      key: "notified_at",
      width: 150,
      render: (_: unknown, r: News) =>
        r.notified_at ? (
          <Tag color="purple">Sent {new Date(r.notified_at).toLocaleDateString()}</Tag>
        ) : (
          <Text type="secondary">Not sent</Text>
        ),
    },
    {
      title: "Published",
      dataIndex: "published_at",
      key: "published_at",
      width: 130,
      render: (v?: string) => (v ? new Date(v).toLocaleDateString() : "—"),
    },
    ...(canUpdate || canDelete
      ? [
          {
            title: "Action",
            key: "action",
            width: 180,
            render: (_: unknown, record: News) => (
              <Space>
                {canUpdate && (
                  <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button
                    danger
                    type="primary"
                    icon={<DeleteOutlined />}
                    loading={isDeleting}
                    onClick={() => handleDelete(record.news_id)}
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

  if (error) return <Result title="Something went wrong" />;
  if (!canList) {
    return <Result status="403" title="403" subTitle="You do not have permission to view this." />;
  }

  const alreadyNotified = !!editing?.notified_at;

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        {canAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add News
          </Button>
        )}
      </div>

      <CustomTable
        rowKey="news_id"
        columns={columns}
        dataSource={items}
        loading={isLoading}
        manualPagination
        total={data?.pagination?.total ?? 0}
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
        title={editing ? "Edit News" : "Add News"}
        open={open}
        footer={null}
        onCancel={handleClose}
        centered
        width={600}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional">
          <Form.Item
            label="Title"
            name="title"
            rules={[
              { required: true, message: "Please enter a title" },
              { max: 255, message: "Title cannot exceed 255 characters" },
            ]}
          >
            <Input size="large" placeholder="e.g. Written exam pattern" />
          </Form.Item>

          <Form.Item
            label="Content"
            name="content"
            rules={[{ required: true, message: "Please enter the content" }]}
          >
            <Input.TextArea rows={6} placeholder="Write the news or notice" />
          </Form.Item>

          <Space size="large" align="start" style={{ width: "100%" }}>
            <Form.Item label="Type" name="tag" rules={[{ required: true }]}>
              <Select style={{ width: 160 }} options={TAG_OPTIONS} />
            </Form.Item>
            <Form.Item label="Status" name="status" rules={[{ required: true }]}>
              <Select
                style={{ width: 160 }}
                options={[
                  { value: "PUBLISHED", label: "Published" },
                  { value: "DRAFT", label: "Draft" },
                ]}
              />
            </Form.Item>
          </Space>

          <Form.Item label="Image (optional)" name="image">
            <ImageUpload width={240} height={120} />
          </Form.Item>

          {status === "PUBLISHED" && (
            <Form.Item
              label="Send push notification to the mobile app"
              name="send_notification"
              valuePropName="checked"
              extra={
                alreadyNotified
                  ? "A notification was already sent for this item and will not be sent again."
                  : "Users with the app installed get a notification when this is published."
              }
            >
              <Switch disabled={alreadyNotified} />
            </Form.Item>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isAdding || isUpdating}>
              {editing ? "Update" : "Add"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default NewsManager;
