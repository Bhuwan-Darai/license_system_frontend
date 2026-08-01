"use client";
import { useState } from "react";
import useModal from "@/app/hooks/useModalHook";
import CustomTable from "@/app/components/ui/CustomTable";

import { Button, Form, Input, Modal, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSignalCategoryMutation } from "./useSignalCategoryMutation";
import { useSignalCategoryQuery } from "./useSignalCategoryQuery";

const { TextArea } = Input;

export interface SignalCategory {
  id: number | string;
  TrafficSignalCategoryID: string;
  Title: string;
  Description: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt: string;
}

export default function SignalCategory() {
  const { open, showModal, hideModal } = useModal();
  const [form] = Form.useForm();
  const [editingCategory, setEditingCategory] = useState<SignalCategory | null>(
    null,
  );

  const {
    addCategory,
    updateCategory,
    deleteCategory,
    isAdding,
    isUpdating,
    isDeleting,
  } = useSignalCategoryMutation();

  const { categories, isLoading } = useSignalCategoryQuery();

  const onFinish = async (
    values: Omit<SignalCategory, "TrafficSignalCategoryID">,
  ) => {
    if (editingCategory) {
      await updateCategory({
        id: editingCategory.TrafficSignalCategoryID,
        payload: values,
      });
    } else {
      await addCategory(values);
    }
    form.resetFields();
    hideModal();
  };

  const handleEdit = (record: SignalCategory) => {
    setEditingCategory(record);
    form.setFieldsValue({
      title: record.Title,
      description: record.Description,
    });
    showModal();
  };

  const handleDelete = (TrafficSignalCategoryID: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this category?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: () => deleteCategory(TrafficSignalCategoryID),
    });
  };

  const columns: ColumnsType<SignalCategory> = [
    {
      title: "Category",
      dataIndex: "Title",
      key: "Title",
      sorter: (a, b) => a.Title.localeCompare(b.Title),
    },
    {
      title: "Description",
      dataIndex: "Description",
      key: "Description",
      ellipsis: true,
    },
    {
      title: "Created At",
      dataIndex: "CreatedAt",
      key: "CreatedAt",
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Edit
          </Button>

          <Button
            danger
            type="primary"
            loading={isDeleting}
            onClick={() => handleDelete(record.TrafficSignalCategoryID)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const isSubmitting = isAdding || isUpdating;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 20,
        }}
      >
        <Button
          type="primary"
          onClick={() => {
            setEditingCategory(null);
            form.resetFields();
            showModal();
          }}
        >
          Add Signal Category
        </Button>
      </div>

      <CustomTable
        columns={columns}
        dataSource={categories}
        initialPageSize={10}
        loading={isLoading}
      />

      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            {editingCategory ? "Edit Signal Category" : "Add Signal Category"}
          </span>
        }
        open={open}
        footer={null}
        onCancel={() => {
          form.resetFields();
          setEditingCategory(null);
          hideModal();
        }}
        width={700}
        style={{ top: "5vh" }}
        styles={{
          body: {
            maxHeight: "calc(80vh - 110px)",
            overflowY: "auto",
            paddingRight: 8,
          },
        }}
        destroyOnHidden={true}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Category Name"
            name="title"
            rules={[
              {
                required: true,
                message: "Please enter category name",
              },
            ]}
          >
            <Input size="large" placeholder="Enter signal category" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: "Please enter description",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter signal category description"
            />
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
                  setEditingCategory(null);
                  hideModal();
                }}
              >
                Cancel
              </Button>

              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {editingCategory ? "Update Category" : "Save Category"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
