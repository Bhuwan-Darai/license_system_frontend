"use client";

import { useEffect } from "react";
import { Button, Card, Form, message, Result, Spin, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import BlogFormFields, { BlogFormValues } from "./BlogFormFields";
import { useMutationBlog } from "./useMutationBlog";
import { useQueryBlog } from "./useQueryBlog";
import type { Blog } from "./Blog";

const { Title } = Typography;

/** Add form when `blogId` is omitted, edit form for that blog otherwise. */
export default function BlogEditor({ blogId }: { blogId?: string }) {
  const router = useRouter();
  const { isAllowed } = useAuthContext();
  const [form] = Form.useForm<BlogFormValues>();
  const { addBlog, updateBlog, isAdding, isUpdating } = useMutationBlog();

  const isEdit = !!blogId;
  const allowed = isAllowed(isEdit ? PERM.BLOG.EDIT : PERM.BLOG.CREATE);
  const { blogs, isLoading } = useQueryBlog(isEdit && allowed);
  const blog: Blog | undefined = isEdit
    ? (blogs?.data ?? []).find((b: Blog) => b.blog_id === blogId)
    : undefined;

  useEffect(() => {
    if (!blog) return;
    form.setFieldsValue({
      title: blog.title,
      subtitle: blog.subtitle,
      blog_category: blog.category.category_id,
      blog_content: blog.content,
      status: blog.status,
      cover_image: { url: blog.cover_image, path: blog.cover_image_path },
    });
  }, [blog, form]);

  if (!allowed) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="You don't have permission to do this."
      />
    );
  }

  if (isEdit && isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <Spin />
      </div>
    );
  }

  if (isEdit && !blog) {
    return (
      <Result
        status="404"
        title="Blog not found"
        extra={
          <Button onClick={() => router.push("/dashboard/blog")}>
            Back to all posts
          </Button>
        }
      />
    );
  }

  const goBack = () => router.push("/dashboard/blog");

  const onFinish = async (values: BlogFormValues) => {
    const payload = {
      title: values.title,
      subtitle: values.subtitle,
      cover_image: values.cover_image?.path,
      blog_category: values.blog_category,
      blog_content: values.blog_content,
      status: values.status,
    };

    try {
      if (isEdit) {
        await updateBlog({ id: blogId, payload });
      } else {
        await addBlog(payload);
      }
      goBack();
    } catch (error) {
      console.error("Failed to save blog:", error);
      message.error("Could not save the blog. Please try again.");
    }
  };

  return (
    <div style={{ padding: 24, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={goBack}
        style={{ marginBottom: 16, paddingLeft: 0 }}
      >
        Back to all posts
      </Button>

      <Card style={{ borderRadius: 12, border: "none" }}>
        <Title level={4} style={{ marginBottom: 24 }}>
          {isEdit ? "Edit Blog" : "Add Blog"}
        </Title>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <BlogFormFields form={form} />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={goBack}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isAdding || isUpdating}
            >
              {isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
