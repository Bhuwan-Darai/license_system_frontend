"use client";
import { useEffect, useState } from "react";
import useModal from "@/app/hooks/useModalHook";
import CustomTable from "@/app/components/ui/CustomTable";

import { Button, Form, Input, Modal, Result, Space, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/app/utils/axios";
import { useQueryBlogCategoires } from "./useQueryBlogCategories";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";

const { TextArea } = Input;

interface BlogCategory {
  id: number | string;
  BlogCategoryID: string;
  Title: string;
  Description: string;
  Image?: string;
  ImagePath?: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt: string;
}

export default function BlogCategory() {
  const { isAllowed } = useAuthContext();
  const canList = isAllowed(PERM.BLOG_CATEGORY.LIST);
  const canAdd = isAllowed(PERM.BLOG_CATEGORY.ADD);
  const canUpdate = isAllowed(PERM.BLOG_CATEGORY.UPDATE);
  const canDelete = isAllowed(PERM.BLOG_CATEGORY.DELETE);
  const { open, showModal, hideModal } = useModal();
  const [form] = Form.useForm();
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(
    null,
  );

  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1); // reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { categories, pagination, isLoading } = useQueryBlogCategoires(
    page,
    pageSize,
    debouncedSearch,
    canList,
  );

  // Add Mutation
  const { mutateAsync: addCategory, isPending: isAdding } = useMutation({
    mutationFn: (payload: Omit<BlogCategory, "id">) =>
      api.post("/blog-category", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      message.success("Category added successfully!");
      form.resetFields();
      hideModal();
    },
    onError: () => {
      message.error("Failed to add category");
    },
  });

  // Update Mutation
  const { mutateAsync: updateCategory, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: Partial<BlogCategory>;
    }) => api.put(`/blog-category/${id}`, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      await message.success("Category updated successfully!");
      form.resetFields();
      hideModal();
      setEditingCategory(null);
    },
    onError: async () => {
      await message.error("Failed to update category");
    },
  });

  // Delete Mutation
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: (id: string | number) => api.delete(`/blog-category/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      await message.success("Category deleted successfully");
      // Deleting the last row on a page beyond page 1 would otherwise leave
      // the user stranded on a now-empty page.
      if (categories.length === 1 && page > 1) {
        setPage(page - 1);
      }
    },
    onError: async () => {
      await message.error("Failed to delete category");
    },
  });

  const onFinish = async (values: Omit<BlogCategory, "id">) => {
    if (editingCategory) {
      await updateCategory({
        id: editingCategory.BlogCategoryID,
        payload: values,
      });
    } else {
      await addCategory(values);
    }
  };

  const handleEdit = (record: BlogCategory) => {
    setEditingCategory(record);
    form.setFieldsValue({
      title: record.Title,
      description: record.Description,
    });
    showModal();
  };

  const handleDelete = (BlogCategoryID: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this category?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: () => deleteCategory(BlogCategoryID),
    });
  };

  const columns: ColumnsType<BlogCategory> = [
    {
      title: "S.N",
      render: (value, record, index) => (page - 1) * pageSize + index + 1,
    },
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
    ...(canUpdate || canDelete
      ? [
          {
            title: "Action",
            key: "action",
            width: 180,
            render: (_: unknown, record: BlogCategory) => (
              <Space>
                {canUpdate && (
                  <Button type="primary" onClick={() => handleEdit(record)}>
                    Edit
                  </Button>
                )}

                {canDelete && (
                  <Button
                    danger
                    type="primary"
                    loading={isDeleting}
                    onClick={() => handleDelete(record.BlogCategoryID)}
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

  const isSubmitting = isAdding || isUpdating;

  const handleSearch = (value: string) => {
    setSearch(value);
  };

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
    <div>
      {canAdd && (
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
            Add blog Category
          </Button>
        </div>
      )}

      <CustomTable
        columns={columns}
        dataSource={categories}
        loading={isLoading}
        manualPagination
        total={pagination?.total ?? 0}
        currentPage={page}
        initialPageSize={pageSize}
        onPageChange={(nextPage, nextPageSize) => {
          setPage(nextPage);
          setPageSize(nextPageSize);
        }}
        onSearch={handleSearch}
      />

      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            {editingCategory ? "Edit blog Category" : "Add blog Category"}
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
            <Input size="large" placeholder="Enter blog category" />
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
