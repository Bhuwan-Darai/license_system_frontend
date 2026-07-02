"use client";

import { useState } from "react";
import useModal from "@/app/hooks/useModalHook";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Pagination,
  Row,
  Select,
  Tag,
  Typography,
} from "antd";
import QuillEditor from "@/app/components/QuillEditor";

const { Paragraph } = Typography;

const categoryOptions = [
  { label: "Technology", value: "Technology" },
  { label: "Design", value: "Design" },
  { label: "Development", value: "Development" },
  { label: "Career", value: "Career" },
  { label: "Lifestyle", value: "Lifestyle" },
];

const categoryColors: Record<string, string> = {
  Technology: "blue",
  Design: "magenta",
  Development: "green",
  Career: "orange",
  Lifestyle: "purple",
};

// Dummy blog data
const dummyBlogs = [
  {
    id: 1,
    title: "Getting Started with Next.js",
    subtitle: "A beginner's guide to building React apps",
    category: "Development",
    content:
      "Next.js is a powerful React framework that enables server-side rendering, static site generation, and a host of other features out of the box. In this post, we walk through setting up your first project and understanding the file-based routing system.",
  },
  {
    id: 2,
    title: "Mastering TypeScript Generics",
    subtitle: "Write safer, more reusable code",
    category: "Development",
    content:
      "Generics allow you to write flexible, reusable components while still maintaining strong type safety. This article covers common patterns, constraints, and real-world examples to help you level up your TypeScript skills.",
  },
  {
    id: 3,
    title: "Designing with Ant Design",
    subtitle: "Building consistent UIs faster",
    category: "Design",
    content:
      "Ant Design provides a comprehensive set of high-quality React components. Learn how to customize themes, compose layouts, and build forms efficiently using the Ant Design system.",
  },
  {
    id: 4,
    title: "State Management in 2024",
    subtitle: "Comparing Redux, Zustand, and Context",
    category: "Technology",
    content:
      "Choosing the right state management solution can make or break your app's maintainability. We compare the trade-offs of Redux, Zustand, and React Context in real-world scenarios.",
  },
  {
    id: 5,
    title: "CSS-in-JS vs Utility Classes",
    subtitle: "Which styling approach wins in 2024?",
    category: "Design",
    content:
      "Styling React applications has never had more options. This post breaks down the pros and cons of CSS-in-JS libraries versus utility-first frameworks like Tailwind CSS.",
  },
  {
    id: 6,
    title: "Building Accessible Forms",
    subtitle: "Best practices for inclusive design",
    category: "Design",
    content:
      "Accessibility should never be an afterthought. Learn how to build forms that work seamlessly with screen readers, keyboard navigation, and assistive technologies.",
  },
  {
    id: 7,
    title: "API Design Principles",
    subtitle: "Building APIs developers love",
    category: "Technology",
    content:
      "A well-designed API can dramatically improve developer experience. We cover REST conventions, versioning strategies, and error handling best practices.",
  },
];

const PAGE_SIZE = 6;

export default function Blog() {
  const { open, showModal, hideModal } = useModal();
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);

  const onFinish = (values: any) => {
    console.log("Success:", values);
  };

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedBlogs = dummyBlogs.slice(startIndex, startIndex + PAGE_SIZE);

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
        <Button type="primary" size="medium" onClick={showModal}>
          Add Blog
        </Button>
      </div>

      <Divider style={{ borderColor: "#e0e0e0" }} />

      <Row gutter={[24, 24]}>
        {paginatedBlogs.map((blog) => (
          <Col xs={24} sm={12} md={8} key={blog.id}>
            <Card
              hoverable
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                border: "none",
                transition: "all 0.3s ease",
              }}
              title={
                <span
                  style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e" }}
                >
                  {blog.title}
                </span>
              }
              actions={[
                <Button type="link" key="read-more" style={{ fontWeight: 500 }}>
                  Read More
                </Button>,
              ]}
            >
              <Tag
                color={categoryColors[blog.category] || "default"}
                style={{
                  marginBottom: 12,
                  fontSize: 12,
                  padding: "2px 10px",
                  borderRadius: 4,
                }}
              >
                {blog.category}
              </Tag>

              {blog.subtitle && (
                <Paragraph
                  type="secondary"
                  style={{ marginBottom: 10, fontSize: 13 }}
                >
                  {blog.subtitle}
                </Paragraph>
              )}
              <Paragraph
                ellipsis={{ rows: 3 }}
                style={{ color: "#595959", fontSize: 14, lineHeight: 1.6 }}
              >
                {blog.content}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
        <Pagination
          current={currentPage}
          pageSize={PAGE_SIZE}
          total={dummyBlogs.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      <Modal
        title={<span style={{ fontSize: 18, fontWeight: 600 }}>Add Blog</span>}
        open={open}
        footer={
          <Button type="primary" htmlType="submit" size="medium">
            Submit
          </Button>
        }
        onCancel={hideModal}
        width={900}
        style={{ top: "5vh" }}
        bodyStyle={{
          maxHeight: "calc(80vh - 110px)",
          overflowY: "auto",
          paddingRight: 8,
        }}
        closable={{ "aria-label": "Custom Close Button" }}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input size="large" placeholder="Enter blog title" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select
              placeholder="Select a category"
              options={categoryOptions}
              size="large"
            />
          </Form.Item>

          <Form.Item label="Subtitle" name="subtitle">
            <Input.TextArea
              rows={3}
              showCount
              maxLength={100}
              placeholder="Short description..."
            />
          </Form.Item>

          <Form.Item label="Content" name="content">
            <QuillEditor />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
