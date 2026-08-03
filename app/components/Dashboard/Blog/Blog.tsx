"use client";

import { useState } from "react";
import useModal from "@/app/hooks/useModalHook";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
} from "@ant-design/icons";
import QuillEditor from "@/app/components/QuillEditor";
import ImageUpload from "../../ui/UploadImage";
import { useMutationBlog } from "./useMutationBlog";
import { useQueryBlog } from "./useQueryBlog";
import { useQueryBlogCategoires } from "./Categories/useQueryBlogCategories";
import { ImageValue } from "../VehicleCagetory/VehicleCategories";

const { Paragraph, Title, Text } = Typography;

export type Blog = {
  id: number;
  blog_id: string;
  category: {
    category_id: string;
    title: string;
  };
  title: string;
  cover_image: string;
  cover_image_path?: string;
  subtitle: string;
  content: string;
  status: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by?: string;
};

export type BlogCategory = {
  ID: number;
  BlogCategoryID: string;
  Title: string;
  Description: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt: string;
  UpdatedBy: string;
};

const categoryColors: Record<string, string> = {
  Technology: "blue",
  Design: "magenta",
  Development: "green",
  Career: "orange",
  Lifestyle: "purple",
};

type onFinishPayload = {
  title: string;
  subtitle: string;
  cover_image: ImageValue;
  blog_category: string;
  blog_content: string;
  status: string;
};

const PAGE_SIZE = 6;

const formatDate = (iso: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
};

