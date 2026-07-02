"use client";

import { useState } from "react";
import useModal from "@/app/hooks/useModalHook";
import ImageUpload from "@/app/components/ui/UploadImage";
import CustomTable from "@/app/components/ui/CustomTable";

import { Button, Form, Image, Input, Modal, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

const { TextArea } = Input;

interface Category {
  id: number;
  title: string;
  description: string;
  image?: string;
}

export default function Categories() {
  const { open, showModal, hideModal } = useModal();
  const [form] = Form.useForm();

  const [categories, setCategories] = useState<Category[]>([
    {
      id: 1,
      title: "Technology",
      description: "Technology related blogs and tutorials.",
      image: "https://picsum.photos/100?random=1",
    },
    {
      id: 2,
      title: "Sports",
      description: "Latest sports news and updates.",
      image: "https://picsum.photos/100?random=2",
    },
    {
      id: 3,
      title: "Travel",
      description: "Travel stories and destination guides.",
      image: "https://picsum.photos/100?random=3",
    },
  ]);

  const onFinish = (values: Omit<Category, "id">) => {
    const newCategory: Category = {
      id: Date.now(),
      ...values,
    };

    setCategories((prev) => [newCategory, ...prev]);

    console.log("Success:", newCategory);

    form.resetFields();
    hideModal();
  };

  const columns: ColumnsType<Category> = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 120,
      sorter:false,
      render: (image: string) =>
        image ? (
          <Image
            src={image}
            width={60}
            height={60}
            style={{
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        ) : (
          <Tag color="default">No Image</Tag>
        ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      sorter:false,
      render: (_, record) => (
        <Space>
          <Button type="primary" color="primary" onClick={() => console.log("Edit", record)}>
            Edit
          </Button>

          <Button
            danger
            type="primary"
            color="danger"
            onClick={() =>
              setCategories((prev) =>
                prev.filter((item) => item.id !== record.id),
              )
            }
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 20,
        }}
      >
        <Button type="primary" onClick={showModal}>
          Add Category
        </Button>
      </div>

      <CustomTable
        columns={columns}
        dataSource={categories}
        initialPageSize={10}
      />

      <Modal
        title={
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            Add Category
          </span>
        }
        open={open}
        footer={null}
        onCancel={() => {
          form.resetFields();
          hideModal();
        }}
        width={700}
        style={{ top: "5vh" }}
        bodyStyle={{
          maxHeight: "calc(80vh - 110px)",
          overflowY: "auto",
          paddingRight: 8,
        }}
        closable={{ "aria-label": "Custom Close Button" }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Title"
            name="title"
            rules={[
              {
                required: true,
                message: "Please enter a title",
              },
            ]}
          >
            <Input size="large" placeholder="Enter category title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: "Please enter a description",
              },
            ]}
          >
            <TextArea
              rows={4}
              showCount
              maxLength={250}
              placeholder="Enter category description"
            />
          </Form.Item>

          <Form.Item
            label="Category Image"
            name="image"
            rules={[
              {
                required: true,
                message: "Please upload an image",
              },
            ]}
          >
            <ImageUpload />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <Button
                onClick={() => {
                  form.resetFields();
                  hideModal();
                }}
              >
                Cancel
              </Button>

              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
