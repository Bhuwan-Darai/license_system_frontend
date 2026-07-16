"use client";

import { Button, Form, Image, Input, message, Modal, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/app/utils/axios";

import useModal from "@/app/hooks/useModalHook";
import ImageUpload from "@/app/components/ui/UploadImage";
import CustomTable from "@/app/components/ui/CustomTable";
import { getImageUrl } from "@/app/utils/supabase";
import { useState } from "react";

const { TextArea } = Input;

interface VehicleCategory {
  ID: number;
  VehicleCategoryID: string;
  Title: string;
  Description: string;
  Image: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt: string;
  UpdatedBy?: string | null;
}

export interface ImageValue {
  url: string;
  path: string;
}

interface VehicleCategoryFormValues {
  title: string;
  description: string;
  image?: ImageValue;
}

interface CreateVehicleCategoryPayload {
  vehicleCategoryId?: string;
  title: string;
  description: string;
  image?: string;
}

export default function VehicleCategories() {
  const { open, showModal, hideModal } = useModal();
  const [form] = Form.useForm<VehicleCategoryFormValues>();
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedId, setSelectedId] = useState<string>("");

  const queryClient = useQueryClient();

  // add vehicle category
  const { mutateAsync: add, isPending } = useMutation({
    mutationFn: (payload: CreateVehicleCategoryPayload) =>
      api.post("/vehicle-category", payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicle-categories"],
      });

      message.success("Vehicle category added successfully!");
    },
  });

  // delete vehicle category
  const { mutateAsync: deleteVehicleCategory, isPending: deletePending } =
    useMutation({
      mutationFn: (id: string) => api.delete(`/vehicle-category/${id}`),

      onSuccess: () => {
        message.success("Vehicle category deleted successfully");
        queryClient.invalidateQueries({
          queryKey: ["vehicle-categories"],
        });
      },
      onError: () => {
        message.error("Failed to delete vehicle category");
      },
    });

  // get vehicle categories
  const { data, isLoading, error } = useQuery({
    queryKey: ["vehicle-categories"],
    queryFn: async () => {
      const res = await api.get("/vehicle-category");
      return res.data?.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const { mutateAsync: update, isPending: isUpdatePending } = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: CreateVehicleCategoryPayload }) =>
      api.put(`/vehicle-category/${id}`, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicle-categories"],
      });

      message.success("Vehicle category updated successfully!");
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
    setSelectedId(value?.VehicleCategoryID);
    const url = await getImageUrl(value.ImagePath);
    form.setFieldsValue({
      title: value?.Title,
      description: value?.Description,
      image: {
        url: url,
        path: value.ImagePath,
      }
    });
  };

  const onFinish = async (values: VehicleCategoryFormValues) => {
    const payload: CreateVehicleCategoryPayload = {
      ...values,
      image: values.image?.path,
    };

    if (mode === "edit") {
      await update({ id: selectedId, payload });
    } else {
      await add(payload);
    }

    form.resetFields();
    hideModal();
  };

  const columns: ColumnsType<VehicleCategory> = [
    {
      title: "Image",
      dataIndex: "Image",
      key: "Image",
      width: 120,
      render: (image: string) =>
        image ? (
          <Image
            alt="image"
            src={image}
            width={60}
            height={60}
            style={{
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        ) : (
          <Tag>No Image</Tag>
        ),
    },
    {
      title: "Vehicle Category",
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
            onClick={() => deleteVehicleCategory(record.VehicleCategoryID)}
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
          Add Vehicle Category
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
            Add Vehicle Category
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
            label="Vehicle Category"
            name="title"
            rules={[
              {
                required: true,
                message: "Please enter vehicle category name",
              },
            ]}
          >
            <Input size="large" placeholder="Enter vehicle category" />
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
              placeholder="Enter vehicle category description"
            />
          </Form.Item>

          <Form.Item
            label="Category Image"
            name="image"
            rules={[
              {
                required: true,
                message: "Please upload category image",
              },
            ]}
          >
            <ImageUpload value={form.getFieldValue("image") as ImageValue} />
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