export default function BlogList() {
  const { open, showModal, hideModal } = useModal();
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingBlog, setViewingBlog] = useState<Blog | null>(null);

  const {
    addBlog,
    updateBlog,
    deleteBlog,
    isAdding,
    isUpdating,
    isDeleting,
    setEditingBlog,
    editingBlog,
  } = useMutationBlog();

  const { blogs, isLoading, refetch } = useQueryBlog();
  const { categories, isLoading: blogCategoryLoading } =
    useQueryBlogCategoires();

  const onFinish = async (values: onFinishPayload) => {
    const payload = {
      title: values.title,
      subtitle: values.subtitle,
      cover_image: values?.cover_image?.path,
      blog_category: values.blog_category,
      blog_content: values.blog_content,
      status: values.status,
    };

    try {
      if (editingBlog) {
        await updateBlog({
          id: editingBlog.blog_id,
          payload,
        });
        message.success("Blog updated.");
      } else {
        await addBlog(payload);
        message.success("Blog created.");
      }

      form.resetFields();
      setEditingBlog(null);
      hideModal();
      refetch(); // Refresh the list
    } catch (error) {
      console.error("Failed to save blog:", error);
      message.error("Could not save the blog. Please try again.");
    }
  };

  const handleEdit = (blog: Blog) => {
    form.setFieldsValue({
      title: blog.title,
      subtitle: blog.subtitle,
      blog_category: blog.category.category_id,
      blog_content: blog.content,
      status: blog.status,
      cover_image: { url: blog.cover_image, path: blog.cover_image_path },
    });
    showModal();
  };

  const handleDelete = async (blog: Blog) => {
    try {
      await deleteBlog(blog.blog_id);
      message.success("Blog deleted.");
      if (viewingBlog?.blog_id === blog.blog_id) {
        setViewingBlog(null);
      }
      refetch();
    } catch (error) {
      console.error("Failed to delete blog:", error);
      message.error("Could not delete the blog. Please try again.");
    }
  };

  const blogData: Blog[] = blogs?.data || [];

  const pagedBlogData = blogData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  if (viewingBlog) {
    return (
      <div
        style={{
          backgroundColor: "#f5f7fa",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            maxWidth: "100%",
            margin: "0 auto",
            padding: "24px 24px 64px",
          }}
        >
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => setViewingBlog(null)}
            style={{ marginBottom: 16, paddingLeft: 0 }}
          >
            Back to all posts
          </Button>

          <Card
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
            styles={{ body: { padding: 0 } }}
          >
            {viewingBlog.cover_image && (
              <div
                style={{
                  width: "100%",
                  height: 380,
                  backgroundImage: `url(${viewingBlog.cover_image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}

            <div style={{ padding: "36px 40px 48px" }}>
              <Space style={{ marginBottom: 16 }}>
                <Tag
                  color={categoryColors[viewingBlog.category.title] || "blue"}
                  style={{ fontSize: 12, padding: "3px 12px", borderRadius: 4 }}
                >
                  {viewingBlog.category.title}
                </Tag>
                <Tag
                  color={
                    viewingBlog.status === "PUBLISHED" ? "success" : "default"
                  }
                >
                  {viewingBlog.status === "PUBLISHED" ? "Published" : "Draft"}
                </Tag>
              </Space>

              <Title level={1} style={{ marginBottom: 8, fontSize: 36 }}>
                {viewingBlog.title}
              </Title>

              {viewingBlog.subtitle && (
                <Paragraph
                  type="secondary"
                  style={{ fontSize: 18, marginBottom: 20 }}
                >
                  {viewingBlog.subtitle}
                </Paragraph>
              )}

              <Space size={20} style={{ marginBottom: 8, color: "#8c8c8c" }}>
                <Space size={6}>
                  <Avatar size={22} icon={<UserOutlined />} />
                  <Text type="secondary">
                    {viewingBlog.created_by || "Unknown"}
                  </Text>
                </Space>
                <Space size={6}>
                  <CalendarOutlined />
                  <Text type="secondary">
                    {formatDate(viewingBlog.created_at)}
                  </Text>
                </Space>
              </Space>

              <Divider />

              <div
                className="quill-content"
                dangerouslySetInnerHTML={{ __html: viewingBlog.content }}
                style={{
                  color: "#262626",
                  fontSize: 16,
                  lineHeight: 1.8,
                }}
              />

              <Divider />

              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(viewingBlog)}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete this blog?"
                  description="This action cannot be undone."
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => handleDelete(viewingBlog)}
                >
                  <Button danger icon={<DeleteOutlined />} loading={isDeleting}>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ========== GRID VIEW ==========
  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Typography.Title level={3} style={{ margin: 0, color: "#1a1a2e" }}>
          Blog Posts
        </Typography.Title>
        <Button type="primary" size="middle" onClick={showModal}>
          Add Blog
        </Button>
      </div>

      <Divider style={{ borderColor: "#e0e0e0" }} />

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}>Loading...</div>
      ) : blogData.length === 0 ? (
        <Empty description="No blog posts found" />
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {pagedBlogData.map((blog: Blog) => (
              <Col xs={24} sm={12} md={8} key={blog.blog_id}>
                <Card
                  hoverable
                  onClick={() => setViewingBlog(blog)}
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "none",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  styles={{ body: { padding: 16 } }}
                  cover={
                    blog.cover_image ? (
                      <div
                        style={{
                          height: 160,
                          backgroundImage: `url(${blog.cover_image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: 160,
                          background:
                            "linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)",
                        }}
                      />
                    )
                  }
                  actions={[
                    <Button
                      type="link"
                      key="edit"
                      style={{ fontWeight: 500 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(blog);
                      }}
                    >
                      <EditOutlined /> Edit
                    </Button>,
                    <Popconfirm
                      key="delete"
                      title="Delete this blog?"
                      description="This action cannot be undone."
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        handleDelete(blog);
                      }}
                      onCancel={(e) => e?.stopPropagation()}
                    >
                      <Button
                        type="link"
                        danger
                        loading={isDeleting}
                        style={{ fontWeight: 500 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DeleteOutlined /> Delete
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <div style={{ marginBottom: 10 }}>
                    <Tag
                      color={categoryColors[blog.category.title] || "blue"}
                      style={{
                        fontSize: 12,
                        padding: "2px 10px",
                        borderRadius: 4,
                      }}
                    >
                      {blog.category.title}
                    </Tag>
                    <Tag
                      color={
                        blog.status === "PUBLISHED" ? "success" : "default"
                      }
                    >
                      {blog.status === "PUBLISHED" ? "Published" : "Draft"}
                    </Tag>
                  </div>

                  <Title
                    level={5}
                    style={{
                      marginBottom: 6,
                      color: "#1a1a2e",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {blog.title}
                  </Title>

                  {blog.subtitle && (
                    <Paragraph
                      type="secondary"
                      style={{ marginBottom: 10, fontSize: 13 }}
                      ellipsis={{ rows: 2 }}
                    >
                      {blog.subtitle}
                    </Paragraph>
                  )}

                  <div
                    className="quill-content"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                    style={{
                      color: "#595959",
                      fontSize: 14,
                      lineHeight: 1.6,
                      maxHeight: 60,
                      overflow: "hidden",
                    }}
                  />

                  <Text
                    type="secondary"
                    style={{ display: "block", marginTop: 10, fontSize: 12 }}
                  >
                    <CalendarOutlined /> {formatDate(blog.created_at)}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>

          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 32 }}
          >
            <Pagination
              current={currentPage}
              pageSize={PAGE_SIZE}
              total={blogData.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        </>
      )}

      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            {editingBlog ? "Edit Blog" : "Add Blog"}
          </span>
        }
        open={open}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button
              onClick={() => {
                form.resetFields();
                setEditingBlog(null);
                hideModal();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isAdding || isUpdating}
              onClick={() => form.submit()}
            >
              {editingBlog ? "Update" : "Create"}
            </Button>
          </div>
        }
        onCancel={() => {
          form.resetFields();
          setEditingBlog(null);
          hideModal();
        }}
        width={900}
        style={{ top: "5vh" }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input size="large" placeholder="Enter blog title" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Category"
                name="blog_category"
                rules={[
                  { required: true, message: "Please select a category" },
                ]}
              >
                <Select
                  placeholder="Select a category"
                  loading={blogCategoryLoading}
                  options={categories?.map((cat: BlogCategory) => ({
                    value: cat.BlogCategoryID,
                    label: cat.Title,
                  }))}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select a status" }]}
              >
                <Select
                  placeholder="Select a status"
                  options={[
                    { value: "DRAFT", label: "Draft" },
                    { value: "PUBLISHED", label: "Published" },
                  ]}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Subtitle" name="subtitle">
            <Input.TextArea
              rows={3}
              showCount
              maxLength={100}
              placeholder="Short description..."
            />
          </Form.Item>

          <Form.Item label="Cover Image" name="cover_image">
            <ImageUpload
              value={form.getFieldValue("cover_image") as ImageValue}
            />
          </Form.Item>

          <Form.Item
            label="Content"
            name="blog_content"
            rules={[{ required: true, message: "Please enter blog content" }]}
          >
            <QuillEditor />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
