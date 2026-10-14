"use client";

import { Col, Form, FormInstance, Input, Row, Select } from "antd";
import ImageUpload from "../../ui/UploadImage";
import TextEditor from "../../ui/TextEditor";
import { ImageValue } from "../VehicleCagetory/VehicleCategories";
import { useQueryBlogCategoires } from "./Categories/useQueryBlogCategories";

export type BlogFormValues = {
  title: string;
  subtitle: string;
  cover_image: ImageValue;
  blog_category: string;
  blog_content: string;
  status: string;
};

type Category = { BlogCategoryID: string; Title: string };

/** The blog form inputs, shared by the add page and the edit modal. */
export default function BlogFormFields({
  form,
}: {
  form: FormInstance<BlogFormValues>;
}) {
  const { categories, isLoading: categoriesLoading } =
    useQueryBlogCategoires();

  return (
    <>
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
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select
              placeholder="Select a category"
              loading={categoriesLoading}
              options={categories?.map((cat: Category) => ({
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
        <ImageUpload value={form.getFieldValue("cover_image") as ImageValue} />
      </Form.Item>

      <Form.Item
        label="Content"
        name="blog_content"
        rules={[{ required: true, message: "Please enter blog content" }]}
      >
        <TextEditor />
      </Form.Item>
    </>
  );
}
