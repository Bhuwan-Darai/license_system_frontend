"use client";
import { Button, Form, Input, Modal, Space } from "antd";
import type { ColumnsType } from "antd/es/table";

import useModal from "@/app/hooks/useModalHook";
import CustomTable from "@/app/components/ui/CustomTable";
import { useMutationIshihara } from "./useMutationIshihara";
import { useQueryIshihara } from "./useQueryIshihara";

const { TextArea } = Input;

interface IshiharaCategory {
  id: number | string;
  IshiharaCategoryID: string;
  Title: string;
  Description: string;
  Image?: string;
  ImagePath?: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt: string;
}

export default function IshiharaCategory() {
  const { open, showModal, hideModal } = useModal();
  const [form] = Form.useForm();

  const {
    addCategory,
    updateCategory,
    deleteCategory,
    isAdding,
    isUpdating,
    isDeleting,
    setEditingCategory,
    editingCategory,
  } = useMutationIshihara();
  const { categories, isLoading } = useQueryIshihara();

  const onFinish = async (values: Omit<IshiharaCategory, "id">) => {
    if (editingCategory) {
      await updateCategory({
        id: editingCategory.IshiharaCategoryID,
        payload: values,
      });
    } else {
      await addCategory(values);
      form.resetFields();
    }
    hideModal();
  };

  const handleEdit = (record: IshiharaCategory) => {
    setEditingCategory(record);
    form.setFieldsValue({
      title: record.Title,
      description: record.Description,
    });
    showModal();
  };

  const handleDelete = (IshiharaCategoryID: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this category?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: () => deleteCategory(IshiharaCategoryID),
    });
  };

  const columns: ColumnsType<IshiharaCategory> = [
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
            onClick={() => handleDelete(record.IshiharaCategoryID)}
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
          Add Ishihara Category
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
            {editingCategory
              ? "Edit Ishihara Category"
              : "Add Ishihara Category"}
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
            <Input size="large" placeholder="Enter Ishihara category" />
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
              showCount
              maxLength={250}
              placeholder="Enter category description"
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
