"use client";

import { useState } from "react";
import { Button, Form, Input, message, Modal, Space } from "antd";
import type { ColumnsType } from "antd/es/table";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/app/utils/axios";
import useModal from "@/app/hooks/useModalHook";
import CustomTable from "@/app/components/ui/CustomTable";

const { TextArea } = Input;

export interface QuestionBankCategory {
  ID: number;
  QuestionBankCategoryID: string;
  Title: string;
  Description: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt: string;
  UpdatedBy?: string | null;
}

export interface ImageValue {
  url: string;
  path: string;
}

export interface QuestionBankCategoryFormValues {
  title: string;
  description: string;
}

export interface CreateQuestionBankCategoryPayload {
  QuestionBankCategoryId?: string;
  title: string;
  description: string;
}

export default function QuestionBankCategories() {
  const { open, showModal, hideModal } = useModal();
  const [form] = Form.useForm<QuestionBankCategoryFormValues>();
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedId, setSelectedId] = useState<string>("");

  const queryClient = useQueryClient();

  // add question bank category
  const { mutateAsync: add, isPending } = useMutation({
    mutationFn: (payload: CreateQuestionBankCategoryPayload) =>
      api.post("/question-bank-category", payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["question-bank-categories"],
      });

      message.success("Question bank category added successfully!");
    },
  });

  // delete question bank category
  const { mutateAsync: deleteQuestionBankCategory, isPending: deletePending } =
    useMutation({
      mutationFn: (id: string) => api.delete(`/question-bank-category/${id}`),

      onSuccess: () => {
        message.success("Question bank category deleted successfully");
        queryClient.invalidateQueries({
          queryKey: ["question-bank-categories"],
        });
      },
      onError: () => {
        message.error("Failed to delete question bank category");
      },
    });

  // get question bank categories
  const { data, isLoading, error } = useQuery({
    queryKey: ["question-bank-categories"],
    queryFn: async () => {
      const res = await api.get("/question-bank-category");
      return res.data?.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const { mutateAsync: update, isPending: isUpdatePending } = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: CreateQuestionBankCategoryPayload }) =>
      api.put(`/question-bank-category/${id}`, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["question-bank-categories"],
      });

      message.success("Question bank category updated successfully!");
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error</div>;
  }

  const handleEdit = async (value: any) => {
    console.log("value", value);
    showModal();
    setMode("edit")
    setSelectedId(value?.QuestionBankCategoryID);
    form.setFieldsValue({
      title: value?.Title,
      description: value?.Description,
    });
  };

  const onFinish = async (values: QuestionBankCategoryFormValues) => {
    const payload: CreateQuestionBankCategoryPayload = {
      ...values,
    };

    if (mode === "edit") {
      await update({ id: selectedId, payload });
    } else {
      await add(payload);
    }

    form.resetFields();
    hideModal();
  };

  const columns: ColumnsType<QuestionBankCategory> = [
    {
      title: "Question Bank Category",
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
      sorter: (a, b) => a.CreatedAt.localeCompare(b.CreatedAt),
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
            disabled={deletePending}
            type="primary"
            onClick={() => deleteQuestionBankCategory(record.QuestionBankCategoryID)}
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
          Add Question Bank Category
        </Button>
      </div>

      <CustomTable
        columns={columns}
        dataSource={data ?? []}
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
            Add Question Bank Category
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
        styles={{
          body: {
            maxHeight: "calc(80vh - 110px)",
            overflowY: "auto",
            paddingRight: 8,
          },
        }}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Question Bank Category"
            name="title"
            rules={[
              {
                required: true,
                message: "Please enter question bank category name",
              },
            ]}
          >
            <Input size="large" placeholder="Enter question bank category" />
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
              placeholder="Enter question bank category description"
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
                  hideModal();
                }}
              >
                Cancel
              </Button>

              <Button disabled={isPending} type="primary" htmlType="submit">
                Save Category
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
