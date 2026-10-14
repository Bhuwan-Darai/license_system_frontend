"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Image,
  message,
  Pagination,
  Popconfirm,
  Result,
  Row,
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
import { useMutationBlog } from "./useMutationBlog";
import { useQueryBlog } from "./useQueryBlog";

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
  const { isAllowed } = useAuthContext();
  const canList = isAllowed(PERM.BLOG.LIST);
  const canAdd = isAllowed(PERM.BLOG.CREATE);
  const canUpdate = isAllowed(PERM.BLOG.EDIT);
  const canDelete = isAllowed(PERM.BLOG.DELETE);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingBlog, setViewingBlog] = useState<Blog | null>(null);
  // index into the post's images (cover first) while the preview is open
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const { deleteBlog, isDeleting } = useMutationBlog();

  const { blogs, isLoading, refetch } = useQueryBlog(canList);

  const handleEdit = (blog: Blog) => {
    router.push(`/dashboard/blog/${blog.blog_id}/edit`);
  };

  const handleDelete = async (blog: Blog) => {
    try {
      await deleteBlog(blog.blog_id);
      await message.success("Blog deleted.");
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

  if (!canList) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="You don't have permission to view this."
      />
    );
  }

  if (viewingBlog) {
    const contentImages = Array.from(
      viewingBlog.content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi),
      (m) => new DOMParser().parseFromString(m[1], "text/html").body.textContent ?? m[1],
    ).map((src) => new URL(src, window.location.href).href);
    const postImages = [
      ...(viewingBlog.cover_image
        ? [new URL(viewingBlog.cover_image, window.location.href).href]
        : []),
      ...contentImages,
    ];

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
          <Image.PreviewGroup
            items={postImages}
            preview={{
              open: previewIndex !== null,
              current: previewIndex ?? 0,
              onChange: (current) => setPreviewIndex(current),
              onOpenChange: (open) => {
                if (!open) setPreviewIndex(null);
              },
            }}
          />

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
              <Image
                src={viewingBlog.cover_image}
                alt={viewingBlog.title}
                preview={false}
                rootClassName="blog-cover"
                style={{ width: "100%", height: 380, objectFit: "cover", cursor: "zoom-in" }}
                onClick={() => setPreviewIndex(0)}
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
                className="quill-content blog-zoomable"
                dangerouslySetInnerHTML={{ __html: viewingBlog.content }}
                onClick={(e) => {
                  const img = e.target as HTMLElement;
                  if (img.tagName !== "IMG") return;
                  const i = postImages.indexOf((img as HTMLImageElement).src);
                  if (i >= 0) setPreviewIndex(i);
                }}
                style={{
                  color: "#262626",
                  fontSize: 16,
                  lineHeight: 1.8,
                }}
              />

              {(canUpdate || canDelete) && (
                <>
                  <Divider />

                  <Space>
                    {canUpdate && (
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(viewingBlog)}
                      >
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Popconfirm
                        title="Delete this blog?"
                        description="This action cannot be undone."
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(viewingBlog)}
                      >
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          loading={isDeleting}
                        >
                          Delete
                        </Button>
                      </Popconfirm>
                    )}
                  </Space>
                </>
              )}
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
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        {canAdd && (
          <Button
            type="primary"
            size="middle"
            onClick={() => router.push("/dashboard/blog/add")}
          >
            Add Blog
          </Button>
        )}
      </div>

      <Divider style={{ borderColor: "#e0e0e0" }} />

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}>Loading...</div>
      ) : blogData.length === 0 ? (
        <Empty description="No blog posts found" />
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {pagedBlogData.map((blog: Blog, index: number) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card
                  key={blog.blog_id}
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
                    canUpdate && (
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
                      </Button>
                    ),
                    canDelete && (
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
                      </Popconfirm>
                    ),
                  ].filter(Boolean)}
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

    </div>
  );
}
